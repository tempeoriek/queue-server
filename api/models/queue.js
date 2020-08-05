let Schema = mongoose.Schema;

let queue_schema = new Schema({
  queue_number: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: null
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: `user`,
    default: null
  },
  time: {
    type: Schema.Types.ObjectId,
    ref: `time`,
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

let queue = mongoose.model("queue", queue_schema);

module.exports = queue;
