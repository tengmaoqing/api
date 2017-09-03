
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const utils = require('../utils');
const PackagePage = require('../utils/packagePage.js');

// console.log(__dirname);
const HTMLSDIR = path.resolve(__dirname, '../HTMLPAGES/');
const H5TPL = path.resolve(__dirname, '../views/h5.html');


function addDirectiveToStr($item, directives) {

  directives.forEach(item => {
    $item.attr(item.name, JSON.stringify(item.value));
  });
  // return str;
}

function getPageStr(content) {
  let body = '';

  content.forEach((item) => {
    const $ = cheerio.load(item.html);
    const $that = $(`[data-mq-components-name=${item.name}]`);

    $that.attr('data-mq-options', JSON.stringify(item.options));

    if (item.style) {
      $that.css(item.style);
    }

    addDirectiveToStr($taht, item.directives);

    let childStr = '';
    if (item.childs) {
      childStr = getPageStr(item.childs);
    }

    $that.find('[data-child-wrap]').html(childStr);

    body += $('body').html();
    // if ()
    // if (item.directives) {
    // }
  });
  return body;
}

exports.packagePage = function (req, res, next) {

  PackagePage.package().then(result => {
    res.json(utils.dataWrap())
  });
};


exports.h5Base = function (req, res, next) {

  let uri = req.query.uri;
  res.render('h5', { content: '<div>123</div> <h2>134455</h2>' });

};



exports.getComponents = function (req, res) {

  const components = [{
    name: 'button',
    html: '<button class="button button-default">我是button</button>',
    options: {

    },
    componentId: 12345,
    createDate: 124,
  },{
    name: 'container',
    html: '<div class="container"></div>',
    componentId: 2346
  }];

  res.json(utils.dataWrap(components));

};

exports.getDirectives = function (req, res) {

  const directives = [{
    name: '发短信',
    directive: 'data-sendmsg',
    options: {

    },
    componentId: 12345,
    createDate: 124,
  }];

  res.json(utils.dataWrap(directives));

};