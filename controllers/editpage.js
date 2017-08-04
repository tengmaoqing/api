
const utils = require('../utils');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

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


exports.h5Base = function (req, res, next) {

  let uri = req.query.uri;
  res.render('h5', { content: '<div>123</div> <h2>134455</h2>' });

};

exports.viewByPageName = function (req, res, next) {

  var query = req.query;

  var pageName = query.pageName;

  if (!pageName) {
    res.json(utils.dataWrap(null, 'pageName 是必须的', 1));
    return;
  }

  const page = {
    pageName: 'test.html',
    pageID: 'SDDDF',
    title: 'test',
    description: 'test',
    template: 'h5',
    content: [
      {
        type: 'base',
        name: 'test',
        id: 'SDFGGGHSA',
        options: {
          text: 'yoyo', name: 'test',
        },
        html: '<div class="test1" data-mq-components-name="test"><h4>h4</h4><span class="hah">我是测试</span> <div class="data-mq-child"></div></div>',
        style: {
          width: '300px',
          padding: '20px',
          margin: '20px',
          height: '100px',
        },
        directives: [{
          name: 'data-directive-test',
          value: 'hahah'
        },{
          name: 'data-directive-test2',
          value: {
            url: 'baidu'
          }
        }],
        childs: [
          {
            name: 'child1',
            id: 'SDFGGGHSA',
            options: {
              text: 'yoyo', name: 'child1',
            },
            html: '<div class="test1" data-mq-components-name="child1"><h4>h4</h4><span>child1</span></div>',
          }
        ]
      },
    ],
  };

  fs.readFile(HTMLSDIR + '/' + page.pageName, function (err, data) {
    if (err) {
       return next(err);
    }

    $ = cheerio.load(data.toString());

    $('body').prepend(getPageStr(page.content));
    console.log("异步读取: " + data.toString());
  });




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