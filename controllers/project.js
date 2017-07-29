/*
* @Author: tengmaoqing
* @Date:   2017-11-22 10:06:37
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2018-01-24 19:56:58
*/


const fs = require('fs');
const path = require('path');
const Project = require('../models/project.js');
const utils = require('../utils');
const CONFIG = require('../config.js');

exports.addProject = function (req, res, next) {
  const body = req.body;

  if (!body.name) {
      res.json(utils.dataWrap(null, 'name 是必须的', 1));
      return;
  }

  const project = new Project(body);

  project.save(function(err, data) {
    console.log(data);
    if (err) {
      res.json(utils.dataWrap(err, '', -1));
      return;
    }

    res.json(utils.dataWrap(null));
  });

};

exports.getProject = function (req, res, next) {
  const query = req.query;
  const currentPage = Number(query.currentPage) || 1;
  const pageSize = Number(query.pageSize) || 30;

  (async function(){
    let result = null;
    result = await Project.paginate({}, {
      page: currentPage,
      limit: pageSize,
      sort: {
        createDate: -1
      }
    });

    res.json(utils.dataWrap(result));
  })().catch(err => {
    err.status = 500;
    return next(err);
  });

};

exports.updateProject = function (req, res, next) {
  const project = req.body;

  Project.update({_id:project._id}, {$set:project}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });
};

exports.deleteProject = function (req, res, next) {
  const body = req.query;
  const project = {
    _id: body._id,
    disabled: true
  };

  Project.update({_id:project._id}, {$set:project}, function(err, result){
    if(err) {
      err.status = 400;
      return next(err);
    }

    return res.json(utils.dataWrap());
  });
};