let Queue = require('../models/queue'),
  Time = require('../models/time'),
  Day = require('../models/day'),
  emailConfig = require('../../config/email'),
  transporter = require('../../config/transporter'),
  QueueController = require('./QueueController'),
  UserController = require('./UserController'),
  email = require(`../../config/emailConfig`).emailSender();

QueueController = {
  bookVip: async function (req, res) {
    let { day, time, email, password, is_vip, ktp } = req.body,
      err, find_queue, flag = 0;

    let check = await UserController.checkUserVip(email, password, is_vip, ktp);
    Promise.all([check])
      .then(async (data) => {
        let check_user = data[0];

        if (check_user.msg) {
          res.status(200).json({ msg: check_user.msg });
        } else {
          // FIND QUEUE
          [err, find_queue] = await flatry(Queue.find({
            user: check_user.user._id,
            is_delete: false,
          }).populate('day').populate('time'));
          if (err) {
            console.log(`\nERROR:Error when find find_queue \n ${err.stack}\n`);
            return res.status(400).send(err);
          }

          if (find_queue.length > 0) {
            res.status(200).json({ msg: `Sorry, you’re not eligible to book. You already book for the day. Thank You.` });
          } else {

            create_queue = await QueueController.createQueue(time, day, check_user.user);
            if (create_queue.err) {
              console.log(`\nERROR:Error when create queque \n ${create_queue.err.stack}\n`);
              return res.status(400).send(create_queue.err);
            }

            res.status(200).json({ queue: create_queue.data });
          }
        }
      })
      .catch(err => {
        if (err) {
          console.log(`\nERROR:Error when checkUserApi`);
          return res.status(400).send(err);
        }
      })
  },

  bookGuest: async function (req, res) {
    let { day, time, email, first_name, last_name, phone, ktp } = req.body,
      err, create_queue, flag = 0;

    let check_user = await UserController.checkUserGuest(email, first_name, last_name, phone, ktp);
    if (check_user.err) {
      console.log(`\nERROR:Error when check user \n ${check_user.err.stack}\n`);
      return res.status(400).send(check_user.err);
    }
    if (check_user.msg) { 
      res.status(200).json({ msg: check_user.msg });
    } else if (check_user.new_user) {
      create_queue = await QueueController.createQueue(time, day, check_user.new_user);
      if (create_queue.err) {
        console.log(`\nERROR:Error when check user \n ${create_queue.err.stack}\n`);
        return res.status(400).send(create_queue.err);
      }
      res.status(200).json({ queue: create_queue.data });

    } else if (check_user.user) {
      // FIND QUEUE
      [err, find_queue] = await flatry(Queue.find({ 
        user: check_user.user._id, 
        is_delete: false, 
      }).populate('day').populate('time'));
      if (err) {
        console.log(`\nERROR:Error when countDocuments find_queue \n ${err.stack}\n`);
        return res.status(400).send(err);
      }

      if (find_queue.length > 0) {
        res.status(200).json({ msg: `Sorry, you’re not eligible to book. You already book for the day. Thank You.` });
      } else {
        create_queue = await QueueController.createQueue(time, day, check_user.user);
        if (create_queue.err) {
          console.log(`\nERROR:Error when create queque \n ${create_queue.err.stack}\n`);
          return res.status(400).send(create_queue.err);
        }
        res.status(200).json({ queue: create_queue.data });
      }
    }
  },

  createQueue: async function(time, day, user) {
    let rn = Math.floor((Math.random() * 900) + 99),
      today = moment().startOf('day'), sequence, queue_number, queue,
      obj = {
        data: null,
        err: null
      };
    // CREATE QUEUE NUMBER
    [err, sequence] = await flatry(Queue.countDocuments({ created_at: { $gte: today.toDate(), $lte: moment(today).endOf('day').toDate() } }));
    if (err) {
      console.log(`\nERROR:Error when countDocuments Queue \n ${err.stack}\n`);
      obj.err = err.stack;
    }
    queue_number = `#${moment(today).format('DDMMYY')}${rn}${parseInt(sequence + 1)}`;

    // CREATE QUEUE
    [err, queue] = await flatry(Queue.create({
      day,
      time,
      user : user._id,
      queue_number
    }));
    if (err) {
      console.log(`\nERROR:Error when find Queue \n ${err.stack}\n`);
      obj.err = err.stack;
    }
    queue = await queue.populate('day').populate('time').execPopulate();

    //UPDATE TIME QTY
    let filter = { _id: time };
    let update = { qty: queue.time.qty - 1 };

    [err] = await flatry(Time.findOneAndUpdate(filter, update));
    if (err) {
      console.log(`\nERROR:Error when find one and update TIME \n ${err.stack}\n`);
      obj.err = err.stack;
    }
    
    obj.data = queue;

    //SEND EMAIL
    let mail = {
      from: emailConfig.email.from,
      to: user.email,
      usingTemplate: true,
      path: `BookCompleted`,
      localVariables: {
        day: moment(queue.day.day).format(`dddd`),
        day_number: moment(queue.day.day).format(`DD`),
        month: moment(queue.day.day).format(`MMMM`),
        time: `${queue.time.start_time} - ${queue.time.end_time}`,
        queue_number: `${queue.queue_number}`
      }
    };
    await QueueController.sendEmail(mail);

    return obj;
  },

  fetchData: async function (req, res) {
    let { _id } = req.body,
      obj = {
        day: null,
        day_number: null,
        month: null,
        time: null,
        queue_number: null
      }
    let [err, queue] = await flatry(Queue.findOne({ _id }));
    if (err) {
      console.log(`\nERROR:Error when find Queue \n ${err.stack}\n`);
      return res.status(400).send(err);
    }
    queue = await queue.populate('day').populate('time').populate('user').execPopulate();

    obj = {
      day: moment(queue.day.day).format(`dddd`),
      day_number: moment(queue.day.day).format(`DD`),
      month: moment(queue.day.day).format(`MMMM`),
      email: queue.user.email,
      time: `${queue.time.start_time} - ${queue.time.end_time}`,
      queue_number: `${queue.queue_number}`
    }
    res.status(200).json({ queue: obj });
  },

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
          // return res.status(400).send( err );
        } else {
          console.log(`\nMessage sent: ${response.response}\n`);
        }
      });
    }
  }
};

module.exports = QueueController;

