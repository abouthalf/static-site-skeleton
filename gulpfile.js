"use strict";

const gulp = require("gulp"),
	clean = require("gulp-clean"),
	less = require("gulp-less"),
	markdown = require("gulp-markdown"),
	frontMatter = require("gulp-front-matter"),
	server = require("gulp-webserver"),
	jade = require("gulp-jade"),
	rename = require("gulp-rename"),
	data = require("gulp-data"),
	LessPluginAutoPrefix = require('less-plugin-autoprefix'),
	LessPluginCleanCSS = require('less-plugin-clean-css');

// Less plugins
const cleanCss = new LessPluginCleanCSS({advanced: true}),
	autoPreFix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

// local plugins
const ensureFileDate = require("./lib/ensure-file-date"),
	pageToTemplate = require("./lib/page-to-template"),
	titleToSlug = require("./lib/title-to-slug"),
	dateToPath = require("./lib/date-to-path"),
	lastNByDate = require("./lib/last-n-by-date"),
	permalink = require("./lib/permalink"),
	archiveByPubDate = require("./lib/archive-by-pub-date");

const defaults = require("./src/defaults.json");

const DATA_PROP = "data",
	PUBLISEHD_PROP = "published",
	pageToTemplateOpts = {
		path: "src/templates",
		template: defaults.template
	},
	frontMatterOpts = {
		property: DATA_PROP
	},
	dateToPathOpts = {
		root: defaults.blogDirectory,
		property: DATA_PROP,
		parameter: PUBLISEHD_PROP
	},
	defaultPageData = {
		title: defaults.title,
		description: defaults.description
	};

/**
 * Build the site
 */
gulp.task("default", ["css", "posts","pages", "home", "rss", "archives"], function () {});

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
	return gulp.src("src/posts/**/*.md")
		.pipe(frontMatter(frontMatterOpts))
		.pipe(ensureFileDate())
		.pipe(markdown())
		.pipe(pageToTemplate(pageToTemplateOpts))
		.pipe(titleToSlug())
		.pipe(dateToPath(dateToPathOpts))
		.pipe(permalink())
		.pipe(jade())
		.pipe(gulp.dest("www"));
});

/**
 * Publish pages
 */
gulp.task("pages", function () {
	return gulp.src("src/pages/**/*.md")
		.pipe(frontMatter(frontMatterOpts))
		.pipe(ensureFileDate())
		.pipe(markdown())
		.pipe(pageToTemplate(pageToTemplateOpts))
		.pipe(jade())
		.pipe(gulp.dest("www"));
});

/**
 * Build an RSS feed from the last defaults.postsPerPage posts
 */
gulp.task("rss", function () {
	return gulp.src("src/posts/**/*.md")
		.pipe(frontMatter(frontMatterOpts))
		.pipe(ensureFileDate())
		.pipe(markdown())
		.pipe(titleToSlug())
		.pipe(dateToPath(dateToPathOpts))
		.pipe(permalink({host: defaults.url}))
		.pipe(lastNByDate())
		.pipe(data(function(){
			return defaultPageData;
		}))
		.pipe(pageToTemplate({
			path: "src/templates",
			template: "rss.jade"
		}))
		.pipe(jade())
		// jade plugin insists on naming everything `.html` regardless of doctype
		.pipe(rename({
			dirname: "/",
			basename: "rss",
			extname: ".xml"
		}))
		.pipe(gulp.dest("www"));
});

/**
 * If defaults.blogOnHomePage is true, create a home page with the last n posts per page (defaults.postsPerPage)
 * If defaults.blogOnHome is false, create a home page from defaults.homePage and rename to index.html
 */
gulp.task("home", function () {
	if (defaults.blogOnHomePage) {
		var lastNByDateOpts = {
			n: defaults.postsPerPage,
			parameter: "posts"
		};
		return gulp.src("src/posts/**/*.md")
			.pipe(frontMatter(frontMatterOpts))
			.pipe(ensureFileDate())
			.pipe(markdown())
			.pipe(titleToSlug())
			.pipe(dateToPath(dateToPathOpts))
			.pipe(permalink())
			.pipe(lastNByDate(lastNByDateOpts))
			.pipe(data(function(){
				return defaultPageData; // set title and description
			}))
			.pipe(pageToTemplate(pageToTemplateOpts))
			.pipe(jade())
			.pipe(gulp.dest("www"));
	} else {
		var homePageSrc = "src/pages/" + defaults.homePage;
		return gulp.src(homePageSrc)
			.pipe(frontMatter(frontMatterOpts))
			.pipe(titleToSlug())
			.pipe(ensureFileDate())
			.pipe(markdown())
			.pipe(pageToTemplate(pageToTemplateOpts))
			.pipe(jade())
			.pipe(rename({
				dirname: "/",
				basename: "index",
				extname: ".html"
			}))
			.pipe(gulp.dest("www"));
	}
});

/**
 * Build a blog archive page linking to all blog archives.
 */
gulp.task("archives", function () {
	return gulp.src("src/posts/**/*.md")
		.pipe(frontMatter(frontMatterOpts))
		.pipe(ensureFileDate())
		.pipe(markdown())
		.pipe(titleToSlug())
		.pipe(dateToPath(dateToPathOpts))
		.pipe(permalink())
		.pipe(archiveByPubDate())
		.pipe(data(function(){
			return defaultPageData; // set title and description
		}))
		.pipe(pageToTemplate(pageToTemplateOpts))
		.pipe(jade())
		.pipe(gulp.dest("www/" + defaults.blogDirectory));
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
			directoryListing: false,
			open: true
		}));
	gulp.watch(["src/**/*"], ["default"]);
});