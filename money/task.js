var u = require('underscore');
var util = require('./module/util.js');
var dbHelper = require('./module/db.js');
var fs = require('fs');
var path =require('path');
var nodemailer = require('nodemailer');


var userName2email = {
	"lilieming":'602553787@qq.com',
	"colour.hu":'602553787@qq.com'
};


var smtpTransport = nodemailer.createTransport('SMTP',{
	host: 'smtp.163.com',
	secureConnection: true,
	port: 465,
	auth:{
		user:"18215593247@163.com",
		pass:"mn1234MN"
	}
});
var mailOptions = {
	from: "18215593247@163.com",
	to: "602553787@qq.com",
	// to: "18215593247@163.com",
	subject: "记账备份 "
};
function task(){
	console.log('task begin');
	for(var userName in userName2email){
		var email = userName2email[userName];
		sendMail(userName, email);
	}

}
function sendMail(userName, email){
	dbHelper.crud.$find("moneyDetail", {
		userName: userName
	}, {
		sort: [
			["date", "desc"],
			["modifyTime", "desc"]
		]
	}, function(costList) {
		if(!costList || !costList.length) return console.log('user',userName,' has no data');
		var list = u.groupBy(costList, function(item) {
			return item.date
		});
		console.log('bakcup  data length is:',list.length);
		//缓存到 colour.hu.backup.json
		fs.writeFileSync(path.join(__dirname,userName + '.backup.json'),JSON.stringify(list));
		mailOptions.attachments = [{
			filename:userName + '.backup.json',
			contents:fs.readFileSync(path.join(__dirname,userName + '.backup.json'))
		}];
		mailOptions.subject  = "记账备份 " + new Date().toLocaleString();
		mailOptions.to = email;
		smtpTransport.sendMail(mailOptions,function(err,response){
			if(err) console.dir(err);
		})
	});
}
 setTimeout(task,30000); // 三十秒后开始第一次备份
 console.log("30 seconds later send the first backup email");
 setInterval(task,24*3600*1000); // 一天发一次邮件

	