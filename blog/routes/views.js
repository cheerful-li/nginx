var express = require('express');
var router = express.Router();
var path = require("path");
var BlogModel = require("./../model/blogs.js");

//博客首页
router.get("/",function(req,res){
  res.redirect("/blog/index.html");
});
router.get('/index.html',function(req,res,next){
  // var absolutePath = path.join(__dirname,'views',req.path);
  BlogModel.find(function(err,list){
    var data = {list,userName:''};
    if(req.session&&req.session.userName) data.userName = req.session.userName;
    res.render('index.html',data);
  })
});
//博客详情页
router.get('/detail/:id',function(req,res){
  BlogModel.findById(req.params.id,function(err,blog){
    res.render('detail.html',{blog});
  })
});

module.exports = router;
