var emailCredential = require('../config/email');
var nodemailer = require('nodemailer');

let { user, pass } = emailCredential.email.auth;
let { service, from, cc, tls, host, port, secure } = emailCredential.email;

module.exports = {
  getTranspoter: function(req, res) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      tls,
      cc,
      auth: {
        user,
        pass
      },
      from
    })
  }
}
