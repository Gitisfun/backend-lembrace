export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp-auth.mailprotect.be',
        port: 465,
        auth: {
          user: 'info@lembrace.be',
          pass: 'L@embrace2012',
        },
      },
      settings: {
        defaultFrom: 'info@lembrace.be',
        defaultReplyTo: 'info@lembrace.be',
      },
    },
  },
});
