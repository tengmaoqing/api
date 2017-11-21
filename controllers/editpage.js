
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
const Template = require('../models/templates.js');

// console.log(__dirname);
const ASSETSROOT = 'dist_page/m6';
const EVNS = {
  PRODUCTION: 'production',
  DEV: 'dev',
  TEST: 'test'
};

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
  $html('body>*').remove(':not(script):not(link)');
  $html('body').prepend(bodyStr);

  return $html.html('html');
}

function fillTemplate (page, EVN) {
  return (async function () {
    let templateHTML = '';
    const templateObj = await Template.findOne({_id: page.templateId}).exec();

    if (templateObj && templateObj.toObject()) {
      templateHTML = templateObj.html;
    }
    if (!templateHTML) {
      templateHTML = page.template;
    }
    if (!templateHTML) {
      return;
    }

    const $ = cheerio.load(templateHTML);
    const head = $('head');

    head.append('<!-- engine by TMQ -->');
    if (EVNS.PRODUCTION !== EVN) {
      head.append(`<script>
        document.domain = '127.0.0.1';
        window.domain = '127.0.0.1';
        </script>`);
    }

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
  })();
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
  if (component.asyn) {
    return `
    import('${fileName}').then(${randomName} => {
      ${
        component.randomIDs.map(item => `mqManger.startCP(${randomName}, ${item})` ).join(`;
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

function buildTempFile (page, opt) {
  const content = JSON.parse(page.content);
  const JSFILE = opt.entry;
  const HTMLFILE = opt.tpl;
  const ENV = opt.env

  let jsContent = `
    /* eslint-disable */
    ${baseJS}
  `;
  getAllPageCOM(content).forEach((component) => {
    jsContent += getComponent(component);
  });
  return (async function () {
    const template = await fillTemplate(page, ENV);

    const js = {
      path: `${CONFIG.COMPath}/${JSFILE}`,
      content: jsContent,
    };

    const html = {
      path: `${CONFIG.COMPath}/${HTMLFILE}`,
      content: getPageStr(content, template),
    };
    return PackagePage.package(js, html);
  })();
};

exports.genPage = function (req, res, next) {
  const page = req.body;

  if (!page) {
    res.json(utils.dataWrap(null, '没有页面数据', 1));
    return;
  }

  return (async function () {
    const template = await fillTemplate(page, EVNS.PRODUCTION);
    const extension = page.extension || 'html';

    const html = {
      path: path.join(CONFIG.COMPath, '../..', `/${ASSETSROOT}/${page.name}/${page.filename}.${extension}`),
      content: getPageStr(JSON.parse(page.content), template),
    };
    console.log(html.path);
    fs.writeFile(html.path, html.content, (err) => {
      if (err) {
        console.log(err);
        res.json(utils.dataWrap(null, '生成文件错误', 1));
        return;
      }

      res.json(utils.dataWrap());
    });
  })();
};

exports.packagePage = function (req, res, next) {

  const page = req.body;

  if (!page) {
    res.json(utils.dataWrap(null, '没有页面数据', 1));
    return;
  }

  const options = {
    entry: 'template_test.js',
    tpl: 'template_test.html',
    env: 'dev'
  };

  buildTempFile(page, options).then(result => {
    res.json(utils.dataWrap());
  });
};

/**
 * 构建上线
 * @Author   TMQ
 * @DateTime 2017-10-17T21:06:10+0800
 * @param    {[type]}                 req  [description]
 * @param    {[type]}                 res  [description]
 * @param    {Function}               next [description]
 * @return   {[type]}                      [description]
 */
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

    const BUILDOPTIONS = {
      entry: `product_${result.name}.js`,
      tpl: `product_${result.name}.html`,
      env: 'production'
    };

    await buildTempFile(result, BUILDOPTIONS);

    res.json(utils.dataWrap(null));

    const templatePath = path.join(CONFIG.COMPath, BUILDOPTIONS.tpl);
    const publicPath = path.normalize(result.publicPath || '/');
    const entry = path.join(CONFIG.COMPath, BUILDOPTIONS.entry);

    let cmd = `node build/build.js --template ${templatePath} --entry ${entry} --pagename ${result.name}`;

    if (result.productname) {
      cmd += ` --productname ${result.productname} `;
    }

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

      console.log(stdout);
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
