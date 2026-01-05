import type { Schema, Struct } from '@strapi/strapi';

export interface CustomerInfoAddress extends Struct.ComponentSchema {
  collectionName: 'components_customer_info_addresses';
  info: {
    displayName: 'Address';
    icon: 'house';
  };
  attributes: {
    box: Schema.Attribute.String;
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    number: Schema.Attribute.String;
    postalcode: Schema.Attribute.String;
    street: Schema.Attribute.String;
  };
}

export interface CustomerInfoCustomerInfo extends Struct.ComponentSchema {
  collectionName: 'components_customer_info_customer_infos';
  info: {
    displayName: 'Customer-info';
    icon: 'emotionHappy';
  };
  attributes: {
    email: Schema.Attribute.String & Schema.Attribute.Required;
    firstname: Schema.Attribute.String;
    lastname: Schema.Attribute.String;
    phone: Schema.Attribute.String;
  };
}

export interface CustomerInfoOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_customer_info_order_items';
  info: {
    description: '';
    displayName: 'order-item';
  };
  attributes: {
    amount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    calculatedPrice: Schema.Attribute.Decimal;
    discount: Schema.Attribute.Decimal;
    materialName: Schema.Attribute.String & Schema.Attribute.DefaultTo<'-'>;
    name: Schema.Attribute.String;
    price: Schema.Attribute.Decimal;
    productId: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
  };
}

export interface PageitemsCollection extends Struct.ComponentSchema {
  collectionName: 'components_pageitems_collections';
  info: {
    description: '';
    displayName: 'collection';
  };
  attributes: {
    images: Schema.Attribute.Component<'subitems.image', true> &
      Schema.Attribute.Required;
  };
}

export interface SubitemsImage extends Struct.ComponentSchema {
  collectionName: 'components_subitems_images';
  info: {
    description: '';
    displayName: 'images';
  };
  attributes: {
    order: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    src: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'customer-info.address': CustomerInfoAddress;
      'customer-info.customer-info': CustomerInfoCustomerInfo;
      'customer-info.order-item': CustomerInfoOrderItem;
      'pageitems.collection': PageitemsCollection;
      'subitems.image': SubitemsImage;
    }
  }
}
