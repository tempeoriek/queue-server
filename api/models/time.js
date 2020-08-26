let Schema = mongoose.Schema;

let time_schema = new Schema({
  start_time: {
    type: String,
    default: null
  },
  end_time: {
    type: String,
    default: null
  },
  slot: {
    type: Number,
    default: null
  },
  qty: {
    type: Number,
    default: null
  },

  day: {
    type: Schema.Types.ObjectId,
    ref: `day`,
    default: null
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

let time = mongoose.model("time", time_schema);

module.exports = time;
