let transporter = require('../../config/transporter'),
  email = require(`../../config/emailConfig`).emailSender();

NotificationController = {
  sendEmail: function (mail) {
    let { path, from, to, cc } = mail,
      defaultMailOptions = {
        from,
        to,
        path,
        cc
      };

    if (mail.usingTemplate) {
      let { localVariables: locals } = mail;
      email
        .send({
          template: `../views/emailTemplates/${path}`,
          message: defaultMailOptions,
          locals
        })
        .then((info) => {
          console.log(`\nMessage sent: ${info.response}\n`);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      let mailOptions = {
        ...defaultMailOptions,
        attachments: mail.attachments,
        subject: mail.subject,
        html: mail.html,
      }
      transporter.getTranspoter().sendMail(mailOptions, function (err, response) {
        if (err) {
          console.log(`\nERROR:Error when send mail transporter \n ${err.stack}\n`);
        } else {
          console.log(`\nMessage sent: ${response.response}\n`);
        }
      });
    }
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

module.exports = NotificationController;

