
const Component = require('../models/components.js');
const utils = require('../utils');

exports.addComponent = function (req, res, next) {
	const body = req.body;
	
	console.log(body);
	if (!body.name) {
    	res.json(utils.dataWrap(null, 'name 是必须的', 1));
    	return;
	}

	const component = new Component(body);

	component.save(function(err, data) {
		console.log(data);
		if (err) {
			res.json(utils.dataWrap(err, '', -1));
			return;
		}

		res.json(utils.dataWrap(null));
	});

};

exports.getComponents = function (req, res, next) {
	const query = req.query;

	Component.find().then(data => {
		console.log(data);
		res.json(utils.dataWrap(data));
	}).catch(err => next(err));
};

exports.updateComponent = function (req, res, next) {
	
};

exports.deleteComponent = function (req, res, next) {
	
};
