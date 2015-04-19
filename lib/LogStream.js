var ReadableStream = require('stream').Readable || require('readable-stream').Readable;
var util = require('util');
var lodash = require('lodash');
var moment = require('moment');

/**
 * This is a logging facade backed by stream.Readable implementations.
 * @param name - The name of the component that is originating log entries.
 * @param options - Node stream.Readable options.
 * @constructor
 */
var LogStream = function (name, options) {
	var self = this;
	self._name = name;
	self._logLevel = 1;
	options = lodash.assign({}, options);
	options.objectMode = true;
	ReadableStream.call(self, options);
};

util.inherits(LogStream, ReadableStream);

LogStream.prototype.LogLevels = {
	debug: 1,
	info: 2,
	warn: 3,
	error: 4,
	fatal: 5
};

LogStream.prototype._read = function (count) {
	// Intentionally empty. Required by stream.Readable.
};

/**
 * Allows logging in the node util.format style. Do not call this directly, use the debug, info, warn, error, fatal
 * helpers. Objects and Errors passed as arguments will receive special serializer treatment to ensure no log data is
 * lost.
 *
 * Examples:
 *   logStream.log('debug', 'This is a simple debug log.');
 *   logStream.debug('This is a simple debug log.');
 *   logStream.info('Everyone cares about this: %s, %s, %s.', 'val1', 'val2', 'val3');
 *   logStream.warn('Some data: %s', { x: 0, y: 0, z: 0 });
 *   logStream.error(new Error('Something is broken.'));
 *   logStream.fatal('Holy FUBAR!');
 *
 * @param level The log level.
 * @param message The util.format formatting string.
 * @param args Any additional number of arguments. (optional)
 *
 * @returns {Boolean} If this returns false, the stream has reached its high water mark. Try something like
 * logStream.pipe(process.stdout) to drain the buffer.
 */
LogStream.prototype._log = function (level) {
	var self = this;
	var args = Array.prototype.slice.call(arguments);

	// Make sure the log is above the loggers severity level.
	if (LogStream.prototype.LogLevels[level] < self._logLevel) {
		return;
	}

	// Process arguments.
	var innerArgs = lodash.map(args.slice(1, args.length), function (arg) {

		// Convert errors into stack traces.
		if (typeof(arg) === 'object' && arg.stack) {
			return arg.stack;
		}

		// Convert objects into JSON.
		if (typeof(arg) === 'object') {
			try {
				return JSON.stringify(arg, null , 2);
			}
			catch (error) {
				return error.stack;
			}
		}

		return arg;
	});

	var event = {
		type: 'log',
		meta: {
			name: self._name,
			level: level,
			timestamp: moment.utc().valueOf()
		},
		payload: {
			message: util.format.apply(util, innerArgs)
		}
	};

	return self.push(event);
};

// Add a convenience function for each log severity level.
lodash.forEach(LogStream.prototype.LogLevels, function (value, key) {
	if (key === 'none') {
		return;
	}

	LogStream.prototype[key] = function () {
		var self = this;
		var args = Array.prototype.slice.call(arguments);
		args.unshift(key);
		return self._log.apply(self, args);
	};
});

var fatal = LogStream.prototype.fatal;

/**
 * A fatal log event is like any other log, except that it will send a SIGINT to the process that triggered it. This can
 * be used with a watchdog process to heal a corrupted system process.
 *
 * @see LogStream.log()
 */
LogStream.prototype.fatal = function () {
	var self = this;
	var args = arguments;

	// A fatal log will SIGINT on the next event loop tick.
	setImmediate(function () {
		fatal.apply(self, args);

		// This should allow the opportunity to gracefully exit the process. In a scenario where the state is so
		// corrupt more damage would occur, the caller can handle the process exit on the current tick.
		process.kill(process.pid, 'SIGINT');
	});
};

/**
 * Only log entries at or above the specified log level will pass through the logger. Entries below the specified log
 * level will be dropped.
 *
 * @param logLevel
 */
LogStream.prototype.setLogLevel = function (logLevel) {
	var self = this;
	if (LogStream.prototype.LogLevels[logLevel]) {
		self._logLevel = LogStream.prototype.LogLevels[logLevel];
	}
};

module.exports = LogStream;