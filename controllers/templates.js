
const Template = require('../models/templates.js');
const utils = require('../utils');

exports.addTemplate = function (req, res, next) {
	const body = req.body;
	
	console.log(body);
	if (!body.name) {
    	res.json(utils.dataWrap(null, 'name 是必须的', 1));
    	return;
	}

	const template = new Template(body);

	template.save(function(err, data) {
		console.log(data);
		if (err) {
			res.json(utils.dataWrap(err, '', -1));
			return;
		}

		res.json(utils.dataWrap(null));
	});

};

exports.getTemplates = function (req, res, next) {
	const query = req.query;

	Template.find().exce().then(data => {
		console.log(data);
		res.json(utils.dataWrap(data));
	}).catch(err => next(err));
};

exports.updateTemplate = function (req, res, next) {
	
};

exports.deleteTemplate = function (req, res, next) {
	
};
