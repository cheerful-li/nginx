var express = require("express");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');

router.get("/labels", function(req, res, next) {
	var userName = req.session.userName; //从session里面找
	dbHelper.crud.$find("labelGroup", {
		userName: userName
	}, {
		limit: 10,
		sort: [
			['count', 'desc'],
			['modifyTime','desc']
		]
	}, function(result) {
		util.responseSuccess(res, result);
	});
});

module.exports = router;