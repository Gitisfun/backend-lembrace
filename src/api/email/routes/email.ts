/**
 * email router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/email/send',
      handler: 'api::email.email.send',
      config: {
        auth: false, // Set to true if you want to require authentication
        policies: [],
        middlewares: [],
      },
    },
  ],
};
