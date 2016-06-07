//日志相关的接口
var fs = require("fs");
var path = require('path');
var express = require("express");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');

var logPath = path.join(__dirname,'..','log');

//获取日志
router.get('/log', function(req, res, next) {
	if(!fs.existsSync(logPath)) return console.log('log file not exists');
	res.sendfile(logPath);
});


module.exports = router;