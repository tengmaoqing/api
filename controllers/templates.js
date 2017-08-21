
const Template = require('../models/templates.js');
const utils = require('../utils');

exports.addTemplate = function (req, res, next) {
	const body = req.body;

	if (!body.name) {
    	res.json(utils.dataWrap(null, 'name 是必须的', 1));
    	return;
	}

	const template = new Template(body);

	template.save(function(err, data) {
		if (err) {
			res.json(utils.dataWrap(err, '', -1));
			return;
		}

		res.json(utils.dataWrap(null));
	});

};

exports.getTemplates = function (req, res, next) {
	const query = req.query;
	const currentPage = query.currentPage || 1;
	const pageSize = query.pageSize || 10;

	Template.paginate({}, {
		page: currentPage,
    limit: pageSize,
    sort: {
      createDate: -1
    }
	}, (err, result) => {
		if (err) {
			err.status = 400;
			return next(err);
		}

		res.json(utils.dataWrap(result));
	});
};

exports.updateTemplate = function (req, res, next) {

};

exports.deleteTemplate = function (req, res, next) {

};
