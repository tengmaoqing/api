
const cheerio = require('cheerio');
const fs = require('fs');


exports.getDomByXPathFromHTMLStr = function (str, xpth) {

  var $ = cheerio.load(str);

  return $.find('str');
}

exports.updateHtmlByXPath = function(xpth, str) {

}