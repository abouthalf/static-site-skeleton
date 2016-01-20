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
 * Inspect file[property][parameter] for a string value. If the value exists,
 * attempt to convert this value to a Date instance
 *
 * @param {{parameter: String, [property]: String}|string} options
 */
module.exports = function parseFileDate(options) {

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

		if(file.isStream()){
			return cb(new PluginError('parse-file-date', 'Streaming not supported'));
		}

		// does this file have data object property from gulp-data or similar?
		if (util.isObject(file[opts.property]) && util.isString(file[opts.property][opts.parameter])) {
			try {
				// parse date value and reset
				var d = new Date(file[opts.property][opts.parameter]);
				// if getTime produces a number, then we have a valid date
				if (!isNaN(d.getTime())) {
					file[opts.property][opts.parameter] = d;
				}
			} catch(e) {
				return cb(new PluginError(
						"parse-file-date",
						"Supplied value "
							+ file[opts.property][opts.parameter]
							+ " from " + file.basename + " is not a valid Date string"));
			}
		}

		// return the file to the stream
		cb(null, file);
	}

	return through.obj(parseDate);
};