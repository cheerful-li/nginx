var gulp = require('gulp');
var del = require('del'); //删除文件和目录的工具
var $ = require('gulp-load-plugins')();//用来查找package.json中的gulp插件，并自动加载
var rev = $.rev; //给文件添加hash的插件
var revCollector = $.revCollector; //插件：替换html文件和css文件中引用资源名为hash后的文件名
var rename = $.rename; //重命名文件插件
var uglify = $.uglify; //压缩混淆插件
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
var merge = require('merge-stream'); //合并多条流
//rev hash前文件名和hash后文件名映射关系存储文件   -- lib目录
var libRevManifestFile = 'rev-manifest-lib.json';  
//rev  hash前文件名和hash后文件名映射关系存储文件  -- images目录
var imagesRevManifestFile = 'rev-manifest-images.json'; 
gulp.task('help', $.taskListing);

//webpack打包pages下面的页面文件
// === /public/pages/createBlog/createBlog.js --> /build/pages/createBlog/createBlog.bundle.js
//                                             --> /build/pages/createBlog/createBlog.css
gulp.task('webpack', function(cb) {
	del.sync('./build/**');
	webpack(webpackConfig.refresh(), function(err, stats) {
		cb(err);
	});
});

//复制/public/pages下面的html文件到/build/pages对应目录下
gulp.task('copy_pages', ['webpack'], function() {
	return gulp.src(['./public/pages/**/*.html']).pipe(gulp.dest('./build/pages'));
});

//复制/public/images 和/public/lib目录 到 /build
gulp.task('copy', ['copy_pages'], function() {
	return gulp.src(['./public/images/**', './public/lib/**']).pipe(gulp.dest(function(file) {
		var dirs = file.base.split('\\');
		return './build/' + dirs[dirs.length - 2];
	}));
});

// 为/build/lib目录下的文件添加hash
// 保存映射关系到 /build/rev/rev-manifest-lib.json
gulp.task('rev_lib', ['copy'], function() {
	return gulp.src('./build/lib/**')
		.pipe(rev()) //使用rev
		.pipe(gulp.dest('./build/lib'))
		.pipe(rev.manifest(libRevManifestFile))
		.pipe(gulp.dest('./build/rev'));
});
// 为/build/images 静态文件添加hash
// 保存文件映射到 /build/rev/xxx
gulp.task('rev_images', ['copy'], function() {
	return gulp.src('./build/images/**')
		.pipe(rev())  //使用rev
		.pipe(gulp.dest('./build/images'))
		.pipe(rev.manifest(imagesRevManifestFile))
		.pipe(gulp.dest('./build/rev'));
});

//webpack打包后的js文件和css文件添加hash
//保存文件映射到 /build/rev/xxx
gulp.task('rev_page', ['copy'], function() {
	var stream1 = gulp.src(['./build/pages/**/*.bundle.js'])
		.pipe(rename(function(path) { //重命名js 去掉.bundle
			path.basename = path.basename.split('.')[0];
		}))
		.pipe(rev()) //hash
		.pipe(gulp.dest('./build/pages'))
		.pipe(rev.manifest('rev-manifest-pages.json')) //映射文件
		.pipe(gulp.dest('./build/rev'));

	var stream2 = gulp.src(['./build/pages/**/*.css'])
		.pipe(rev()) //hash
		.pipe(gulp.dest('./build/pages'))
		.pipe(rev.manifest('rev-manifest-pages-css.json')) //映射文件
		.pipe(gulp.dest('./build/rev'));
	//合并两条流，然后返回
	//这是为了让gulp的依赖关系保持正确的执行顺序
	return merge(stream1,stream2);
});
//1.清除/static/lib下hash前的文件
//2.清除/static/images下hash前的文件
//3.删除webpack打包的js bundle文件
gulp.task('clean',['rev_lib','rev_page','rev_images'],function(){
	var map = require('./build/rev/'+libRevManifestFile);
	for(var name in map){
		del('./build/lib/'+name);
	}
	var map = require('./build/rev/'+imagesRevManifestFile);
	for(var name in map){
		del('./build/images/'+name);
	}
	del('./build/pages/**/*.bundle.js');
});
//替换html和css文件中的资源引用为hash后文件名
//ejs模板文件中的引用也替换掉
gulp.task('rev', ['rev_lib', 'rev_page','rev_images','clean'], function() {
	return merge(
				gulp.src(['./build/rev/*.json', './build/pages/**/*.html','./build/pages/**/*.css'])
				.pipe(revCollector())
				.pipe(gulp.dest('./build/pages')),
				gulp.src(['./build/rev/*.json','./views/**/*.html','!./views/builded/**/*.html'])
				.pipe(revCollector())
				.pipe(gulp.dest('./views/builded'))
			);

});
//打印压缩后文件大小和压缩的体积
function bytediffFormatter (data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' +
        (data.endSize / 1000).toFixed(2) + ' kB and is ' +
        parseInt((1 - data.percent)*100) + '%' + difference;
}
//minify
gulp.task('minify',['rev'],function(){
	//minify html
	gulp.src('./build/pages/**/*.html')
		.pipe($.bytediff.start())
		.pipe($.htmlmin({collapseWhitespace:true}))
		.pipe($.bytediff.stop(bytediffFormatter))
		.pipe(gulp.dest('./build/pages'));
	gulp.src('./views/builded/**/*.html')
		.pipe($.bytediff.start())
		.pipe($.htmlmin({collapseWhitespace:true}))
		.pipe($.bytediff.stop(bytediffFormatter))
		.pipe(gulp.dest('./views/builded'));
	//minify js
	gulp.src(['./build/pages/**/*.js','!./build/pages/**/*.bundle.js'])
		.pipe($.bytediff.start())
		.pipe(uglify())
		.pipe($.bytediff.stop(bytediffFormatter))
		.pipe(gulp.dest('./build/pages'));
	//minify css
	gulp.src(['./build/pages/**/*.css'])
		.pipe($.bytediff.start())
		.pipe($.cssmin())
		.pipe($.bytediff.stop(bytediffFormatter))
		.pipe(gulp.dest('./build/pages'));
});
gulp.task('default', ['rev','minify'],function(){
	
});