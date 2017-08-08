var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var PageSchema = new Schema({
	pageName: String,
	title: String,
	template: String,
	head: String,
	footer: String,
  description: String,
  content: String,
	style: Object,
  status: Boolean,
	disabled: Boolean,
  createDate: {type: Date, default: Date.now}
}, {
  versionKey: false
});

PageSchema.plugin(mongoosePaginate);

var Page = mongoose.model('Page', PageSchema);

module.exports =  Page;