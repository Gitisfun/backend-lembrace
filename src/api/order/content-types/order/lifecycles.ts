export default {
  beforeCreate(event) {
    const { data } = event.params;

    if (!data.orderDate) {
      data.orderDate = new Date().toISOString();
    }
  },
};
