"use-strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	File = require("gulp-util").File,
	util = require("util"),
	path = require("path"),
	slug = require("slug");

const defaults = {
	property: "data" // property to check for title / slug
};

/**
 * Return the file base name without the extension
 * @param file
 * @returns {string}
 */
function stem(file) {
	return path.parse(file.path).name;
}

/**
 * replace filePath stem with stem
 * @param stem
 * @param filePath
 * @returns {string}
 */
function rename(stem, filePath) {
	return filePath.replace(path.parse(filePath).name, stem);
}

/**
 * If the file has a 'title' or 'slug' value in it's data,
 * use that value to create a url "slug" for linking
 *
 * Otherwise use the current file name
 *
 * @param {{property: string}} [options]
 */
module.exports = function titleToSlug(options) {

	var opts = Object.assign({}, defaults, options);

	function toSlug(file, enc, cb) {
		if (util.isObject(file[opts.property])) {
			var data = file[opts.property],
				name = slug(data.title || data.slug || stem(file));
			file.path = rename(name, file.path);
		}
		cb(null, file);
	}

	return through.obj(toSlug);
};