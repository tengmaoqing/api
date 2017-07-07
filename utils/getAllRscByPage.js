
const cheerio = require('cheerio');
// const request = require('request');
const rp = require('request-promise');


module.exports = function (uri, opt) {

  const rpOptions = {
    uri,
    transform: function (body) {
        return cheerio.load(body);
    }
  };


  return new Promise((resolve, reject) => {

    rp(rpOptions).then($ => {

      const getSRC = function (type, attr) {
        return Array.prototype.map.call($(type), item => $(item).attr(attr)).filter(item => item)
      }
      // console.log($('script'))
      // console.log(Array.prototype.map.call($('script'), item => $(item).attr('src')).filter(item => item));
      const result = {
        js: getSRC('script', 'src'),
        css: getSRC('link', 'href'),
        img: getSRC('img', 'src')
      };

      // console.log(result);
      resolve(result);
    }).catch(err => {
      console.log(err);
      reject(err);
    })
  })
};