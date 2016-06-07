var express = require("express");
var path = require("path");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');
var fs = require("fs");
var multer = require("multer");
var upload = multer({
	dest: 'static/upload_tmp/'
});

router.post('/upload', upload.single('upfile'), function(req, res, next) {
	console.log("post /upload get you");
	console.log(JSON.stringify(req.file));
	var file = req.file;
	var originalname = req.file.originalname;
	var path = file.path;
	var name = req.session.userName + "." + originalname.split(".")[1];
	var target_path = "static/uploadPhoto/" + name;
	console.log("target path is " + target_path);
	// console.log(JSON.stringify(req.files));
	console.log(JSON.stringify(req.file));
	fs.rename(path, target_path, function(err) {
		if (err) throw err;
		console.log("rename success");
		dbHelper.crud.$update("account", {
			userName: req.session.userName
		}, {
			photoName: name
		}, function() {});
	});
	res.redirect("/index.html");
});
router.post('/uploadData', multer({
	storage: multer.memoryStorage()
}).single('dataFile'), function(req, res, next) {
	var jsonData = req.file.buffer.toString('utf8');
	try {
		jsonData = JSON.parse(jsonData);
	} catch (e) {
		console.log(jsonData, 'data cannot be parse to json');
	}
	for (var date in jsonData) {
		var arr = jsonData[date];
		for (var i = 0, obj; obj = arr[i]; i++) {
			dealUploadData(req, res, obj);
			var userName = obj.userName;
		}
	}
	if(!userName) return console.log("data have no userName")
	//修改monthHistory表
	dbHelper.$remove("monthHistory", {
		userName: userName
	}, function() {
		var _monthHistoryDocument = {
			userName: userName,
			monthHistory: {}
		};
		for (var date in jsonData) {
			var arr = jsonData[date];
			for (var i = 0, obj; obj = arr[i]; i++) {
				var _month = obj.date.slice(0, 7);
				var _monthHistory = _monthHistoryDocument.monthHistory;
				_monthHistory[_month] = _monthHistory[_month] || {monthIn: 0, monthOut: 0 };
				if(obj.isIncome){
					_monthHistory[_month].monthIn += obj.money;
				}else{
					_monthHistory[_month].monthOut += obj.money;
				}
			}
		}
		//插入
		dbHelper.$insert("monthHistory", _monthHistoryDocument);
	});

	//修改account表
	//添加数据是当前月份的  此时才需要修改account表中用户的monthIn和monthOut
	var now = new Date();
	

	dbHelper.crud.$find("account", {
		userName: userName
	}, function(data) {
		var resultObj = {
			monthIn:0,
			monthOut:0,
			totalMoney:0
		}
		for (var date in jsonData) {
			var arr = jsonData[date];
			for (var i = 0, obj; obj = arr[i]; i++) {
				var money = obj.money;
				var _month = obj.date.slice(0, 7);
				var isNowMonth = date.split("-")[0] == now.getFullYear() && date.split("-")[1] == (now.getMonth() + 1);
				if(obj.isIncome){
					if(isNowMonth) resultObj.monthIn+=money;
					resultObj.totalMoney += money;
				}else{
					if(isNowMonth) resultObj.monthOut+=money;
					resultObj.totalMoney -= money;
				}
			}
		}

		dbHelper.crud.$update("account", {
			userName: userName
		}, resultObj);
	});

	res.sendFile(path.resolve(__dirname, '../static/html/uploadData.html'))
});

function dealUploadData(req, res, jsonData) {
	var userName = req.session.userName;
	var money = jsonData.money;
	//修改moneyDetail
	delete jsonData._id;
	dbHelper.crud.$insert("moneyDetail", jsonData, function(result) {
		// util.responseSuccess(res, result);
	});
}
module.exports = router;