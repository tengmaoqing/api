/*
* @Author: tengmaoqing
* @Date:   2018-02-03 14:43:28
* @Last Modified by:   tengmaoqing
* @Last Modified time: 2018-02-03 14:46:27
*/
const fs = require('fs');

exports.readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};
