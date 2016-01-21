"use-strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	File = require("gulp-util").File,
	util = require("util");

const defaults = {
	"parameter": "published",
	"property": "data"
};

/**
 * Ensure that every file has a "published" or similar date
 *
 * Inspect file[property][parameter] for a date value. If the value exists,
 * ensure it is a date. If not a date attempt to convert this value to a Date instance.
 *
 * If all else fails, create a new Date instance
 *
 * @param {{parameter: String, [property]: String}|string} options
 */
module.exports = function ensureFileDate(options) {

	// normalize options
	if (util.isString(options)) {
		options = {parameter : options};
	}

	// @type {{parameter: String, property: String}}
	var opts = Object.assign({}, defaults, options);

	/**
	 *
	 * @param {File} file
	 * @param {String} enc
	 * @param {Function} cb callback which accepts an error and file object when file processing is done
	 */
	function parseDate(file, enc, cb) {

		// skip it
		if(file.isStream()){
			return cb(new PluginError('ensure-file-date', 'Streaming not supported'));
		}

		// does this file have data object property from gulp-data, gulp-front-matter or similar?
		if (util.isObject(file[opts.property])) {
			if (util.isDate(file[opts.property][opts.parameter])) {
				// the property is a date, but it's not valid. Use mtime
				if (isNaN(file[opts.property][opts.parameter].getTime())) {
					file[opts.property][opts.parameter] = new Date(file.stat.mtime);
				}
				// otherwise ignore
			} else {
				// try to create a date from the file[property][parameter] falling back to mtime
				var d = new Date(file[opts.property][opts.parameter]);
				if (isNaN(d.getTime())) {
					// parameter has produced an invalid date. Use mtime.
					d = new Date(file.stat.mtime);
				}
				file[opts.property][opts.parameter] = d;
			}
		} else {
			// create a file data container, add a new Date instance from the file's modified time.
			file[opts.property] = {};
			file[opts.property][opts.parameter] = new Date(file.stat.mtime);
		}

		// return the file to the stream
		cb(null, file);
	}

	return through.obj(parseDate);
};