'use strict';

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // Find latest order with highest orderNumber
    const lastEntry = await strapi.db.query('api::order.order').findMany({
      orderBy: { createdAt: 'desc' },
      limit: 1,
      select: ['orderNumber'],
    });

    let nextNumber = 1;

    if (lastEntry.length && lastEntry[0].orderNumber) {
      const match = lastEntry[0].orderNumber.match(/ORDER-(\d+)/);
      if (match && match[1]) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    data.orderNumber = `ORDER-${nextNumber}`;
  },
};
