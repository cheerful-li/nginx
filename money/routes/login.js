var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');



router.post("/login", function(req, res, next) {
	var obj = {
		userName: req.body.userName,
		password: req.body.password
	};
	console.dir(obj);
	dbHelper.crud.$find("account", obj, function(result) {
		if (result.length ) {
			req.session.userName = obj.userName;
			//一个月内自动登录
			// res.cookie("userName",obj.userName,{maxAge:30*24*60*60*1000});
			util.responseSuccess(res, {
				userName: obj.userName,
				token:result[0].token  //token for app
			});
			console.log('ok');
		} else {
			console.error('not right');
			util.responseFailed(res, "登录失败，用户名或者密码错误");
		}
	});
});
router.get("/logout",function(req,res,next){
	// res.clearCookie("userName");
	req.session.destroy();
	// res.redirect("/login.html");
	util.responseSuccess(res, "ok");

});
router.post("/register", function(req, res, next) {
	var obj = {
		userName: req.body.userName,
		password: req.body.password
	};
	dbHelper.crud.$find("account", {
		userName: obj.userName
	}, function(result) {
		if (!result.length) {
			obj.monthIn = 0;
			obj.monthOut = 0;
			obj.monthPlan = 0;
			obj.totalMoney = 0;
			obj.token = jwt.sign(obj.userName,'secret key',{expiresIn:"30 days"});
			dbHelper.crud.$insert("account", obj, function(result) {
				req.session.userName = req.body.userName;
				// res.cookie("userName",req.body.userName,{maxAge:30*24*60*60*1000})
				// util.responseSuccess(res, result);
				res.send({code: 200, token: obj.token});
			})
		} else {
			util.responseFailed(res, "用户名已被使用");
		}
	})

});


module.exports = router;