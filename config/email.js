module.exports.email = {
  // auth: {
  //   user: `orielaldo@gmail.com`,
  //   pass: `orielmatiasaldo`
  // },
  // from: `Euonia`,
  // service: `Gmail`,
  // testMode: false
  // host: 'eunoiastore.co',
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'no-reply@eunoiastore.co', // your domain email address
    pass: 'Eunoia!23' // your password
  },
  cc: `orielaldo.work@gmail.com`,
  //cc: `marketing.eunoia@gmail.com`,
  from: `Eunoia <no-reply@eunoiastore.co>`,
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
};
