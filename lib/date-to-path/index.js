"use-strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	util = require("util"),
	path = require("path");

const PLUGIN_NAME = "date-to-path";

const defaults = {
	root: "blog", // "root" blog directory under output directory
	parameter: "published", // file[data] parameter containing the pub date
	property: "data" // file[data] object property
};

/**
 * Attempt to use the 'published' prop
 * @param {File} file
 */
function getDate(file) {
	var d = defaults.property,
		p = defaults.parameter;
	// if the property is set
	if ((!util.isUndefined(file[d]) && !util.isUndefined(file[d][p])) && util.isDate(file[d][p])) {
		if (!isNaN(file[d][p].getTime())) {
			return new Date(file[d][p]);
		}
	}
	// no date or invalid date. Use last modified time.
	return new Date(file.stat.mtime);
}

/**
 * Assemble the relative blog path from the root and date.
 *
 * @param {String} root
 * @param {Date} date
 */
function getDatePath(root, date) {
	return path.join(
		root,
		date.getFullYear().toString(),
		formatMonth(date),
		formatDate(date)
	)
}

/**
 * Return normalized (1 based) numeric month with leading zero.
 *
 * @param {Date} date
 * @returns {string}
 */
function formatMonth(date) {
	return util.format("0%s", (date.getMonth() + 1).toString()).slice(-2);
}

/**
 * Return numeric date with leading zero.
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date){
	return util.format("0%s", date.getDate().toString()).slice(-2);
}

/**
 * Using a published date attached to a given file, create a new path based upon
 * year/month/day/file
 *
 * Used to create date/based blog post directories
 *
 * @param {{path: string}} [options]
 * @returns {*}
 */
module.exports = function dateToPath(options) {

	var opts = Object.assign({}, defaults, options);

	function dtp(file, enc, cb) {

		// skip it
		if(file.isStream()){
			return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
		}

		// adjust file path
		file.path = path.join(file.base, getDatePath(opts.root, getDate(file)), path.parse(file.path).base);

		cb(null, file);
	}

	return through.obj(dtp);
};