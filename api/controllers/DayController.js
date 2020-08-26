const Days = require('../models/day');

DayController = {
  fetchRecord: async function (req, res) {
    let obj = [], today = moment.utc().tz("Asia/Jakarta").format(`YYYY-MM-DDTHH:mm:ss.SSSZ`) , tommorrow; 

    let timeStr = moment.utc(`${moment.utc(today).format(`YYYY-MM-DD`)} 11:00`).tz("Asia/Jakarta").format(`HH:mm:ss`),
      date = moment.utc(today),
      time = moment.utc(timeStr, 'HH:mm'),
      temptoday = moment.utc().tz("Asia/Jakarta").format(`YYYY-MM-DDTHH:mm:ss.SSSZ`)
    date.set({
      hour: time.get('hour'),
      minute: time.get('minute'),
      second: time.get('second')
    });

    if (moment(temptoday).isSameOrAfter(date) === false) {
      tommorrow = moment.utc().tz("Asia/Jakarta").format(`YYYY-MM-DDTHH:mm:ss.SSSZ`);
    } else {
      tommorrow = moment.utc().tz("Asia/Jakarta").add(1, `days`).format(`YYYY-MM-DDTHH:mm:ss.SSSZ`);
    }

    let [err, days] = await flatry( Days.
      find({ is_delete: false, day: { "$gte": new Date(tommorrow)} }).
      sort({day: 1}).
      limit(7) );
    if (err) {
      console.log(`\nERROR:Error when find Day \n ${ err.stack }\n`);
      return res.status(400).send( err );
    }

    let temp_months = [], months;
    days.forEach((day) => {
      temp_months.push(moment(day.day).format(`MMMM`));
      months = [...new Set(temp_months)];
    });
    let string_months = (months.length > 1)? months.join(` - `) : months[0];

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
        month: string_months.toUpperCase(),
        vip: day.is_vip,
        pressed: (day.is_vip == true) ? true : false,
        style: (day._id == days[0]._id) ? { backgroundColor: `black`, color: `white` } : { backgroundColor: `white`, color: `grey` }
      })
    });
    
    res.status(200).json({ day: obj });
  }
};

module.exports = DayController;

