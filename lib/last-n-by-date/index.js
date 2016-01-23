"use-strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	File = require("gulp-util").File,
	util = require("util"),
	path = require("path");

const PLUGIN_NAME = "last-n-by-date";

const defaults = {
	n: 10,
	sort: "desc",
	fileName: "index.html",
	parameter: "items", // file[data] parameter containing the list of items
	sortBy: "published", // file[data][sortBy] date for sorting
	property: "data" // file[data] object property
};

/**
 * Collect the last n (default 10) files sorted by date (descending) and collect
 * the file details (data, contents) into a list.
 *
 * Files are sorted by file[property][sortBy], falling back to file.stat.mtime
 *
 * Create and return a new file containing the collected file contents in file data
 *
 * Used for creating archive or "roll up" pages, rss feeds, etc.
 *
 * @see https://github.com/contra/gulp-concat/blob/master/index.js for inspiration
 *
 * @param [options]
 */
module.exports = function lastNByDate(options) {

	var opts = Object.assign({}, defaults, options),
		collected = [],
		collectedFile;

	/**
	 * Extract file data and contents into an object. Append object to array 'arr'.
	 *
	 * @param {File} file
	 * @param {Array} arr
	 */
	function collectFileToArray(file, arr) {
		// copy file[data]
		var o = Object.assign({},file[opts.property]);

		// ensure the sortBy date is a fresh date instance
		if (util.isDate(o[opts.sortBy])) {
			// create a new date instance
			o[opts.sortBy] = new Date(o[opts.sortBy]);
		} else {
			// fall back to last modified time
			o[opts.sortBy] = new Date(file.stat.mtime);
		}

		// convert contents from buffer to string and capture
		o.contents = file.contents.toString();
		o.basepath = file.cwd;

		//console.log(file.base);

		arr.push(o);
	}

	/**
	 * For each file, extract important bits, then continue.
	 *
	 * @param {File} file
	 * @param {String} enc unused
	 * @param {Function} cb
	 */
	function collectFiles(file, enc, cb) {

		// skip it
		if(file.isStream()){
			return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
		}

		// ignore empty files
		if (file.isNull()) {
			return cb();
		}

		collectFileToArray(file, collected);

		// do nothing with the files.
		return cb();
	}

	function endStream(cb) {
		if (collected.length) {

			// sort by date
			collected.sort(function(a, b){
				if (opts.sort === "desc") {
					return b[opts.sortBy].valueOf() - a[opts.sortBy].valueOf();
				}
				return a[opts.sortBy].valueOf() - b[opts.sortBy].valueOf();
			});

			// trim
			collected = collected.slice(0,opts.n);

			// get the last file, base new file path on this file
			var last = collected.pop(),
				collectedPath = path.join(last.basepath, opts.fileName);
			collectedFile = new File({path: collectedPath});
			collected.push(last);

			if (!util.isObject(collectedFile[opts.property])) {
				collectedFile[opts.property] = {};
			}

			collectedFile[opts.property][opts.parameter] = collected;

			// append collected file to stream
			this.push(collectedFile);
		}
		cb();
	}

	return through.obj(collectFiles, endStream);
};