var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var UserSchema = new Schema({
  type: String,
  userName: String,
  avtor: String,
  power: String,

  createDate: {type: Date, default: Date.now}
}, {
  versionKey: false
});

UserSchema.plugin(mongoosePaginate);

var User = mongoose.model('User', UserSchema);

module.exports =  User ;