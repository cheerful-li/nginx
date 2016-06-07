var express = require("express");
var path = require("path");
var router = express.Router();
var fs = require("fs");
var multer = require("multer");
var uploadImgDir = path.join(__dirname,'../public/uploaded/images/');
var upload = multer({
	dest: uploadImgDir
});

/**
 * 上传图片
 * 	  返回图片url
 */
router.post('/uploadImg', upload.single('file'), function(req, res, next) {
	var file = req.file;
	var originalname = req.file.originalname;
	var name =  new Date().toLocaleDateString().split("/").join("-") + "_"+ Math.random() + "." + originalname.split(".")[1];
	var target_path = uploadImgDir + name;
	console.log("target path is " + target_path);
	fs.rename(file.path, target_path, function(err) {
		if (err) throw err;
		console.log("rename success");
		res.send({code:200,result:"/blog/uploaded/images/"+name});
	});
});
module.exports = router;
