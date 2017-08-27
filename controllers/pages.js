
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
	const currentPage = query.currentPage || 1;
	const pageSize = query.pageSize || 10;

	Page.paginate({}, {
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

exports.updatePage = function (req, res, next) {
	const page = req.body;

	Page.update({_id:page._id}, {$set:page}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }
      
    return res.json(utils.dataWrap());
  });
};

exports.deletePage = function (req, res, next) {
	const body = req.body;
	const page = {
		_id: body._id,
		disabled: true
	};

	Page.update({_id:page._id}, {$set:page}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }
      
    return res.json(utils.dataWrap());
  });
};
