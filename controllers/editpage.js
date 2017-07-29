
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const spawn = child_process.spawn;
const exec = child_process.exec;

const htmlEncode = require('htmlencode').htmlEncode;
const Page = require('../models/pages.js');
const Project = require('../models/project.js');
const CONFIG = require('../config.js');
const utils = require('../utils');
const PackagePage = require('../utils/packagePage.js');
const Template = require('../models/templates.js');
const Component = require('../models/components.js');
const Dll = require('../models/dll.js');

// console.log(__dirname);
const ASSETSROOT = 'dist_page/m6';
const entrPath = path.join(CONFIG.COMPath, '../ztemps');
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

      if (!(fn instanceof Function)) {
        return;
      }

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
    if (!item.html) {
      return;
    }
    const $ = cheerio.load(item.html);
    const $that = $('body').children();

    $that.attr('data-mq-options', htmlEncode(JSON.stringify(item.options)));

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

  const $html = cheerio.load(template, {decodeEntities: false});
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

    const $ = cheerio.load(templateHTML, {decodeEntities: false});
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
    import('@/components/${fileName}').then(${randomName} => {
      if (${randomName} instanceof Function) {
        ${
          component.randomIDs.map(item => `mqManger.startCP(${randomName}, ${item})` ).join(`;
        `)
        }
      }
    });
    `;
  }
  return `
  import ${randomName} from '@/components/${fileName}';
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
      path: `${entrPath}/${JSFILE}`,
      content: jsContent,
    };

    const html = {
      path: `${entrPath}/${HTMLFILE}`,
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

  (async function () {

    const project = await Project.findOne({_id: page.projectId});
    if (project) {
      if (!page.templateId && project.templateId) {
        page.templateId = project.templateId;
      }

      /**
       * 开发模式注入项目公共资源
       * @type {[type]}
       */
      const commonSrc = project.commonSrc;
      if (commonSrc) {
        page.content = JSON.parse(page.content);
        page.content = commonSrc.map(srcObj => ({
          pathJS: srcObj.src,
          _id: +new Date() + Math.random().toString(32).slice(2),
        })).concat(page.content);
        page.content = JSON.stringify(page.content);
      }
    }

    await buildTempFile(page, options);
    res.json(utils.dataWrap());
  })().catch(err => {
    console.log(err);
  });
};

exports.componentsDev = function (req, res, next) {
  const componentId = req.params.componentId;
  (async function () {
    const component = await Component.findOne({_id: componentId}).exec();

    if (!component) {
      res.json(utils.dataWrap(null, '没有找到组件！', -1));
      return;
    }

    let DEVHTML = '';
    if (component.pathHTML) {
      DEVHTML = `<div>\${require('${ '@/components/' + component.pathHTML }')}</div>`;
    } else {
      DEVHTML = component.html;
    }

    const htmlId = 'worjisf';
    const $ = cheerio.load(DEVHTML, {decodeEntities: false});
    const $that = $('body').children();
    $that.attr('id', htmlId);
    DEVHTML = $('body').html();

    let DEVJS = `/* eslint-disable */
      ${baseJS}
      import heHEHE from '@/components/${component.pathJS}';
      if (heHEHE instanceof Function) {
        heHEHE(document.querySelector('#${ htmlId }').children[0]);
      }
    `

    const DEVJSPATH = path.join(entrPath, 'template_dev.js');
    const DEVHTMLPATH = path.join(entrPath, 'template_dev.html');
    fs.writeFile(DEVJSPATH, DEVJS, 'utf8', err => {if (err) {console.log('DEV 文件失败')}});
    fs.writeFile(DEVHTMLPATH, DEVHTML, 'utf8', err => {if (err) {console.log('DEV 文件失败')}});

    res.json(utils.dataWrap());
  })();
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

  let environment = options.environment === EVNS.TEST ? EVNS.TEST : EVNS.PRODUCTION;
  (async function(){
    let results = [];
    const pages = options.pages || [options.pageID];

    for (let pageid of pages) {
      const page = await Page.findOne({_id: pageid}).exec();
      if (page) {
        results.push(page);
      }
    }

    if (!results.length) {
      res.json(utils.dataWrap(null, '没有找到页面！', -1));
      return;
    }

    let firstProject = null;
    const pageObjs = [];
    for (let result of results) {
      //  生成模板
      const BUILDOPTIONS = {
        entry: `product_${result.name}.js`,
        tpl: `product_${result.name}.html`,
        env: EVNS.PRODUCTION
      };

      const project = await Project.findOne({_id: result.projectId});

      if (!result.templateId && project && project.templateId) {
        !firstProject && (firstProject = project);
        result.templateId = project.templateId;
      }

      await buildTempFile(result, BUILDOPTIONS);

      const templatePath = path.join(entrPath, BUILDOPTIONS.tpl);
      const publicPath = path.normalize(result.publicPath || '/');
      const entry = path.join(entrPath, BUILDOPTIONS.entry);
      const pageObj = {
        template: templatePath,
        entry,
        pagename: result.name,
        // filename: result.filename,
        extension: result.extension || 'html'
      };
      pageObjs.push(pageObj);
    }

    res.json(utils.dataWrap(null));

    const productname = firstProject.name;
    let cmd = `node build/build.js --environment ${environment} --pageObjs ${Buffer.from(JSON.stringify(pageObjs)).toString('base64')} `;
    if (firstProject) {
      let publicPath = firstProject.publicPath;
      if (environment === EVNS.TEST) {
        publicPath = firstProject.testPublicPath;
      }
      cmd += ` --productname ${productname} `;
      if (firstProject.commonSrc) {
        cmd += ` --commonSrc ${Buffer.from(JSON.stringify(firstProject.commonSrc)).toString('base64')} `;
      }

      if (publicPath) {
        cmd += ` --publicPath ${publicPath} `;
      }

      if (firstProject.dllId) {
        dll = await Dll.findOne({_id: firstProject.dllId});
        if (dll) {
          cmd += `--dllName ${getDllFileName(dll)}`
        }
      }

      const remUnit = firstProject.remUnit || 0;
      cmd += ` --px2Rem ${remUnit} `;
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
};

const getDllFileName = (data) => {
  return data.name + (+new Date(data.updateTime));
}

exports.doDll = function (req, res, next) {
  const dllId = req.query.dll;

  if (!dllId) {
    res.json(utils.dataWrap(null, '没有找到资源！', -1));
    return;
  }

  Dll.findOne({_id: dllId}).then(data => {
    if (!data) {
      res.json(utils.dataWrap(null, '没有找到资源！', -1));
      return;
    }

    const dllObj = {
      flieName: getDllFileName(data),
      venders: data.venders
    };

    let cmd = `node build/webpack.dll.conf.js --dllObj ${Buffer.from(JSON.stringify(dllObj)).toString('base64')} `;
    exec(cmd, {
      cwd: path.join(CONFIG.COMPath, '../../'),
    }, (err, stdout, stderr) => {

      if (err) {
        console.log(err);
        return;
      }

      console.log(stdout);
    });
    res.json(utils.dataWrap(null));
  });
};
