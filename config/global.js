module.exports = function (global) {
    global.flatry = require('flatry');
    global.bcrypt = require('bcryptjs');
    global.passport = require('passport');
    global.express = require('express');
    global.mongoose = require('mongoose');
    global.moment = require('moment');
    global.momenttz = require('moment-timezone');
    global.axios = require('axios');
    global.qs = require('qs');
}
