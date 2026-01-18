/**
 * Custom routes for promotion-code
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/promotion-codes/validate',
      handler: 'promotion-code.validate',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
