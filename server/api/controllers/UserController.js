let User = require('../models/user'),
  UserController = require('./UserController'),
  crypto = require("crypto-js"),
  key = require('../../config/key');

UserController = {
  checkUserVip: async function (email, password, is_vip) {
    return new Promise(async (resolve, reject) => {
      let obj = {
        user: null, 
        other_date: false,
        err: null
      }, user = null;
    
      //FIND IN API 
      let find_user = await UserController.checkUserApi(email, password);
      Promise.all([find_user])
      .then(async (data) => {
        if (data[0].data) {
          user = data[0]
        }

        if (!user.data) {
          obj.other_date = true
        } else {
          if ((user.data.is_vip && is_vip) || (user.data.is_vip && !is_vip) || (!user.data.is_vip && !is_vip)) {
            let [err, users] = await flatry(User.findOne({ email: user.data.email, is_delete: false}));
            if (err) {
              console.log(`\nERROR:Error when find one in check user vip`);
              obj.err = err
              reject(obj); 
            }
            if (users) {
              obj.user = {
                _id: users._id,
                email: users.email,
                first_name: users.first_name,
                last_name: users.last_name,
                phone: users.phone,
                is_vip: users.is_vip,
              }
            } else {
              let [err, new_user] = await flatry( User.create({
                email: user.data.email,
                first_name: user.data.first_name,
                last_name: user.data.last_name,
                phone: user.data.phone,
                is_vip: user.data.is_vip,
              }) );
              if (err) {
                console.log(`\nERROR:Error when create new in check user vip`);
                obj.err = err
                reject(obj);
              }
              obj.user = new_user
            }
          } else if ( is_vip && !user.data.is_vip ) {
            obj.other_date = true
          }
        }
        resolve(obj);
      })
      .catch(err => {
        if (err) {
          console.log(`\nERROR:Error when checkUserApi`);
          obj.err = err
          reject(obj);
        } 
      })
    });
  },

  checkUserGuest: async function (email, first_name, last_name, phone) {
    let obj = {
      new_user: null,
      user: null,
      err: null
    }
    let err, find_user, new_user;
    [err, find_user] = await flatry(User.findOne({ email, is_delete: false }));
    if (err) {
      console.log(`\nERROR:Error when findOne find_user \n ${err.stack}\n`);
      obj.err = err.stack
    }

    if (!find_user) {
      [err, new_user] = await flatry( User.create({ email, first_name, last_name, phone }) );
      if (err) {
        console.log(`\nERROR:Error when create new_user \n ${err.stack}\n`);
        obj.err = err.stack
      }
      obj.new_user = new_user;
    } else {
      obj.user = find_user;
    }

    return obj;
  },

  checkUserApi: function (email, password) {
    return new Promise(async (resolve, reject) => {
    
      let obj = {
        data: null,
        err: null
      };
  
      let merchant_id = key.key.merchant_id,
        merchant_key = key.key.merchant_key,
        today = moment.utc().format(`YYYYMMDDHH`);
      let hash = `${merchant_id}${today}${merchant_key}`;
  
      let words = crypto.enc.Utf8.parse(merchant_id);
      let merchant = crypto.enc.Base64.stringify(words);
  
      hash256 = crypto.SHA256(hash).toString().toUpperCase();
      let words2 = crypto.enc.Utf8.parse(hash256);
      let hash_key = words2.toString(crypto.enc.Base64);
  
      axios({
        method: 'post',
        baseURL: 'https://flitts-index.com/api/customer',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'merchant': merchant,
          'signature': hash_key,
        },
        data: {
          email,
          password
        }
      })
      .then(function (response) {
        let data = response.data;
  
        let text = data.roles,
          is_vip = `Privilege`
  
        if (data.return_code == 200 && data.email) {
          obj.data = {
            _id: data.id,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phoneNumber,
            is_vip: text.includes(is_vip),
          }
        }
        resolve(obj);
      })
      .catch(function (error) {
        console.log(`Error when axios API`);
        obj.err = error;
        reject(obj)
        // return obj;
      })
    })

  }
};

module.exports = UserController;

