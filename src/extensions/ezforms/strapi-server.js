const { schema } = require('./validateForm');

module.exports = (plugin) => {
  plugin.controllers.submitController = () => ({
    async index(ctx) {
      let verification = {
        score: 0
      };
      let formName =
        strapi.config.get("plugin.ezforms.enableFormName") &&
          !!ctx.request.body.formName
          ? ctx.request.body.formName
          : "Form";

      // Form Validation

      // const schema = Joi.object({
      //   name: Joi.string()
      //     .min(3)
      //     .max(30)
      //     .required(),
      //   phone: Joi.string().required()
      //     .pattern(new RegExp(/^(1\s?)?(\d{3}|\(\d{3}\))[\s-]?\d{3}[\s-]?\d{4}$/))
      //     .messages({
      //       "string.pattern.base": "Invalid Phone Number",
      //     }),
      //   email: Joi.string().required()
      //     .pattern(new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
      //     .messages({
      //       "string.pattern.base": "Invalid Email",
      //     }),
      //   service: Joi.string().required(),
      //   message: Joi.string().allow(null, '')
      // });


      const { error, value } = schema.validate(ctx.request.body.formData, { abortEarly: false });

      if (error) {
        const invalidArgs = error.details.map(({ path, message, context: { key } }) => ({
          path: path[0],
          message
        }));

        return ctx.badRequest(
          "One or more fields have an error. Please check and try again.",
          invalidArgs
        );
      }

      //sends notifications
      for (const provider of strapi.config.get(
        "plugin.ezforms.notificationProviders"
      )) {
        if (provider.enabled) {
          try {
            await strapi
              .plugin("ezforms")
              .service(provider.name)
              .send(provider.config, formName, ctx.request.body.formData);
          } catch (e) {
            strapi.log.error(e);
            ctx.internalServerError("A Whoopsie Happened", e);
          }
        }
      }

      // Adds to DB
      let parsedScore = verification.score || -1;
      try {
        await strapi.query("plugin::ezforms.submission").create({
          data: {
            score: parsedScore,
            formName: formName,
            data: ctx.request.body.formData,
          },
        });
      } catch (e) {
        strapi.log.error(e);
        return ctx.internalServerError("A Whoopsie Happened", e);
      }
      return (ctx.body = ctx.request.body.formData);


    },
  });

  plugin.services.formatData = () => ({
    formatData(data) {
      const { name, email, phone, service, message } = data;

      const body = `
      <br>
      From: ${name} - ${email} <br>
      Subject: Contact Form / Solar Energy Long Beach <br>
      <br>
      Contact Info--- <br>
      Name: ${name} <br>
      Email: ${email} <br>
      Phone: ${phone}<br>
      Service: ${service}<br>
      Message: ${message}<br>
      <br>
      --
      This e-mail was send from a contact form on Solar Energy  (<a href="https://facebook.com" target="_blank">facebook.com</a>)
      `;

      return body;
    },
  });

  return plugin;
};
