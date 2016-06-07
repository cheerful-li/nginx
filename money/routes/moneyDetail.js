var express = require("express");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');

router.get('/moneyDetail', function(req, res, next) {
	var userName = req.session.userName;
	dbHelper.crud.$find("moneyDetail", {
		userName: userName
	}, {
		sort: [
			["date", "desc"],
			["modifyTime", "desc"]
		]
	}, function(costList) {
		var list = u.groupBy(costList, function(item) {
			return item.date
		});
		var limit = +req.query.limit;
		var offset = +req.query.offset;
		//console.log(limit,offset,req.query);
		//console.dir(list)
		if(limit){
			var arr = [];
			for(var d in list){
				arr.push(list[d]);
			}
			arr = arr.slice(offset,limit + offset);
			//console.dir(arr.length);
			list = arr
		}
		util.responseSuccess(res, list);
	});
});

router.put('/moneyDetail', function(req, res, next) {
	var userName = req.session.userName;
	console.log('userName',userName)
	req.body.detail = [];
	req.body.userName = userName;
	var money = req.body.money = +req.body.money;
	if (!u.isNumber(money)) return util.responseFailed(res, "money is not a number");
	var d = new Date();
	req.body.modifyTime = d.getTime();
	req.body.date = util.formatDate(req.body.date);
	var isIncome = req.body.isIncome = (req.body.isIncome == "true" || req.body.isIncome == true) ? true : false;
	//修改monthHistory表
	dbHelper.$find("monthHistory", {
		userName: userName
	}, function(list) {
		var _month = req.body.date.slice(0, 7);
		if (list.length == 0) { //插入
			var _obj = {
				userName: userName,
				monthHistory: {}
			};
			var _monthHistory = _obj.monthHistory;
			var _tempObj = _monthHistory[_month] = {
				monthIn: 0,
				monthOut: 0
			};
			if (isIncome) {
				_tempObj.monthIn = money;
			} else {
				_tempObj.monthOut = money;
			}
			//插入
			dbHelper.$insert("monthHistory", _obj);
		} else { //更新
			var _obj = list[0];
			_monthHistory = _obj.monthHistory;
			var _tempObj = _monthHistory[_month] = _monthHistory[_month] || {
				monthIn: 0,
				monthOut: 0
			};
			if (isIncome) {
				_tempObj.monthIn += money;
			} else {
				_tempObj.monthOut += money;
			}
			//console.log(_obj);
			if(_obj["_id"])delete _obj["_id"];
			dbHelper.$update("monthHistory", {
				userName: userName
			}, _obj);
		}
	});
	//修改account表
	//添加数据是当前月份的  此时才需要修改account表中用户的monthIn和monthOut
	//修改totalMoney
	var date = req.body.date;
	var now = new Date();
	var isNowMonth = date.split("-")[0] == now.getFullYear() && date.split("-")[1] == (now.getMonth() + 1);
	dbHelper.crud.$find("account", {
		userName: userName
	}, function(data) {
		var monthIn = data[0].monthIn;
		var monthOut = data[0].monthOut;
		var totalMoney = data[0].totalMoney;
		if (isIncome) {
			if(isNowMonth) monthIn += money;
			totalMoney += money;
		} else {
			if(isNowMonth) monthOut += money;
			totalMoney -= money;
		}

		dbHelper.crud.$update("account", {
			userName: userName
		}, {
			monthIn: monthIn,
			monthOut: monthOut,
			totalMoney: totalMoney,
			modifyMonth: (new Date()).getMonth() + 1
		});
	});

	//修改labelGroup
	var obj = {};
	obj.userName = userName;
	obj.label = req.body.label.trim();
	obj.modifyTime = Date.now();
	dbHelper.crud.$find("labelGroup", {
		userName: userName,
		label: obj.label
	}, function(result) {
		//之前有插入过同样的标签,count+1
		console.log(JSON.stringify(result) + " result is ");
		if (result && result.length !== 0) {
			obj.count = result[0].count + 1;
			dbHelper.crud.$update("labelGroup", {
				userName: userName,
				label: obj.label
			}, obj);
		} else {
			obj.count = 1;
			dbHelper.crud.$insert("labelGroup", obj)
		}
	});
	//修改moneyDetail
	dbHelper.crud.$insert("moneyDetail", req.body, function(result) {
		util.responseSuccess(res, result);
	});
});

//暂时不支持详情和修改
/*router.post('/moneyDetail', function(req, res, next) {
	var userName = req.session.userName;
	var money = req.body.money = +req.body.money;
	if (!u.isNumber(money)) return util.responseFailed(res, "money is not a number");
	req.body.detail = u.isObject(req.body.detail) ? req.body.detail : JSON.parse(req.body.detail);
	var d = new Date();
	req.body.modifyTime = d.getTime();
	req.body.date = util.formatDate(req.body.date);
	var id = req.body._id;
	delete req.body._id;
	req.body.isIncome = req.body.isIncome == "false"?false:req.body.isIncome;
	console.log(JSON.stringify(req.body));
	dbHelper.crud.$update("moneyDetail", {
		"_id": dbHelper.ObjectId.createFromHexString(id)
	}, req.body, function(result) {
		util.responseSuccess(res, result);
	});
});*/


router.delete('/moneyDetail', function(req, res, next) {
	var userName = req.session.userName;
	var id = req.body.id;
	dbHelper.crud.$find("moneyDetail", {
		"_id": dbHelper.ObjectId.createFromHexString(id)
	}, function(data) {
		if (data.length == 0) {
			return util.responseFailed(res, "未找到moneyDetail");
		}
		var isIncome = data[0].isIncome;
		var money = data[0].money;
		var date = data[0].date;
		var now = new Date();
		//修改account表
		//删除数据是当前月份的  此时才需要修改account表中用户的monthIn和monthOut
		//修改totalMoney
		var isNowMonth = date.split("-")[0] == now.getFullYear() && date.split("-")[1] == (now.getMonth() + 1);
		dbHelper.crud.$find("account", {
			"userName": userName
		}, function(data) {
			if (data.length == 0) return util.responseFailed(res, "未找到account");
			var monthIn = data[0].monthIn;
			var monthOut = data[0].monthOut;
			var totalMoney = data[0].totalMoney;
			if (isIncome) {
				if(isNowMonth) monthIn -= money;
				totalMoney -= money;
			} else {
				if(isNowMonth) monthOut -= money;
				totalMoney += money;
			}
			//更新account
			dbHelper.crud.$update("account", {
				userName: userName
			}, {
				monthIn: monthIn,
				monthOut: monthOut,
				totalMoney: totalMoney
			});

		});
		

		//修改monthHistory表
		dbHelper.$find("monthHistory", {
			userName: userName
		}, function(list) {
			console.log(date);
			var _month = date.slice(0, 7);
			if (list.length == 0) {
				console.log("修改monthHistory异常1");
			} else { //更新
				var _obj = list[0];
				_monthHistory = _obj.monthHistory;
				var _tempObj = _monthHistory[_month];
				if(!_tempObj) return console.log('_tempObj not exist ',_month,_monthHistory)
				if (isIncome) {
					_tempObj.monthIn -= money;
				} else {
					_tempObj.monthOut -= money;
				}
				if(_obj["_id"])delete _obj["_id"];
				dbHelper.$update("monthHistory", {
					userName: userName
				}, _obj);
			}
		});
		//删除moneyDetail中数据
		dbHelper.crud.$remove("moneyDetail", {
			"_id": dbHelper.ObjectId.createFromHexString(id)
		}, function(result) {
			util.responseSuccess(res, result);
		});
	});
});


module.exports = router;
