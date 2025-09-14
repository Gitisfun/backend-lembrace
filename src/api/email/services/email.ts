/**
 * email service
 */

export default ({ strapi }) => ({
  async sendEmail(emailData) {
    try {
      const { to, subject, text, html } = emailData;

      // Use Strapi's email plugin service
      const result = await strapi.plugins['email'].services.email.send({
        to,
        subject,
        text,
        html,
      });

      return result;
    } catch (error) {
      strapi.log.error('Email service error:', error);
      throw error;
    }
  },
});
