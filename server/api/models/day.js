let Schema = mongoose.Schema;

let day_schema = new Schema({
  day: {
    type: Date,
    default: null
  },
  is_vip: {
    type: Boolean,
    default: false
  },

  /* config */
  created_at: {
    type: Date,
    default: Date.now
  },
  modified_at: {
    type: Date,
    default: null
  },
  is_delete: {
    type: Boolean,
    default: false
  }
});

let day = mongoose.model("day", day_schema);

module.exports = day;
