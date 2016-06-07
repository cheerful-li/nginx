var express = require('express');
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');
var router = express.Router();
var fs = require("fs");
var multer = require("multer");
var upload = multer({
	dest: 'static/upload_tmp/'
});

/* GET home page. */
router.get('/index', function(req, res, next) {
	console.log("get /index");
	res.sendFile("/static/html/index.html");
});	
router.get('/', function(req, res, next) {
	//res.render('index', { title: 'Express' });
	res.sendFile("/static/html/index.html")
});


module.exports = router;