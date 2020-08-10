const Days = require('../models/day');

DayController = {
  fetchRecord: async function (req, res) {
    let obj = [];
    let [err, days] = await flatry( Days.find({ is_delete: false }).sort({day: 1}) );
    if (err) {
      console.log(`\nERROR:Error when find Day \n ${ err.stack }\n`);
      return res.status(400).send( err );
    }
    
    days.forEach((day) => {
      let name_day = (moment(day.day).format(`dddd`) === `Friday`) ? `FRI` :
        (moment(day.day).format(`dddd`) === `Saturday`) ? `SAT` :
        (moment(day.day).format(`dddd`) === `Sunday`) ? `SUN` :
        (moment(day.day).format(`dddd`) === `Monday`) ? `MON` :
        (moment(day.day).format(`dddd`) === `Tuesday`) ? `TUE` :
        (moment(day.day).format(`dddd`) === `Wednesday`) ? `WED` : `THU`
   
      obj.push({
        id: day._id,
        day: name_day,
        date: moment(day.day).format(`D`),
        days: moment(day.day).format(`DD MMM YYYY`),
        vip: day.is_vip,
        pressed: (day.is_vip == true) ? true : false,
        style: (day._id == days[0]._id) ? { backgroundColor: `black`, color: `white` } : { backgroundColor: `white`, color: `grey` }
      })
    });
    res.status(200).json({ day: obj });
  }
};

module.exports = DayController;

