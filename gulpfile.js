"use strict";

const gulp = require("gulp"),
	clean = require("gulp-clean"),
	less = require("gulp-less"),
	markdown = require("gulp-markdown"),
	frontMatter = require("gulp-front-matter"),
	server = require("gulp-webserver"),
	jade = require("gulp-jade"),
	LessPluginAutoPrefix = require('less-plugin-autoprefix'),
	LessPluginCleanCSS = require('less-plugin-clean-css');

// Less plugins
const cleanCss = new LessPluginCleanCSS({advanced: true}),
	autoPreFix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

// local plugins
const ensureFileDate = require("./lib/ensure-file-date"),
	pageToTemplate = require("./lib/page-to-template"),
	titleToSlug = require("./lib/title-to-slug"),
	dateToPath = require("./lib/date-to-path");

const defaults = require("./src/defaults.json");

const DATA_PROP = "data",
	PUBLISEHD_PROP = "published",
	pageToTemplateOpts = {
		path: "src/templates",
		template: defaults.template
	},
	frontMatterOpts = {
		property: DATA_PROP
	};

/**
 * Build the site
 */
gulp.task("default", ["css", "posts","pages"], function () {});

/**
 * Clean output directory
 */
gulp.task("clean", function(){
	return gulp.src("www/*")
		.pipe(clean({read: false, force: true}));
});

/**
 * Transform Less to CSS
 */
gulp.task("css", function () {
	return gulp.src("src/less/main.less")
		.pipe(less({
			plugins: [autoPreFix, cleanCss]
		}))
		.pipe(gulp.dest("www/css"));
});

/**
 * Publish blog posts
 */
gulp.task("posts", function () {

	var dateToPathOpts = {
		root: defaults.blogDirectory,
		property: DATA_PROP,
		parameter: PUBLISEHD_PROP
	};

	return gulp.src("src/posts/**/*.md")
		.pipe(frontMatter(frontMatterOpts))
		.pipe(ensureFileDate())
		.pipe(markdown())
		.pipe(pageToTemplate(pageToTemplateOpts))
		.pipe(jade({pretty: true}))
		.pipe(titleToSlug())
		.pipe(dateToPath(dateToPathOpts))
		.pipe(gulp.dest("www"));
});

/**
 * Publish pages
 */
gulp.task("pages", function () {
	return gulp.src("src/pages/**/*.md")
		.pipe(frontMatter(frontMatterOpts))
		.pipe(titleToSlug())
		.pipe(ensureFileDate())
		.pipe(markdown())
		.pipe(pageToTemplate(pageToTemplateOpts))
		.pipe(jade({pretty: true}))
		.pipe(gulp.dest("www"));
});

gulp.task("rss", function () {

});

gulp.task("home", function () {

});

gulp.task("archives", function () {

});

/**
 * Run the default build then launch the dev server.
 * Start a watcher to re-run the build as needed.
 */
gulp.task("server",["default"],function(){
	gulp.src("www")
		.pipe(server({
			host: "0.0.0.0",
			liveReload: true,
			directoryListing: true,
			open: true
		}));
	gulp.watch(["src/**/*"], ["default"]);
});