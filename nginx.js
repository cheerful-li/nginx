var express = require('express');
var app = express();
var projects = ['blog','money']; //子项目
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
require('./util/common.js');
//配置文件
var config = require("./config.json");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser(config.secret));
app.use(session());


//统一登陆接口
app.use('/xhr/login',function(req,res){
	console.log(config);
	console.log(req.userName)
	if(req.body.userName == config.userName && req.body.password == config.password){
		req.session.userName = req.body.userName;
		res.send({code:200,result:'ok'});
	}else{
		res.send({code:400,message:'账号或者密码错误'});
	}
});
app.use('/xhr/logout',function(req,res){
	delete req.session.userName ;
	res.send({code:200,result:'ok'});
});

//子项目注册
projects.forEach(function(name){
	app.use('/'+name,require('./'+name+'/app.js'))
});

app.use(express.static(path.join(__dirname, 'public')));

//网站默认路径设置
app.get('/',function(req,res,next){
	//子域名处理
	if(projects.indexOf(req.subdomains[0]) !== -1 ){
		res.redirect("/"+req.subdomains[0]);
	}else{
		res.redirect("/blog/");
	}
	
})
//错误处理
app.use(function(err,req,res,next){
	console.log(err);
	res.status(500).send("something is wrong");
});

var port = process.env.PORT||80;
app.listen(port,function(){
	console.log("server listen at",port,"serving projects:",projects);
	console.log("process.env.NODE_ENV:",process.env.NODE_ENV);
})
