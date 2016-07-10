var gulp = require('gulp');
var del = require('del'); //删除文件和文件夹的工具
var $ = require('gulp-load-plugins')();  //用来查找package.json中的gulp插件，并自动加载
var webpack = require('webpack'); //webpack工具
var webpackConfig = require('./webpack.config.js'); // 加载webpack配置文件

gulp.task('help', $.taskListing); //定义help任务，用来打印任务列表

//webpack任务
//webpack打包/public/pages下面的页面文件到/build/pages
// === /public/pages/createBlog/createBlog.js --> /build/pages/createBlog/createBlog.js
//                                            --> /build/pages/createBlog/createBlog.css
gulp.task('webpack', function(cb) {
	del.sync('./build/**'); //先删除/build目录
	var config = webpackConfig.refresh(); //动态设置webpack配置文件中的entry入口
	config.output.filename = '[name].js'; //设置输出文件名
	webpack(config, function(err, stats) {
		cb(err);
	});
});

//copy_pages任务，依赖webpack打包
//复制/public/pages下面的html文件到/build/pages对应目录下
gulp.task('copy_pages', ['webpack'], function() {
	return gulp.src(['./public/pages/**/*.html']).pipe(gulp.dest('./build/pages'));
});

//复制/public/images 和/public/lib目录 到/build
gulp.task('copy', ['copy_pages'], function() {
	return gulp.src(['./public/images/**', './public/lib/**']).pipe(gulp.dest(function(file) {
		var dirs = file.base.split('\\');
		return './build/' + dirs[dirs.length - 2];
	}));
});

//使用browser-sync来自动刷新
var _inited = false;
var browserSync;
gulp.task('browserSync',['copy'],function(){
	if(!_inited){
		browserSync = require("browser-sync").create();
		browserSync.init({proxy:"localhost:80"});  //使用代理模式，本地另外跑nodejs服务在80端口
		_inited = true;
	}
	console.log(' now reload the browser');
	browserSync.reload();
});

//jshint 
gulp.task('jshint',function(){
	
	gulp.watch(['./public/pages/**/*.js','!./public/pages/**/*.bundle.js']).on('change',function(){
		gulp.src(['./public/pages/**/*.js','!./public/pages/**/*.bundle.js'])
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'));
	});
});

gulp.task('default',['copy','webpack','browserSync','jshint'], function(){
	
	console.log(' ============  will watching ./public/**   ============');
	//监听文件变动，刷新浏览器
	var watcher = gulp.watch('./public/**',['browserSync']); 
	//log
	watcher.on('change',function(event){
		console.log('File',event.path,'was',event.type,',running tasks...');
	});


});
