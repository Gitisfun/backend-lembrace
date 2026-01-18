/**
 * promotion-code controller
 */

import { factories } from '@strapi/strapi';

// Bilingual messages
const messages = {
  codeNotFound: {
    en: 'Promotion code not found',
    nl: 'Promotiecode niet gevonden',
  },
  codeNotActive: {
    en: 'Promotion code is not active',
    nl: 'Promotiecode is niet actief',
  },
  codeAlreadyUsed: {
    en: 'You have already used this promotion code',
    nl: 'Je hebt deze promotiecode al gebruikt',
  },
  productNotFound: {
    en: 'Product not found',
    nl: 'Product niet gevonden',
  },
  codeNotApplicable: {
    en: 'Promotion code does not apply to this product',
    nl: 'Promotiecode is niet van toepassing op dit product',
  },
  codeAppliedToCategory: (name: string) => ({
    en: `Promotion code applied to category: ${name}`,
    nl: `Promotiecode toegepast op categorie: ${name}`,
  }),
  codeAppliedToSubcategory: (name: string) => ({
    en: `Promotion code applied to subcategory: ${name}`,
    nl: `Promotiecode toegepast op subcategorie: ${name}`,
  }),
  codeAppliedToProduct: (name: string) => ({
    en: `Promotion code applied to product: ${name}`,
    nl: `Promotiecode toegepast op product: ${name}`,
  }),
};

export default factories.createCoreController('api::promotion-code.promotion-code', ({ strapi }) => ({
  async validate(ctx) {
    const { code, productId, email } = ctx.request.body;

    // Validate input
    if (!code || !productId) {
      return ctx.badRequest('Missing required fields: code and productId');
    }

    try {
      // Find the promotion code
      const promotionCodes = await strapi.documents('api::promotion-code.promotion-code').findMany({
        filters: { code: { $eqi: code } },
        populate: ['categories', 'subcategories', 'products'],
        status: 'published',
      });

      if (!promotionCodes || promotionCodes.length === 0) {
        return ctx.send({
          success: false,
          message: messages.codeNotFound,
        });
      }

      const promotionCode = promotionCodes[0];

      // Check if promotion is active and within valid date range
      const now = new Date();
      const startDate = new Date(promotionCode.startDate);
      const endDate = new Date(promotionCode.endDate);

      if (!promotionCode.isActive || now < startDate || now > endDate) {
        return ctx.send({
          success: false,
          message: messages.codeNotActive,
        });
      }

      // Check if customer has already used this promotion code (only if email is provided)
      if (email) {
        const existingUsage = await strapi.documents('api::promotion-code-usage.promotion-code-usage').findMany({
          filters: {
            customerId: { $eqi: email },
            promotionCode: { documentId: { $eq: promotionCode.documentId } },
          },
        });

        if (existingUsage && existingUsage.length > 0) {
          return ctx.send({
            success: false,
            message: messages.codeAlreadyUsed,
          });
        }
      }

      // Find the product with its subcategory and category
      const product = await strapi.documents('api::product.product').findOne({
        documentId: productId,
        populate: {
          subcategory: {
            populate: ['category'],
          },
        },
      });

      if (!product) {
        return ctx.send({
          success: false,
          message: messages.productNotFound,
        });
      }

      // Check if promotion applies to the product's category (broadest level first)
      if (product.subcategory?.category) {
        const categoryMatch = promotionCode.categories?.find(
          (c) => c.documentId === product.subcategory.category.documentId
        );

        if (categoryMatch) {
          return ctx.send({
            success: true,
            message: messages.codeAppliedToCategory(categoryMatch.label),
            discount: promotionCode.discount,
            code: promotionCode.code,
            promotionCodeId: promotionCode.documentId,
            appliedAt: 'category',
            appliedToId: product.subcategory.category.documentId,
            appliedToName: categoryMatch.label,
          });
        }
      }

      // Check if promotion applies to the product's subcategory
      if (product.subcategory) {
        const subcategoryMatch = promotionCode.subcategories?.find(
          (s) => s.documentId === product.subcategory.documentId
        );

        if (subcategoryMatch) {
          return ctx.send({
            success: true,
            message: messages.codeAppliedToSubcategory(subcategoryMatch.label),
            discount: promotionCode.discount,
            code: promotionCode.code,
            promotionCodeId: promotionCode.documentId,
            appliedAt: 'subcategory',
            appliedToId: product.subcategory.documentId,
            appliedToName: subcategoryMatch.label,
          });
        }
      }

      // Check if promotion applies to this product directly (most specific level)
      const productMatch = promotionCode.products?.find(
        (p) => p.documentId === productId
      );

      if (productMatch) {
        return ctx.send({
          success: true,
          message: messages.codeAppliedToProduct(productMatch.name),
          discount: promotionCode.discount,
          code: promotionCode.code,
          promotionCodeId: promotionCode.documentId,
          appliedAt: 'product',
          appliedToId: product.documentId,
          appliedToName: productMatch.name,
        });
      }

      // No match found
      return ctx.send({
        success: false,
        message: messages.codeNotApplicable,
      });
    } catch (error) {
      strapi.log.error('Error validating promotion code:', error);
      return ctx.internalServerError('Error validating promotion code');
    }
  },
}));
