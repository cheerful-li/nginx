var express = require('express');
var router = express.Router();
var path = require("path");
var BlogModel = require("./../model/blogs.js");

//获取文章详情
router.get('/detail/:id',function(req,res){
  BlogModel.findById(req.params.id,function(err,blog){
    res.send({code:200,blog});
  })
});
// 添加文章
router.put('/blog', function(req, res, next) {
  if(!req.body.content || !req.body.title){
  	res.send({code:400,message:"blog content or title cant be empty!"});
  	return;
  }
  var now = Date.now();
  var obj = {
  	title: req.body.title,
  	content:req.body.content,
    introductionImg:req.body.introductionImg,
    introductionContent:req.body.introductionContent,
    createTime:now,
    modifyTime:now
  };
  var entity = new BlogModel(obj);
  entity.save(function(err, data){
  	if(err) return res.send({code:400,message:'save blog entity error!'});
  	res.send({code:200,result:data});
  })
});
// 修改文章
router.post('/blog', function(req, res, next) {
  if(!req.body.content || !req.body.title|| !req.body.id){
    res.send({code:400,message:"blog content or title or id cant be empty!"});
    return;
  }
  var now = Date.now();
  var obj = {
    title: req.body.title,
    content:req.body.content,
    introductionImg:req.body.introductionImg,
    introductionContent:req.body.introductionContent,
    modifyTime:now
  };
  BlogModel.findByIdAndUpdate(req.body.id,obj,function(err, data){
    if(err) return res.send({code:400,message:'update blog entity error!'});
    res.send({code:200,result:"ok"});
  })
});

module.exports = router;
