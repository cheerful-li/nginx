// require('./task.js');  // 执行系统任务
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var jwt = require("jsonwebtoken");

var login = require("./routes/login.js");
var index = require('./routes/index');
var upload = require('./routes/upload');
var account = require('./routes/account');
var moneyDetail = require('./routes/moneyDetail');
var labelGroup = require('./routes/labelGroup');
var monthHistory = require('./routes/monthHistory');
var chartData = require('./routes/chartData');

var log = require('./routes/log');

// var users = require('./routes/users');


var app = express();

app.use(express.static(__dirname + "/static/css"));
app.use(express.static(__dirname + "/static/js"));
//请求日志文件
app.use("/xhr",log);
//login register处理
app.get('/login.html', function(req, res, next) {
  res.sendFile(path.join(__dirname,"static/html/login.html"));
});
app.use("/xhr", login);

app.use(express.static(__dirname + "/static"));
app.use(express.static(__dirname + "/static/js"));
app.use(express.static(__dirname + "/static/html"));
app.use(express.static(__dirname + "/static/css"));
app.use(express.static(__dirname + "/static/img"));
app.use(express.static(__dirname + "/static/uploadPhoto"));
app.use(express.static(path.join(__dirname, 'public')));

//登陆认证
app.use(function(req, res, next) {
  if(req.headers["Authorization"]){ //for app,get token
    var jwt = require("jsonwebtoken");
    var token = req.headers["Authorization"];
    var userName = jwt.verify(token,"secret key");
    if(userName){
      req.session.userName = userName;
      next();
    }else{
      res.send({code:401,message:"请先登陆"});
    }
  }else{
    if (req.session.userName ) {
      next();
    } else {
     res.redirect("/money/login.html");
     // next();
    }
  }
});

app.use('/xhr', index, upload, account, moneyDetail, labelGroup,monthHistory, chartData);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || true) {
  app.use(function(err, req, res, next) {
    // res.sendStatus(err.status || 500);
    if(req.session.userName){
      //res.redirect("/index.html");
    } else{
      //res.redirect("/login.html");
    }
    console.log(err.message || err ||"系统内部错误！");
    

  });
}


module.exports = app;
