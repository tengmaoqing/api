var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var ComponentSchema = new Schema({
	type: String,
  tag: Array, //标签，方便搜索查看
  isClosingTag: Boolean, //是否可有子元素
	options: String, // 组件选项，配置用
	name: {
    type: String,
    unique: true
  }, // 组件名
	html: String, // 组件html
  pathHTML: String, //组件html文件
  pathJS: String, // webpack 直接引用地址。组件JS文件地址
  vars: String, //html里面的变量
 	description: String, // 描述
	disabled: Boolean, //是否禁用
	style: String, //直出sytle样式
  testTime: Date,
  testStatus: Boolean,
  createDate: {type: Date, default: Date.now},
  updateTime: {type: Date, default: Date.now}
}, {
  versionKey: false,
  timestamps: { createdAt: 'createDate', updatedAt: 'updateTime' }
});

ComponentSchema.plugin(mongoosePaginate);

var Component = mongoose.model('Component', ComponentSchema);

module.exports =  Component ;