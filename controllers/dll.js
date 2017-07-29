/*
* @Author: tengmaoqing
* @Date:   2018-01-12 15:08:47
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2018-01-12 15:13:10
*/

const Dll = require('../models/dll.js');
const utils = require('../utils');

exports.addDll = function (req, res, next) {
  const body = req.body;

  if (!body.name) {
      res.json(utils.dataWrap(null, 'name 是必须的', 1));
      return;
  }

  const dll = new Dll(body);

  dll.save(function(err, data) {
    if (err) {
      res.json(utils.dataWrap(err, '', -1));
      return;
    }

    res.json(utils.dataWrap(null));
  });

};

exports.getDll = function (req, res, next) {
  const query = req.query;
  const currentPage = Number(query.currentPage) || 1;
  const pageSize = Number(query.pageSize) || 20;

  Dll.paginate({}, {
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

exports.updateDll = function (req, res, next) {
  const dll = req.body;

  Dll.update({_id:dll._id}, {$set:dll}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });
};

exports.deleteDll = function (req, res, next) {

  const body = req.query;
  const dll = {
    _id: body._id,
    disabled: true
  };

  Dll.update({_id:dll._id}, {$set:dll}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });

};