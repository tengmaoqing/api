
const fs = require('fs');
const path = require('path');
const util = require('util');
const glob = require("glob");
const utils = require('../utils');
const CONFIG = require('../config.js');
const ENUVALUES = require('../models/enumeration_values');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

function fsExistsSync(pa) {
    try{
        fs.accessSync(pa, fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}

exports.getAllCOM = function (res, res, next) {

  fs.readdir(CONFIG.COMPath, function(err, files) {

    if (err) {
      return next(err);
    }

    const dirs = files.filter(item => {
      const fpath = path.join(CONFIG.COMPath, item);
      const stats = fs.statSync(fpath);
      if (stats.isDirectory()) {
        return true;
      }
      // console.log(item);
    });

    async function getDir () {
      let result = [];
      for (var i = dirs.length - 1; i >= 0; i--) {
        const componentJson = path.join(CONFIG.COMPath, dirs[i], 'component.json');
        let filename = 'index.js';
        if (fsExistsSync(componentJson)) {
          let cJSON = await readFile(componentJson);
          cJSON = JSON.parse(cJSON);
          filename = cJSON.main;
        }

        if (fsExistsSync(path.join(CONFIG.COMPath, dirs[i], filename))) {
          result.push(`./${dirs[i]}/${filename}`);
        }
      }
      res.json(utils.dataWrap(result));
    }

    getDir();

  });
}

exports.getAllCOMHTML = function (res, res, next) {

  glob('*/*.html', {
    cwd: CONFIG.COMPath,
  }, (err, result) => {
    if (err) {
      next(err);
      return;
    }

    res.json(utils.dataWrap(result));
  })
};

exports.getAllSRC = function (res, res, next) {

  glob('../common/**/*.*(js|css)', {
    cwd: CONFIG.COMPath,
  }, (err, result) => {
    if (err) {
      next(err);
      return;
    }

    res.json(utils.dataWrap(result));
  })
};

exports.getCategorys = function (res, res, next) {
  const CATEGORY = ENUVALUES.CATEGORY;
  const Categorys = [
    {
      typeId: CATEGORY.COMPONENT,
      des: '组件',
    },
    {
      typeId: CATEGORY.PAGE,
      des: '页面',
    },
    {
      typeId: CATEGORY.TEMPLATE,
      des: '模板',
    },
    {
      typeId: CATEGORY.PROJECT,
      des: '项目',
    },
    {
      typeId: CATEGORY.DLL,
      des: '动态库dll',
    }
  ];

  res.json(utils.dataWrap(Categorys));
};
