
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
    const $that = $(`[data-mq-components]`);
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
    return [];
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


function getComponent(component) {
  const fileName = component.fileName;
  if (component.asyn) {
    return `
    import('${fileName}');`;
  }
  return `
  import '${fileName}';`;
};

exports.packagePage = function (req, res, next) {

  const page = req.body;

  if (!page) {
    res.json(utils.dataWrap(null, '！', 1));
    return;
  }

  const content = JSON.parse(page.content);
  let jsContent = '';
  getAllPageCOM(content).forEach((item) => {
    jsContent += getComponent(item);
  });

  const js = {
    path: `${CONFIG.COMPath}/template_test.js`,
    content: jsContent,
  };

  const html = {
    path: `${CONFIG.COMPath}/template_test.html`,
    content: getPageStr(content),
  };
  PackagePage.package(js, html).then(result => {
    res.json(utils.dataWrap());
  });
};

exports.doStructure = function (req, res, next) {
  const cmd = `node build/dev-server.js --template ./page_components/template_test.html --port 8090 --openBrowser false --entry template_test.js`;
  const child = exec(cmd, {
    cwd: path.join(CONFIG.COMPath, '../'),
  }, (err, stdout, stderr) => {

    if (err) {
      console.log(err);
      return;
    }
  });

  child.on('close', (code, signal) => console.log(`child code ${code} signal ${signal}`));
  setTimeout(() => {
    console.log('close child');
    child.send({ exec: 'exit' });
    child.kill();
  }, 5000);
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