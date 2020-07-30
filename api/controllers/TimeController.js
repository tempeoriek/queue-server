const Times = require('../models/time');

TimeController = {
  fetchRecord: async function (req, res) {
    let obj = [];
    let [err, time] = await flatry( Times.find({ is_delete: false, day: req.body.day }).sort({start_time: 1}) );
    if (err) {
      console.log(`\nERROR:Error when find Time \n ${ err.stack }\n`);
      return res.status(400).send( err );
    }
    
    time.forEach((tm) => {
      obj.push({
        id: tm._id,
        qty: tm.qty,
        start_time: tm.start_time,
        end_time: tm.end_time,
        pressed: false,
        style: { backgroundColor: `white`, color: `black` }
      });
    });

    res.status(200).json({ time: obj });
  }
};

module.exports = TimeController;

