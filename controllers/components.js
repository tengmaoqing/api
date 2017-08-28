
const Component = require('../models/components.js');
const utils = require('../utils');

exports.addComponent = function (req, res, next) {
	const body = req.body;

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
	const currentPage = query.currentPage || 1;
	const pageSize = query.pageSize || 10;


  try {

    (async function(){
      let result = null;
      if (query._id) {
        result = await Component.findOne({_id: query._id}).exec();
      } else {
        result = await Component.paginate({}, {
          page: currentPage,
          limit: pageSize,
          sort: {
            createDate: -1
          }
        });
      }

      res.json(utils.dataWrap(result));
    })() ;

  } catch(err) {
    err.status = 400;
    return next(err);
  }

};

exports.updateComponent = function (req, res, next) {
	const component = req.body;

	Component.update({_id:component._id}, {$set:component}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });
};

exports.deleteComponent = function (req, res, next) {
	const body = req.body;
	const component = {
		_id: body._id,
		disabled: true
	};

	Component.update({_id:component._id}, {$set:component}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });
};
