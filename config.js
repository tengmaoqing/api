const path = require('path');

const config = {
  env: "development",
  dbPath: "mongodb://127.0.0.1/hyfyacht",
  COMPath: path.join(__dirname, '../hsb_fd/src/components'),
};

module.exports = config;