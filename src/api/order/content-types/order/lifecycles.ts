export default {
  beforeCreate(event) {
    const { data } = event.params;

    if (!data.orderDate) {
      data.orderDate = new Date().toISOString();
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
