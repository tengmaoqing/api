var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var TemplateSchema = new Schema({
	type: String,
	name: String,
	html: String,
 	description: String,
	disabled: Boolean,
  createDate: {type: Date, default: Date.now},
  updateTime: {type: Date, default: Date.now}
}, {
  versionKey: false,
  timestamps: { createdAt: 'createDate', updatedAt: 'updateTime' }
});

TemplateSchema.plugin(mongoosePaginate);

var Template = mongoose.model('Template', TemplateSchema);

module.exports =  Template ;