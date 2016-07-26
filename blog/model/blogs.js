var mongoose = require('./mongooseBase.js');
var Schema = mongoose.Schema;
var blogSchema = new Schema({
	title:String,
	content:String,
	introductionImg:String,
	introductionContent:String,
	createTime:{type:Date,default:Date.now},
	modifyTime:{type:Date,default:Date.now}
});
var BlogsModel = mongoose.model('blog',blogSchema);
module.exports = BlogsModel;
