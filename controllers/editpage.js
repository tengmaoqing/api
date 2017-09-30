
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = child_process.exec;

const Page = require('../models/pages.js');
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

const baseJS = `
  window.mqManger = {
    _fns: {},
    startCP(fn, id) {
      if (!this._fns[id]) {
        this._fns[id] = fn;
      }

      fn(document.querySelector('[data-mq-id="' + id + '"]'));
    }
  };
`;

function getPageBody(content) {
  let body = '';
  content.forEach((item) => {
    const $ = cheerio.load(item.html);
    const $that = $('body').children();
    $that.attr('data-mq-options', JSON.stringify(item.options));

    if (item.style) {
      $that.css(item.style);
    }

    addDirectiveToStr($that, item.directives);

    let childStr = '';
    if (item.childs) {
      childStr = getPageBody(item.childs);
    }

    $that.find('[data-child-wrap]').html(childStr);

    body += $('body').html();

  });

  return body;
}

function getPageStr(content, template) {

  const $html = cheerio.load(template);
  const bodyStr = getPageBody(content);
  $html('body').prepend(bodyStr);

  return $html.html('html');
}

function fillTemplate (page) {
  if (!page.template) {
    return;
  }

  const $ = cheerio.load(page.template);

  const head = $('head');

  head.append('<!-- engine by TMQ -->');
  head.append(`<script>
    document.domain = '127.0.0.1';
    window.domain = '127.0.0.1';
    </script>`);
  if (page.title) {
    $('title').remove();
    head.append(`<title>${page.title}</title>`);
  }

  if (page.description) {
    $('[name=description]').remove();
    head.append(`<meta name="keywords" content="${page.description}">`);
  }

  if (page.keyword) {
    $('[name=keywords]').remove();
    head.append(`<meta name="keywords" content="${page.keyword}">`);
  }

  if (page.head) {
    head.append(page.head);
  }

  if (page.footer) {
    $('body').append(page.footer);
  }

  return $.html('html');
};

function getAllPageCOM (arr, cacheMap = {}) {
  if (!(arr instanceof Array)) {
    return [];
  }
  arr.forEach(item => {
    // const cp = {
    //   fileName: item.pathJS,
    //   asyn: item.asyn,
      // randomIDs: [item.$compoentRandomID],
    // };
    if (item.pathJS) {
      if (!cacheMap[item._id]) {
        cacheMap[item._id] = {
          fileName: item.pathJS,
          asyn: item.asyn,
          randomIDs: [item.$compoentRandomID],
        };
      } else {
        cacheMap[item._id].randomIDs.push(item.$compoentRandomID);
      }
    }

    if (item.childs) {
      getAllPageCOM(item.childs, cacheMap);
    }
  });
  return Object.values(cacheMap);
};


function getComponent(component) {
  const fileName = component.fileName;
  const randomName = `MQ_${+new Date()}${Math.random().toString(32).slice(2)}`;
  console.log(randomName);
  if (component.asyn) {
    return `
    import('${fileName}').then(${randomName} => {
      ${
        component.randomIDs.map(item => `${randomName}(document.querySelector([data-mq-id="${item}"]))`).join(`;
        `)
      }
    });
    `;
  }
  return `
  import ${randomName} from '${fileName}';
  if (${randomName} instanceof Function) {
    ${
      component.randomIDs.map(item => `mqManger.startCP(${randomName}, ${item})` ).join(`;
      `)
    }
  }

  `;
};

exports.packagePage = function (req, res, next) {

  const page = req.body;

  if (!page) {
    res.json(utils.dataWrap(null, '！', 1));
    return;
  }

  const content = JSON.parse(page.content);
  let jsContent = `
    /* eslint-disable */
    ${baseJS}
  `;
  getAllPageCOM(content).forEach((component) => {
    jsContent += getComponent(component);
  });

  const template = fillTemplate(page);

  const js = {
    path: `${CONFIG.COMPath}/template_test.js`,
    content: jsContent,
  };

  const html = {
    path: `${CONFIG.COMPath}/template_test.html`,
    content: getPageStr(content, template),
  };
  PackagePage.package(js, html).then(result => {
    res.json(utils.dataWrap());
  });
};

exports.doStructure = function (req, res, next) {
  // const cmd = `node build/dev-server.js --template ./page_components/template_test.html --port 8090 --openBrowser false --entry template_test.js`;

  const options = req.body;

  (async function(){
    let result = null;
    result = await Page.findOne({_id: options.pageID}).exec();

    if (!result) {
      res.json(utils.dataWrap(null, '没有找到页面！', -1));
      return;
    }

    res.json(utils.dataWrap(null));

    const templatePath = path.join(CONFIG.COMPath, 'template_test.html');
    const publicPath = path.normalize(result.publicPath);
    const entry = path.join(CONFIG.COMPath, 'template_test.js');

    let cmd = `node build/build.js --template ${templatePath} --entry ${entry} --productname ${result.name}`;

    if (result.filename) {
      cmd += ` --filename ${result.filename} `;
    }

    if (result.extension) {
      cmd += ` --extension ${result.extension} `;
    }

    if (result.publicPath) {
      cmd += ` --publicPath ${publicPath} `;
    }

    console.log(cmd);

    const child = exec(cmd, {
      cwd: path.join(CONFIG.COMPath, '../../'),
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(err);
        return;
      }


    });

  })() ;

  return;

  // child.on('close', (code, signal) => console.log(`child code ${code} signal ${signal}`));
  // setTimeout(() => {
  //   console.log('close child');
  //   child.send({ exec: 'exit' });
  //   child.kill();
  // }, 5000);
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