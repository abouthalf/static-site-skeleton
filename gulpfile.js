"use strict";

const gulp = require("gulp"),
	less = require("gulp-less"),
	markdown = require("gulp-markdown"),
	frontMatter = require("gulp-front-matter"),
	LessPluginAutoPrefix = require('less-plugin-autoprefix'),
	LessPluginCleanCSS = require('less-plugin-clean-css');

const parseFileDate = require("./lib/parse-file-date");

const cleanCss = new LessPluginCleanCSS({advanced: true}),
	autoPreFix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

const defaults = require("./src/defaults.json");

const DATA_PROP = "data";


gulp.task("default", ["css"], function () {
});

/**
 * Transform Less to CSS
 */
gulp.task("css", function () {
	return gulp.src("./src/less/main.less")
		.pipe(less({
			plugins: [autoPreFix, cleanCss]
		}))
		.pipe(gulp.dest("www/css"));
});

gulp.task("posts", function () {
	return gulp.src("src/posts/**/*.md")
		.pipe(frontMatter({
			property: DATA_PROP
		}))
		.pipe(parseFileDate("fake"))
		.pipe(markdown())
		.pipe(gulp.dest("www/posts"));
});

gulp.task("pages", function () {
	return gulp.src("src/pages/**/*.md")
		.pipe(frontMatter({
			property: DATA_PROP
		}))
		.pipe(markdown())
		.pipe(gulp.dest("www"));
});

gulp.task("rss", function () {

});

gulp.task("home", function () {

});

gulp.task("archives", function () {

});