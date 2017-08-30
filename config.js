const path = require('path');

const config = {
  env: "development",
  dbPath: "mongodb://localhost/hyfyacht",
  COMPath: path.join(__dirname, '../hsb_counpon/page_components'),
};

module.exports = config;