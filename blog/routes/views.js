var express = require('express');
var router = express.Router();
var path = require("path");
var BlogModel = require("./../model/blogs.js");
var CommentsModel = require("./../model/comments.js");
var isProduction = process.env.NODE_ENV == 'production';

var filePathPrefix = isProduction?'builded/':'';
//博客首页
router.get("/",function(req,res){
  res.redirect("/blog/index.html");
});
router.get('/index.html',function(req,res,next){
  // var absolutePath = path.join(__dirname,'views',req.path);
  BlogModel.find().sort({createTime:-1}).exec(function(err,list){
    var data = {list,userName:''};
    if(req.session&&req.session.userName) data.userName = req.session.userName;
    res.render(filePathPrefix + 'index.html',data);
  })
});
//博客详情页
router.get('/detail/:id',function(req,res){
  BlogModel.findById(req.params.id,function(err,blog){
    var data = {blog,userName:''};
    if(req.session&&req.session.userName) data.userName = req.session.userName;
    data.blogId = req.params.id;
    CommentsModel.find({relBlogId:req.params.id},function(err,comments){
      comments.forEach(function(item){
        item.createTime = item.createTime.format("yyyy-MM-dd hh:mm");
      });
      data.commentsList = comments;
      res.render(filePathPrefix + 'detail.html',data);
    });
    
  })
});

module.exports = router;
