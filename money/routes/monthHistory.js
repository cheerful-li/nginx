var express = require("express");
var router = express.Router();
var u = require('underscore');
var util = require('../module/util.js');
var dbHelper = require('../module/db.js');

router.get('/monthHistory', function(req, res, next) {
	var userName = req.session.userName||req.query.userName;
	dbHelper.crud.$find("monthHistory",{userName:userName},function(list){
		if(list.length == 0){ //还未初始化
			initMonthHistory(userName,res);
		}else{
			var result = list[0].monthHistory||{};
			//console.log(result);
			var tempArr = [];
			for(var key in result){
			    tempArr.push(key);
			}
			tempArr.sort(function(item1,item2){return item1<item2;});
			var resultObj = {};
			for(var i=0;i<tempArr.length;i++){
			    resultObj[tempArr[i]]=result[tempArr[i]];
			}
			//console.log(resultObj);
			util.responseSuccess(res, resultObj);
		}
	})
});
//hook方法  手动浏览器调用
router.get('/initMonthHistory', function(req, res, next) {
	var userName = req.session.userName||req.query.userName;
	//先删除老数据
	//然后重新计算
	dbHelper.$remove("monthHistory",{userName:userName},function(){
		initMonthHistory(userName,res);
	})
});
function initMonthHistory(userName,res){
	dbHelper.$find("moneyDetail",{userName:userName},function(list){
		//表结构
		//{userName:"",monthHistory:{"2015-10":{monthIn:100,monthOut:200}}}
		var obj = {userName:userName,monthHistory:{}};
		var monthHistory = obj.monthHistory;
		for(var i = 0,item;item = list[i];i++){
			var month = item.date.slice(0,7);  //例如：2015-10
			var monthObj = monthHistory[month] = monthHistory[month] || {monthIn:0,monthOut:0};
			var isIncome = item.isIncome;
			if(isIncome){
				monthObj.monthIn += item.money;
			} else{
				monthObj.monthOut += item.money;
			}
		}
		//更新表monthHistory
		dbHelper.$insert("monthHistory",obj,function(){
			//返回
			util.responseSuccess(res, obj)
		})
		
	});
};


module.exports = router;
