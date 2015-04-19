var LogStream = require('./LogStream');
var lodash = require('lodash');

/**
 * The LogFactory constructor.
 * @constructor
 */
var LogFactory = function () {
	var self = this;
	self._inputs = {};
	self._outputs = [];
};

/**
 * Create a new LogStream.
 * @param name The name of the component originating the logs.
 * @returns {LogStream}
 */
LogFactory.prototype.create = function (name) {
	var self = this;
	self._inputs[name] = new LogStream(name);
	lodash.forEach(self._outputs, function (outputStream) {
		self._inputs[name].pipe(outputStream);
	});
	return self._inputs[name];
};

/**
 * Connect all loggers to an output stream.
 *
 * Example:
 *   logFactory.pipe(process.stdout)
 *
 * @param outputStream A node stream.Writable that will accept all log events.
 */
LogFactory.prototype.pipe = function (outputStream) {
	var self = this;
	self._outputs.push(outputStream);
	lodash.forEach(self._inputs, function (stream) {
		stream.pipe(outputStream, {
			end: false
		});
	});
};

// It's a single instance.
module.exports = new LogFactory();