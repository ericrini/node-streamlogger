var LogStream = require('./LogStream');
var lodash = require('lodash');

/**
 * The LogFactory constructor.
 * @constructor
 */
var LogFactory = function () {
	var self = this;
	self._streams = {};
	self._filters = [];
};

/**
 * Create a new LogStream.
 * @param name The name of the component originating the logs.
 * @returns {LogStream}
 */
LogFactory.prototype.create = function (name) {
	var self = this;
	self._streams[name] = new LogStream(name);
	self._streams[name].on('error', function (error) {
		self.streams['BeagleDrone.server.LogFactory'].error(error);
	});
	return self._streams[name];
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
	lodash.forEach(self._streams, function (stream) {
		stream.pipe(outputStream, {
			end: false
		});
	});
};

// It's a single instance.
module.exports = new LogFactory();