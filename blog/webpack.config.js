var fs = require('fs');
var path =require('path');
var precss       = require('precss');
var autoprefixer = require('autoprefixer');
var config  = {
	entry: {
		/*'./static/pages/createBlog/createBlog':'./public/pages/createBlog/createBlog.js'*/
	},
	output: {
		path: __dirname,
		filename: '[name].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{
				test:/\.scss$/,
				loader:'style!css!postcss!sass'
			},
			{
				test:/\.less$/,
				loader:'style!css!postcss!less'
			},{
				test:/\.css$/,
				loader:'style-loader!css-loader!postcss-loader'
			},
			{
		          test: /\.(png|jpe?g|eot|svg|ttf|woff2?)$/,
		          loader: "file?name=./public/images/[hash][name].[ext]"
		    }
		]
	},
	postcss: function(){
		//美化css、添加浏览器前缀
		return [precss,autoprefixer];
	}

};


config.refresh = function(){
	var pages = fs.readdirSync('./public/pages');
	config.entry = {};
	pages.forEach(function(name){
		var str = './build/pages/'+name+'/'+name;
		config.entry[str] = './public/pages/'+name+'/'+name+'.js';
	});
	return config;
}
module.exports = config;
// console.log(config)
