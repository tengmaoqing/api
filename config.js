const path = require('path');

const config = {
  env: "development",
  dbPath: "mongodb://10.0.10.92/hyfyacht",
  COMPath: path.join(__dirname, '../hsb_fd/src/components'),
};

module.exports = config;