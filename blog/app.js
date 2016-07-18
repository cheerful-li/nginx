var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var upload = require('./routes/upload.js');
var blog = require('./routes/blog.js');
var views = require('./routes/views.js');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'build'),{maxAge:'365 days'}));
app.use(express.static(path.join(__dirname, 'build/pages'),{maxAge:'365 days'}));
app.use(express.static(path.join(__dirname, 'public'),{maxAge:'365 days'}));
app.use(express.static(path.join(__dirname, 'public/pages'),{maxAge:'365 days'}));

app.engine('.html',require('ejs').__express);
app.set("view engine",'html');
app.set("view options",{layout:false});
app.set('views',path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/',views);

//登陆判断
app.use(function(req,res,next){
	if(!req.session.userName){
		res.send({code:401,message:'need login!'});
	}else{
		next();
	}
})
//以下是需要登陆的接口

app.use('/xhr/',upload);
app.use('/xhr/',blog);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found the request');
  err.status = 404;
  next(err);
});



module.exports = app;
