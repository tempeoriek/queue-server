let Queue = require('../models/queue'),
  Time = require('../models/time'),
  emailConfig = require('../../config/email'),
  QueueController = require('./QueueController'),
  NotificationController = require('./NotificationController'),
  UserController = require('./UserController');

QueueController = {
  bookVip: async function (req, res) {
    let { day, time, email, password, is_vip, ktp } = req.body,
      err, find_queue;
    
    let check_qty;
    [err, check_qty] = await flatry(Time.findOne({_id: time}, `qty`));
    if (err) {
      console.log(`\nERROR:Error findOne Time in book VIP`);
      return res.status(400).send(err);
    }

    if (check_qty.qty > 0) {
      let check = await UserController.checkUserVip(email, password, is_vip, ktp);
      Promise.all([check])
      .then(async (data) => {
        let check_user = data[0];

        if (check_user.msg) {
            res.status(200).json({ msg: check_user.msg });
        } else if (check_user.user) {
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
            res.status(200).json({ msg: `Sorry, you’re not eligible to book. Thank You.` });
          } else {

            let create_queue = await QueueController.createQueue(time, day, check_user.user, `vip`);
            Promise.all([create_queue])
            .then(async (checks) => { 
              let check_queue = checks[0];

              if (check_queue.err) {
                console.log(`\nERROR:Error when create queque \n ${check_queue.err.stack}\n`);
                  return res.status(400).send(check_queue.err);
                }

                let returns = {};
                if (check_queue.msg) {
                  returns = { msg: check_queue.msg };
                } else if (check_queue.data) {
                  returns = { queue: check_queue.data };
                }

                res.status(200).json(returns);
              })
              .catch(err => {
                if (err) {
                  console.log(`\nERROR:Error when checkUserApi in queue controller`);
                  console.log(err);
                  return res.status(400).send(err);
                }
              })

          }
        }
      })
      .catch(err => {
        if (err) {
          console.log(`\nERROR:Error when checkUserApi in queue controller`);
          console.log(err);
          return res.status(400).send(err);
        }
      })
    } else {
      res.status(200).json({ msg: `Sorry, slot is full` });
    }
  },

  bookGuest: async function (req, res) {
    let { day, time, email, first_name, last_name, phone, ktp } = req.body,
      err, create_queue;

    let check_qty;
    [err, check_qty] = await flatry(Time.findOne({ _id: time }, `qty`));
    if (err) {
      console.log(`\nERROR:Error findOne Time in book VIP`);
      return res.status(400).send(err);
    }

    if (check_qty.qty > 0) {
      let check_user = await UserController.checkUserGuest(email, first_name, last_name, phone, ktp);
      if (check_user.err) {
        console.log(`\nERROR:Error when check user \n ${check_user.err.stack}\n`);
        return res.status(400).send(check_user.err);
      }

      if (check_user.msg) { 
        res.status(200).json({ msg: check_user.msg });
      } else if (check_user.new_user) {
        create_queue = await QueueController.createQueue(time, day, check_user.new_user, `guest`);
        if (create_queue.err) {
          console.log(`\nERROR:Error when check user \n ${create_queue.err.stack}\n`);
          return res.status(400).send(create_queue.err);
        }

        let returns = {};
        if (create_queue.msg) {
          returns = { msg: create_queue.msg };
        } else if (create_queue.data) {
          returns = { queue: create_queue.data };
        }
        res.status(200).json(returns);
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
          res.status(200).json({ msg: `Sorry, you’re not eligible to book. Thank You.` });
        } else {
          create_queue = await QueueController.createQueue(time, day, check_user.user, `guest`);
          if (create_queue.err) {
            console.log(`\nERROR:Error when create queque \n ${create_queue.err.stack}\n`);
            return res.status(400).send(create_queue.err);
          }

          let returns = {};
          if (create_queue.msg) {
            returns = { msg: create_queue.msg };
          } else if (create_queue.data) {
            returns = { queue: create_queue.data };
          }
          res.status(200).json(returns);
        }
      }
    } else {
      res.status(200).json({ msg: `Sorry, slot is full` });
    }
  },

  createQueue: async function (time, day, user, type) {
    let rn = Math.floor((Math.random() * 900) + 99),
      today = moment().startOf('day'), sequence, queue_number, queue, err,
      obj = {
        data: null,
        msg: null,
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
        user: user._id,
        queue_number,
        status: `pending`
      }));
      if (err) {
        console.log(`\nERROR:Error when create Queue \n ${err.stack}\n`);
        obj.err = err.stack;
      }
      queue = await queue.populate('day').populate('time').execPopulate();

      //WAITING FOR 2 SECOND
      await NotificationController.sleep(2500);

      //FIND TOP 2 CREATED_AT SORT ASC
      let find_queue;
      [err, find_queue] = await flatry(Queue.find({ time, is_delete: false }).populate(`time`).sort({ created_at: 1 }).limit(2));
      if (err) {
        console.log(`\nERROR:Error when find Queue \n ${err.stack}\n`);
        obj.err = err.stack;
      }

      find_queue.forEach((data) => {
        if (queue._id.toString() == data._id.toString()) {
          obj.data = data;
        }
      });
      
      if (obj.data) {
        let filter_queue = { _id: obj.data._id },
          update_queue = { status: `completed` },
          filter_qty = { _id: time },
          // CHANGE LOGIC = QTY - LENGTH OF QUEUE (STATUS COMPLETED)
          temp_qty = (obj.data) ? obj.data.time.qty - 1 : null;
        let update_qty = { qty: temp_qty };
        if (temp_qty < 0) {
          obj.msg = `Sorry, slot is full`;
        } else {
          //UPDATE QUEUE STATUS
          [err] = await flatry(Queue.findOneAndUpdate(filter_queue, update_queue));
          if (err) {
            console.log(`\nERROR:Error when find one and update TIME \n ${err.stack}\n`);
            obj.err = err.stack;
          }

          //UPDATE TIME QTY
          [err] = await flatry(Time.findOneAndUpdate(filter_qty, update_qty));
          if (err) {
            console.log(`\nERROR:Error when find one and update TIME \n ${err.stack}\n`);
            obj.err = err.stack;
          }

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
          await NotificationController.sendEmail(mail);
        }
      } else {
        obj.msg = `Sorry, slot is full`;
      }
      
      if (type == `vip`) {
        return new Promise((resolve) => {
          resolve(obj);
        });
      } else if (type == `guest`) {
        return obj;
      }
  },

  fetchData: async function (req, res) {
    let { _id } = req.body,
      obj = {
        day: null,
        day_number: null,
        month: null,
        time: null,
        queue_number: null
      }, result = {};

    let [err, queue] = await flatry(Queue.findOne({ _id }));
    if (err) {
      console.log(`\nERROR:Error when find Queue \n ${err.stack}\n`);
      return res.status(400).send(err);
    }
    if (queue) {
      queue = await queue.populate('day').populate('time').populate('user').execPopulate();

      obj = {
        day: moment(queue.day.day).format(`dddd`),
        day_number: moment(queue.day.day).format(`DD`),
        month: moment(queue.day.day).format(`MMMM`),
        email: queue.user.email,
        time: `${queue.time.start_time} - ${queue.time.end_time}`,
        queue_number: `${queue.queue_number}`
      }
      result = { queue: obj };
    } else {
      result = { msg: `Sorry, we did not found your book id, Please contact our admin` };
    }
    res.status(200).json(result);
  },

  pickDay: async function (req, res) {
    let obj = [];
    let {day} = req.body, err, find_day;
    [err, find_day] = await flatry(Queue.find({ day, status: `completed` ,is_delete: false })
    .populate('day')
    .populate('user')
    .populate('time'))
    if (err) {
      console.log(`\nERROR:Error when find Queue \n ${err.stack}\n`);
      return res.status(400).send(err);
    }
    find_day.forEach((data) => {
      obj.push({
        ID_Number: data.user.ktp,
        name: `${data.user.first_name} ${data.user.last_name}`,
        email: data.user.email,
        queue: data.queue_number,
        start: `${data.time.start_time}`,
        end: `${data.time.end_time}`,
      });
    });
    obj.sort((a, b) => (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0)); 

    res.status(200).json({ queue: obj });
  }
};

module.exports = QueueController;
