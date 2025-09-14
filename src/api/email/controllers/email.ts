/**
 * email controller
 */

export default {
  async send(ctx) {
    try {
      const { to, subject, text, html } = ctx.request.body;

      // Validate required fields
      if (!to || !subject || (!text && !html)) {
        return ctx.badRequest('Missing required fields: to, subject, and either text or html');
      }

      // Send email using Strapi's email service
      await strapi.plugins['email'].services.email.send({
        to,
        subject,
        text,
        html,
      });

      ctx.send({
        message: 'Email sent successfully',
        success: true,
      });
    } catch (error) {
      strapi.log.error('Email sending failed:', error);
      ctx.internalServerError('Failed to send email');
    }
  },
};
