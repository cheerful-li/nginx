var express = require('express');
var router = express.Router();
var path = require("path");
var CommentsModel = require("./../model/comments.js");

//获取文章评论列表
router.get('/comments/:blogId',function(req,res){
  CommentsModel.find({relBlogId:req.params.blogId},function(err,comments){
  	//comments是一个数组 ，数组里面每一个元素都是一个comment的Model对象
  	comments = JSON.parse(JSON.stringify(comments));
  	comments.forEach(function(item){
        item.createTime  =  new Date(item.createTime).format("yyyy-MM-dd hh:mm");
     });
    res.send({code:200,list:comments});
  });
});
//给文章添加评论
router.put('/comments/:blogId',function(req,res){
  if(!req.body.content || !req.body.name){
    res.send({code:400,message:"comments content or name can't be empty!"});
    return;
  }
  var data = {
  	name: req.body.name,
  	content: req.body.content,
  	relBlogId: req.params.blogId,
  	replyName: req.body.replyName||'',
  	createTime:new Date()
  }
  var model = new CommentsModel(data);
  model.save(function(err,result){
  	res.send({code:200,result:[].slice.call(arguments)});
  });
});

module.exports = router;