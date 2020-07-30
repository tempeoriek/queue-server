let transporter = require(`../config/transporter`);
const Email = require(`email-templates`);
const path = require(`path`);

module.exports =  {
  emailSender: function () {
    return new Email({
      send: true,
      preview: false,
      transport: transporter.getTranspoter(),
      views: {
        root: path.join(__dirname, '../emails'),
        options: {
          extension: `ejs`
        }
      }
    });
  }
};
