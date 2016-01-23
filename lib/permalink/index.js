"use-strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	util = require("util"),
	path = require("path");

const PLUGIN_NAME = "permalink";

const defaults = {
	parameter: "link", // file[data] parameter containing the link
	property: "data" // file[data] object property
};

/**
 * Create a file[data][link] property containing an absolute path to the file
 * Optionally include a domain name (e.g. http://example.com)
 *
 * @param options
 */
module.exports = function permalink(options) {

	var opts = Object.assign({}, defaults, options);

	function link(file, enc, cb) {

		// skip it
		if(file.isStream()){
			return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
		}

		// ensure file has a data property
		if (!util.isObject(file[opts.property])) {
			file[opts.property] = {};
		}

		// assemble link
		var link = file.path.replace(file.base, "");
		if (opts.host) {
			file[opts.property][opts.parameter] = path.join(opts.host, file.path.replace(file.base, ""));
		} else {
			file[opts.property][opts.parameter] = path.join("/", link);
		}

		// return the file to the stream
		cb(null, file);

	}

	return through.obj(link)
};