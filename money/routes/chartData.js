var express = require("express");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');

router.get('/datePeriodData', function(req, res, next) {
	var userName = req.session.userName;
	var startDate = req.query.startDate;
	var endDate = req.query.endDate;
	if (!startDate || !endDate) return util.responseFailed(res, 'no startDate or endDate query');
	dbHelper.crud.$find("moneyDetail", {
		userName: userName,
		date: {
			$gte: startDate,
			$lt: endDate
		}
	}, {
		sort: [
			["date", "asc"],
			["modifyTime", "desc"]
		]
	}, function(costList) {
		var list = u.groupBy(costList, function(item) {
			return item.date
		});
		var arr = [];
		for (var key in list) {
			d = list[key];
			var obj = { in : 0, out: 0,date: d[0].date
			};
			for (var i = 0, item; item = d[i]; i++) { //计算某一天的总支出和总收入
				if (item.isIncome) {
					obj.in += item.money;
				} else {
					console.dir(item)
					obj.out +=  +item.money;
				}
			}
			arr.push(obj);
		}
		list = arr;
		util.responseSuccess(res, list);
	});
});



module.exports = router;