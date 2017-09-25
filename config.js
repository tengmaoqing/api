const path = require('path');

const config = {
  env: "development",
  dbPath: "mongodb://localhost/hyfyacht",
  COMPath: path.join(__dirname, '../../program1/web develop/program/worker/src'),
};

module.exports = config;