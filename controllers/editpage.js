
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = child_process.exec;

const CONFIG = require('../config.js');
const utils = require('../utils');
const PackagePage = require('../utils/packagePage.js');

// console.log(__dirname);
const HTMLSDIR = path.resolve(__dirname, '../HTMLPAGES/');
const H5TPL = path.resolve(__dirname, '../views/h5.html');


function addDirectiveToStr($item, directives) {

  if (!directives || !(directive instanceof Array)) {
    return;
  }
  directives.forEach(item => {
    $item.attr(item.name, JSON.stringify(item.value));
  });
  // return str;
}

function getPageStr(content) {
  let body = '';

  content.forEach((item) => {
    const $ = cheerio.load(item.html);
    const $that = $(`[data-mq-components-name]`);
    $that.attr('data-mq-options', JSON.stringify(item.options));

    if (item.style) {
      $that.css(item.style);
    }

    addDirectiveToStr($that, item.directives);

    let childStr = '';
    if (item.childs) {
      childStr = getPageStr(item.childs);
    }

    $that.find('[data-child-wrap]').html(childStr);

    body += $('body').html();

  });

  return body;
}

function getAllPageCOM (arr, cacheMap = {}) {
  if (!(arr instanceof Array)) {
    return;
  }
  arr.forEach(item => {
    if (!cacheMap[item._id]) {
      cacheMap[item._id] = {
        fileName: item.pathJS,
        asyn: item.asyn,
      };
    }

    if (item.childs) {
      getAllPageCOM(item.childs, cacheMap);
    }
  });
  return Object.values(cacheMap);
};

exports.packagePage = function (req, res, next) {

  const page = req.body;

  if (!page) {
    res.json(utils.dataWrap(null, '！', 1));
    return;
  }

  const content = JSON.parse(page.content);
  PackagePage.package(getAllPageCOM(content), getPageStr(content)).then(result => {

    const cmd = `npm run dev --template`;
    exec(cmd, {
      cwd: path.join(CONFIG.COMPath, '../'),
    }, (err, stdout, stderr) => {

      if (err) {
        res.json(utils.dataWrap(null, '打包错误', -1));
      }

      res.json(utils.dataWrap());
    })
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