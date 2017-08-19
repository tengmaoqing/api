var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var PageSchema = new Schema({
	pageName: String, //页面名称
	template: String, //页面所用模板
	head: String,	//页面头部自定义代码
	footer: String, //页面底部自定义代码
	url: String,	//访问页面的url
	title: String,  //页面title
	keyword: String, //页面key
	description: String, //页面描述
	content: String, //页面内容配置json
	style: Object,	
	startDate: Date, //页面可访问开始时间
	endDate: Date, //页面可访问结束时间
  	status: Boolean, //可见状态
	disabled: Boolean, //是否禁用
	remark: String,
  	createDate: {type: Date, default: Date.now}
}, {
  versionKey: false
});

PageSchema.plugin(mongoosePaginate);

var Page = mongoose.model('Page', PageSchema);

module.exports =  Page;