var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var ComponentSchema = new Schema({
	type: String,
  tag: Array, //标签，方便搜索查看
  isClosingTag: Boolean, //是否可有子元素
	options: Object, // 组件选项，配置用
	name: String, // 组件名
	html: String, // 组件html
  pathHTML: String, //组件html文件
  pathJS: String, // webpack 直接引用地址。组件JS文件地址
 	description: String, // 描述
	disabled: Boolean, //是否禁用
	style: Object, //直出sytle样式
  createDate: {type: Date, default: Date.now}
}, {
  versionKey: false
});

ComponentSchema.plugin(mongoosePaginate);

var Component = mongoose.model('Component', ComponentSchema);

module.exports =  Component ;