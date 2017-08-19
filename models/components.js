var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var ComponentSchema = new Schema({
	type: String,
	options: Object,
	name: String,
	html: String,
 	description: String,
	disabled: Boolean,
	style: Object,
  	createDate: {type: Date, default: Date.now}
}, {
  versionKey: false
});

ComponentSchema.plugin(mongoosePaginate);

var Component = mongoose.model('Component', ComponentSchema);

module.exports =  Component ;