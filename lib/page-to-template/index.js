"use strict";

const through = require("through2"),
	PluginError = require("gulp-util").PluginError,
	File = require("gulp-util").File,
	path = require("path"),
	fs = require("fs"),
	util = require("util");

const defaults = {
	"path": "templates",
	"template": "default.jade",
	"variable": "page"
};

/**
 * @param str
 * @returns {boolean}
 */
function isString(str) {
	return typeof str === "string";
}

/**
 * Enwrap the contents of a text file in a (Jade?) template.
 *
 * 1. Load the template from location specified in options
 * 2. Extract original contents from file
 * 3. Create new file[data|locals][page] variable to hold original contents
 * 4. return updated file
 *
 * *Note* plugin does not compile or process the template.
 *
 * @param {{[path]: string, [template]: string, [variable]: string}} options
 */
module.exports = function pageToTemplate(options) {

	var opts = Object.assign({}, defaults, options);

	function wrap(file, enc, cb) {

		if(file.isStream()){
			return cb(new PluginError('page-to-template', 'Streaming not supported'));
		}

		// make sure we have a data object to write to
		var data; // reference to data bucket "locals" or "data" in file
		// gulp-jade prefers file.locals over file.data. Use locals if available
		if (util.isObject(file.locals)) {
			data = file.locals;
		} else if (util.isObject(file.data)) {
			data = file.data
		}

		// use front-matter defined template or fall back to template from options
		var templatePath = path.join(opts.path, file.data.template || opts.template);

		// read template data
		fs.readFile(templatePath, function(err, template){
			if (err) {
				return cb(new PluginError(
					"page-to-template",
					util.format("Template path %s could not be read", templatePath)));
			}
			// set original contents to data[variable]
			data[opts.variable] = file.contents.toString();
			file.contents = new Buffer(template);

			// return updated file with jade bits
			cb(null, file);
		});
	}

	return through.obj(wrap);
};