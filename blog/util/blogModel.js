/**  手机Model **/
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost/myBlogDb");
var blogSchema = new Schema({
	createDate: Date, //创建时间
	modifyDate: Date, //修改时间
	id: String, //文章id
	author:String, //作者
	tag: String, //标签
	title:String, //标题
	content: String, //内容
	originText: String //转换前的文本
	
});
var BlogModel = mongoose.model('blog', blogSchema);

module.exports = {
	BlogModel: BlogModel
};