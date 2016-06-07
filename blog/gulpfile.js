var gulp = require('gulp');
var del = require('del');
var $ = require('gulp-load-plugins')();
var rev = $.rev;
var revCollector = $.revCollector;
var rename = $.rename;
var uglify = $.uglify;
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

gulp.task('help', $.taskListing);

//webpack打包pages下面的页面文件
// === /public/pages/createBlog/createBlog.js --> /build/pages/createBlog/createBlog.js
gulp.task('webpack', function(cb) {
	del.sync('./build/**');
	var config = webpackConfig.refresh();
	config.output.filename = '[name].js';
	webpack(config, function(err, stats) {
		cb(err);
	});
});

//复制/public/pages下面的html文件到/build/pages对应目录下
gulp.task('copy_pages', ['webpack'], function() {
	return gulp.src(['./public/pages/**/*.html']).pipe(gulp.dest('./build/pages'));
});

//复制/public/images 和/public/lib目录
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
		browserSync.init({proxy:"localhost:80"});
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

gulp.task('default',['copy','browserSync','jshint'], function(){
	
	console.log(' ============  will watching ./public/**   ============');
	var watcher = gulp.watch('./public/**',['browserSync']);
	watcher.on('change',function(event){
		console.log('File',event.path,'was',event.type,',running tasks...');
	});


});
