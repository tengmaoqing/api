
const utils = require('../utils');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// console.log(__dirname);
const HTMLSDIR = path.resolve(__dirname, '../HTMLPAGES/');
const H5TPL = path.resolve(__dirname, '../views/h5.html');

exports.h5Base = function (req, res, next) {

  let uri = req.query.uri;
  res.render('h5', { content: '<div>123</div> <h2>134455</h2>' });

};

exports.generateTpl = function (req, res, next) {

  var body = req.body;

  var pageName = body.pageName;

  if (!pageName) {
    res.json(utils.dataWrap(null, 'pageName 是必须的', 1));
    return;
  }

  var readerStream = fs.createReadStream(H5TPL);
  var writerStream = fs.createWriteStream(HTMLSDIR + '/' + pageName);

  writerStream.on('finish', () => {

    res.json(utils.dataWrap());
  })
  readerStream.pipe(writerStream);
};

exports.updatePage = function (req, res, next) {
  let body = req.body;

  var pageName = body.pageName;
  var pageData = body.pageData;

  if (!pageName) {
    res.json(utils.dataWrap(null, 'pageName 是必须的', 1));
    return;
  }

  fs.writeFile(HTMLSDIR + '/' + pageName, pageData, function (err) {

    if (err) {
      next(err);
      return;
    }

    res.json(utils.dataWrap({}))

  })

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