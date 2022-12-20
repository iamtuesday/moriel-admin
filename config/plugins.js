module.exports = ({ env }) => ({
    'strapi-plugin-populate-deep': {
      config: {
        defaultDepth: 10, // Default is 5
      }
    },
    transformer: {
      enabled: true,
      config: {
        prefix: '/api/',
        responseTransforms: {
          removeAttributesKey: true,
          removeDataKey: true
        }
      }
    },
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET')
          },
          sizeLimit: 250 * 1024 * 1024 // 256mb in bytes
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {}
        }
      }
    },
    email: {
      config: {
        provider: 'nodemailer',
        providerOptions: {
          host: env('SMTP_HOST'),
          port: env('SMTP_PORT'),
          auth: {
            user: env('SMTP_USERNAME'),
            pass: env('SMTP_PASSWORD')
          }
          // ... any custom nodemailer options
        },
        settings: {
          defaultFrom: env('SMTP_EMAIL'),
          defaultReplyTo: env('SMTP_EMAIL')
        }
      }
    },
    ezforms: {
      config: {
        enableFormName: true,
        captchaProvider: {
          name: 'none'
        },
        notificationProviders: [
          {
            name: 'email',
            enabled: true,
            config: {
              from: env('SMTP_EMAIL')
              // from: 'inf.roycd@gmail.com'
            }
          }
        ]
      }
    }
  })
