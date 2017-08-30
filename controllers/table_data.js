
const CONFIG = require('../config.js');
const fs = require('fs');
const path = require('path');
const utils = require('../utils');

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

    res.json(utils.dataWrap(dirs));
  });
}