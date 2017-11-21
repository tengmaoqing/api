/*
* @Author: tengmaoqing
* @Date:   2017-11-21 16:09:12
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2017-11-21 16:29:12
*/

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var ProjectSchema = new Schema({
  name: String,
  description: String,
  remark: String,
  commonSrc: Array, // [{src: '', position: 'body', type: 'js', customStr: ''}]
  templateId: {type: Schema.Types.ObjectId, ref: 'templates'}, //模板id
  templateName: String,
  style: String,
  disabled: Boolean,
  createDate: {type: Date, default: Date.now},
  updateTime: {type: Date, default: Date.now}
}, {
  versionKey: false,
  timestamps: { createdAt: 'createDate', updatedAt: 'updateTime' }
});

ProjectSchema.plugin(mongoosePaginate);

var Project = mongoose.model('Project', ProjectSchema);
module.exports =  Project;
