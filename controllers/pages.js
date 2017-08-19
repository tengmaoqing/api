
const Page = require('../models/pages.js');
const utils = require('../utils');

exports.addPage = function (req, res, next) {
	const body = req.body;
	
	console.log(body);
	if (!body.name) {
    	res.json(utils.dataWrap(null, 'name 是必须的', 1));
    	return;
	}

	const page = new Page(body);

	page.save(function(err, data) {
		console.log(data);
		if (err) {
			res.json(utils.dataWrap(err, '', -1));
			return;
		}

		res.json(utils.dataWrap(null));
	});

};

exports.getPages = function (req, res, next) {
	const query = req.query;

	Page.find().then(data => {
		console.log(data);
		res.json(utils.dataWrap(data));
	}).catch(err => next(err));
};

exports.updatePage = function (req, res, next) {
	
};

exports.deletePage = function (req, res, next) {
	
};
