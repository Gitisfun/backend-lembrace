import type { Schema, Struct } from '@strapi/strapi';

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

export interface PageitemsIntroblock extends Struct.ComponentSchema {
  collectionName: 'components_pageitems_introblocks';
  info: {
    description: '';
    displayName: 'introBlock';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    header: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
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
      'pageitems.collection': PageitemsCollection;
      'pageitems.introblock': PageitemsIntroblock;
      'subitems.image': SubitemsImage;
    }
  }
}
