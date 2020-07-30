module.exports = function (app) {

  let Queue = require('../api/routes/Queue');
  app.use('/Queue', Queue);

  let Time = require('../api/routes/Time');
  app.use('/Time', Time);

  let Day = require('../api/routes/Day');
  app.use('/Day', Day);

  let User = require('../api/routes/User');
  app.use('/User', User);
}
