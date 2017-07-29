var mongoose = require('mongoose'),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate');

var PageSchema = new Schema({
	name: String, //页面名称
	productname: String, //项目名称
	projectId: {type: Schema.Types.ObjectId, ref: 'Project'}, //项目ID
	templateId: {type: Schema.Types.ObjectId, ref: 'Template'}, //模板id
	templateName: String,
	forkId: {type: Schema.Types.ObjectId, ref: 'pages'},
	template: String, //页面所用模板
	head: String,	//页面头部自定义代码
	footer: String, //页面底部自定义代码
	preLoad: String, //页面预加载代码，可打包
	extension: String, //生成的文件后缀名
	filename: String, //生成文件名
	publicPath: String, //公共路径
	url: String,	//访问页面的url
	title: String,  //页面title
	keyword: String, //页面key
	description: String, //页面描述
	content: String, //页面内容配置json
	style: Object, //主题
	startDate: Date, //页面可访问开始时间
	endDate: Date, //页面可访问结束时间
  	status: Boolean, //可见状态
	disabled: Boolean, //是否禁用
	remark: String,
  createDate: {type: Date, default: Date.now},
  updateTime: {type: Date, default: Date.now}
}, {
  versionKey: false,
  timestamps: { createdAt: 'createDate', updatedAt: 'updateTime' }
});

PageSchema.plugin(mongoosePaginate);

var Page = mongoose.model('Page', PageSchema);

module.exports =  Page;