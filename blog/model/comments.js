var mongoose = require('./mongooseBase.js');
var Schema = mongoose.Schema;
var commentSchema = new Schema({
	relBlogId:String,
	name:String,
	replyName:String,
	content:String,
	createTime:{type:Date,default:Date.now}
});
var CommentsModel = mongoose.model('comment',commentSchema);
module.exports = CommentsModel;