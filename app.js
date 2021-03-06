var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var timeout = require('connect-timeout')
var swig = require('swig');

var config = require('./config.js');
var index = require('./routes/index');
var users = require('./routes/users');
var sw    = require('./routes/service_worker');
var editpage  = require('./routes/editpage');
var tableData  = require('./routes/table_data');

var app = express();


app.engine('html', swig.renderFile);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('view cache', false);
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(timeout('6s'))
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'HTMLPAGES')));

app.use(function(req, res, next) {
  if(!req.timedout) next();
});

var timeout = require('connect-timeout');

// mongoose.Promise = global.Promise;
mongoose.connect(config.dbPath,{useMongoClient: true});


app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Udid, Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
    return;
  } else {
    return next();
  }
});

app.use('/', index);
app.use('/users', users);
app.use('/service_worker', sw);


app.use('/createPage', editpage);
app.use('/tableData', tableData);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
