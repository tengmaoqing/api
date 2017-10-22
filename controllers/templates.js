
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
	const currentPage = Number(query.currentPage) || 1;
	const pageSize = Number(query.pageSize) || 20;

	Template.paginate({}, {
		page: currentPage,
    limit: pageSize,
    sort: {
      createDate: -1
    }
	}).then(result => {
		res.json(utils.dataWrap(result));
	}).catch(err => {
		if (err) {
			err.status = 400;
			return next(err);
		}
	});
};

exports.updateTemplate = function (req, res, next) {
	const template = req.body;

	Template.update({_id:template._id}, {$set:template}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });
};

exports.deleteTemplate = function (req, res, next) {

	const body = req.body;
	const template = {
		_id: body._id,
		disabled: true
	};

	Template.update({_id:template._id}, {$set:template}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });

};
