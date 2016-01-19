const gulp = require("gulp"),
	less = require("gulp-less"),
	data = require("gulp-data"),
	markdown = require("gulp-markdown"),
	frontMatter = require("front-matter"),
	LessPluginAutoPrefix = require('less-plugin-autoprefix'),
	LessPluginCleanCSS = require('less-plugin-clean-css');

const cleancss = new LessPluginCleanCSS({ advanced: true }),
	autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

gulp.task("css", function(){
	return gulp.src("./src/less/main.less")
		.pipe(less({
			plugins: [autoprefix, cleancss]
		}))
		.pipe(gulp.dest("www/css"));
});

gulp.task("posts", function(){
	gulp.src("src/posts/**/*.md")
		.pipe(data(function(file){
			var contents = frontMatter(String(file.contents));
			file.contents = new Buffer(contents.body);
			return contents.attributes;
		}))
		.pipe(markdown())
		.pipe(gulp.dest("www/posts"));
});

gulp.task("pages", function(){

});

gulp.task("home", function(){

});

gulp.task("archives", function(){

});