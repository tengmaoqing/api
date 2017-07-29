/*
* @Author: tengmaoqing
* @Date:   2018-01-12 14:44:54
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2018-01-19 19:08:42
*/
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var TemplateSchema = new Schema({
  type: String,
  name: String,
  venders: Array,
  description: String,
  disabled: Boolean,
  createDate: {type: Date, default: Date.now},
  updateTime: {type: Date, default: Date.now}
}, {
  versionKey: false,
  timestamps: { createdAt: 'createDate', updatedAt: 'updateTime' }
});

TemplateSchema.plugin(mongoosePaginate);

var Dll = mongoose.model('Dll', TemplateSchema);

module.exports =  Dll ;