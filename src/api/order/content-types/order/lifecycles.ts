export default {
  beforeCreate(event) {
    const { data } = event.params;

    if (!data.orderDate) {
      data.orderDate = new Date().toISOString();
    }
  },

  async afterCreate(event) {
    const { result } = event;

    // Only process when the order is published (prevents double execution with draftAndPublish)
    if (!result.publishedAt) return;

    // Fetch the full order with populated items and customer info
    const order = await strapi.documents('api::order.order').findOne({
      documentId: result.documentId,
      populate: {
        items: {
          populate: ['productId'],
        },
        customerInfo: true,
      },
    });

    if (!order?.items?.length) return;

    // Decrease stock in a transaction
    await strapi.db.transaction(async ({ trx }) => {
      for (const item of order.items) {
        const product = item.productId;
        if (!product?.documentId) continue;

        const quantityOrdered = item.amount || 1;

        // Use raw query with transaction for atomic update
        await strapi.db.connection('products').where('document_id', product.documentId).decrement('amount', quantityOrdered).transacting(trx);
      }
    });

    // Create promotion code usage records for items with promotion codes
    const promotionCodesUsed = new Set<string>();
    
    for (const item of order.items) {
      if (item.promotionCode && item.promotionCode !== '0' && !promotionCodesUsed.has(item.promotionCode)) {
        promotionCodesUsed.add(item.promotionCode);

        try {
          // Find the promotion code by code string
          const promotionCodes = await strapi.documents('api::promotion-code.promotion-code').findMany({
            filters: { code: { $eqi: item.promotionCode } },
          });

          if (promotionCodes && promotionCodes.length > 0) {
            // Create the usage record
            await strapi.documents('api::promotion-code-usage.promotion-code-usage').create({
              data: {
                promotionCode: promotionCodes[0].documentId,
                customerId: order.customerInfo?.email || '',
                order: order.documentId,
                usedAt: new Date().toISOString(),
              },
            });
          }
        } catch (error) {
          strapi.log.error('Error creating promotion code usage record:', error);
        }
      }
    }
  },

  async beforeUpdate(event) {
    const { where } = event.params;

    // Fetch the current order using Query Engine (works with numeric id)
    const existingOrder = await strapi.db.query('api::order.order').findOne({
      where: { id: where.id },
      select: ['orderStatus'],
    });

    // Store the previous status in the event state for use in afterUpdate
    event.state = {
      previousStatus: existingOrder?.orderStatus,
    };
  },

  async afterUpdate(event) {
    const { result } = event;
    const previousStatus = event.state?.previousStatus;
    const newStatus = result.orderStatus;

    // Only create a log if the status actually changed
    if (previousStatus && newStatus && previousStatus !== newStatus) {
      try {
        await strapi.documents('api::order-status-log.order-status-log').create({
          data: {
            order: result.documentId,
            currentStatus: newStatus,
            previousStatus: previousStatus,
            changedBy: 'system',
          },
        });
      } catch (error) {
        console.error('Error creating log:', error);
      }
    }
  },
};
