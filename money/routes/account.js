var express = require("express");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');

router.get('/accountDetail', function(req, res, next) {
	var userName = req.session.userName;
	dbHelper.crud.$find("account",{userName:userName},function(costList){
		var list = costList[0];
		var nowMonth = (new Date()).getMonth() + 1;
		var _id = list._id;
		if(list.modifyMonth != nowMonth ){
			delete list._id;
			list.monthIn = 0;
			list.monthOut = 0;
			list.modifyMonth = nowMonth;
			dbHelper.crud.$update("account",{userName:userName},list);
		}
		list._id = _id;
		delete list.password;
		util.responseSuccess(res, list);
	})
});
//hook方法  手动浏览器调用
//重新计算totalMoney monthIn monthOut
router.get('/initAccountDetail', function(req, res, next) {
	var userName = req.session.userName||req.query.userName;
	initAccountDetail(userName,res);
});
function initAccountDetail(userName,res){
	dbHelper.$find("moneyDetail",{userName:userName},function(list){
		
		var obj = {totalMoney:0,monthIn:0,monthOut:0};
		for(var i = 0,item;item = list[i];i++){
			var date = item.date;
			var now = new Date();
			var isNowMonth = date.split("-")[0] == now.getFullYear() && date.split("-")[1] == (now.getMonth() + 1);
			var isIncome = item.isIncome;
			if(isIncome){
				obj.totalMoney += item.money;
				if(isNowMonth) obj.monthIn += item.money;				
			} else{
				obj.totalMoney -= item.money;
				if(isNowMonth) obj.monthOut += item.money;
			}
		}
		//更新表account
		dbHelper.crud.$update("account", {
			userName:userName
		}, obj, function(result) {
			util.responseSuccess(res, result);
		});
		
	});
};
router.post('/monthPlan', function(req, res, next) {
	var monthPlan = parseInt(req.body.monthPlan);
	dbHelper.crud.$update("account", {
		userName: req.session.userName
	}, {
		monthPlan: monthPlan
	}, function(result) {
		util.responseSuccess(res, result);
	});
});

module.exports = router;