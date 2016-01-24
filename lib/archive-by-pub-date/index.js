"use-strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	File = require("gulp-util").File,
	util = require("util"),
	path = require("path");

const PLUGIN_NAME = "archive-by-pub-date";

const defaults = {
	sort: "desc",
	fileName: "index.html",
	property: "data",
	parameter: "archives", // file[data] parameter containing the list of items
	sortBy: "published" // file[data][sortBy] date for sorting
};

/**
 * Given a list of files, Create a single archive file which references all the archive files'
 * data and content. Return a single file with the archive as a file[data][archive] array.
 *
 * @param {Object} [options]
 */
module.exports = function archiveByPubDate(options) {

	var opts = Object.assign({}, defaults, options),
		collected = [],
		basepath;

	/**
	 * Extract file data and contents into an object. Append object to array 'arr'.
	 *
	 * @param {File} file
	 * @param {Array} arr
	 */
	function collectFileToArray(file, arr) {
		var o = Object.assign({}, file[opts.property]);

		// ensure the sortBy date is a fresh date instance
		if (util.isDate(o[opts.sortBy])) {
			// create a new date instance
			o[opts.sortBy] = new Date(o[opts.sortBy]);
		} else {
			// fall back to last modified time
			o[opts.sortBy] = new Date(file.stat.mtime);
		}

		// convert contents from buffer to string and capture
		o.contents = (file.contents) ? file.contents.toString() : "";

		// capture the CWD to build an output file form later
		if (!basepath) {
			basepath = file.cwd;
		}

		// capture
		arr.push(o);
	}

	/**
	 * Given a date-sorted array of collected objects,
	 * Assemble into a tree of year -> month -> items
	 * @param {Array} collected
	 * @returns {Array}
	 */
	function createArchive(collected) {
		var archives = [];

		collected.forEach(function(f) {
			var y = f[opts.sortBy].toLocaleString('en-US',{year: "numeric"}),
				m = f[opts.sortBy].toLocaleString('en-US',{month: "numeric"}),
				mName = f[opts.sortBy].toLocaleString('en-US',{month: "long"}),
				year,
				month;

			year = findYear(y, archives);
			month = findMonth(m, mName, year.months);
			month.items.push(f);
		});

		return archives;
	}

	/**
	 * Search array `arr` for an object with a year property who's value matches `year`.
	 * If the object doesn't exist, create and append to `arr`.
	 * Return the object.
	 * @param {String} year
	 * @param {Array} arr
	 * @returns {{year: string, months: Array}}
	 */
	function findYear(year, arr) {
		var y = arr.find(function(el) {
			return (util.isObject(el) && el.year && el.year === year);
		});
		if (!y) {
			y = {
				year: year,
				months: []
			};
			arr.push(y);
		}
		return y;
	}

	/**
	 * Search array `arr` for an object with a month property who's value matches `month`
	 * If the object doesn't exist, create and append to `arr`.
	 * Return the object.
	 * @param month
	 * @param arr
	 * @returns {{month: string, items}}
	 */
	function findMonth(month, name, arr) {
		var m = arr.find(function(el) {
			return (util.isObject(el) && el.month && el.month === month);
		});
		if (!m) {
			m = {
				month: month,
				name: name,
				items: []
			}
			arr.push(m);
		}
		return m;
	}

	/**
	 * For each file, extract file data and contents into a reference object.
	 * Add this object to an array.
	 * @param {File} file
	 * @param {String} enc
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

			var archives = createArchive(collected),
				archivePath = path.join(basepath, opts.fileName),
				archiveFile = new File({path: archivePath});
			archiveFile[opts.property] = {};
			archiveFile[opts.property][opts.parameter] = archives;

			this.push(archiveFile);

		}
		return cb();
	}

	return through.obj(collectFiles, endStream);
};