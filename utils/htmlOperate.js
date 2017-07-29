
const cheerio = require('cheerio');
const fs = require('fs');


exports.readyDomByXPath = function (str, xpth) {

  var $ = cheerio.load(str);

  return $.find('str');
}