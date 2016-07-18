var fs = require('fs');
var path =require('path');
var precss       = require('precss'); //美化css
var autoprefixer = require('autoprefixer'); //为css添加各浏览器前缀
var ExtractTextPlugin = require('extract-text-webpack-plugin');  //用来抽取css内容到单独的文件
var extractCSS = new ExtractTextPlugin('[name].css');
var config  = {
	entry: { //多个入口 根据public/pages目录下的文件来生成
		/*'./static/pages/createBlog/createBlog':'./public/pages/createBlog/createBlog.js'*/
	},
	output: {
		path: __dirname,
		filename: '[name].bundle.js'
	},
	module: {
		loaders: [
			{
				//js文件配置，支持es6语法
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{	//处理scss文件
				test:/\.scss$/,
				loader:extractCSS.extract(['css','postcss','sass'])
			},
			{	//处理css
				test:/\.css$/,
				loader:extractCSS.extract(['css','postcss'])
			}/*,
			{
		          test: /\.(png|jpe?g|eot|svg|ttf|woff2?)$/,
		          loader: "file?name=[path][hash:6][name].[ext]"
		    }*/
		]
	},
	postcss: function(){
		//美化css、添加浏览器前缀
		return [precss,autoprefixer];
	},
	plugins:[extractCSS]

};

//配置entry多个入口 根据public/pages目录下的文件来生成
//每个入口的name对应到/build/pages目录，让最后打包的文件放大/build/pages目录下
config.refresh = function(){
	var pages = fs.readdirSync('./public/pages');
	config.entry = {};
	pages.forEach(function(name){
		var str = './build/pages/'+name+'/'+name;
		config.entry[str] = './public/pages/'+name+'/'+name+'.js';
	});
	return config;
}
config.refresh();
module.exports = config;
// console.log(config)

