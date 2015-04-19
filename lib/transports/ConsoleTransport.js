var WritableStream = require('stream').Writable || require('readable-stream').Writable;
var lodash = require('lodash');
var util = require('util');
var moment = require('moment');
var chalk = require('chalk');

function padString(string, length) {
	if (string.length > length) {
		return string.substring(0, length - 3) + '...';
	}
	var formatted = string + new Array(length).join(' ');
	return formatted.substring(0, length);
}

/**
 * A ConsoleTransport.
 * @param options
 * @constructor
 */
var ConsoleTransport = function (options) {
	var self = this;
	options = lodash.assign({}, options);
	options.objectMode = true;
	WritableStream.call(self, options);
};

util.inherits(ConsoleTransport, WritableStream);

ConsoleTransport.prototype.Colors = {
	'debug': 'gray',
	'info': 'white',
	'warn': 'yellow',
	'error': 'red',
	'fatal': 'magenta'
};

ConsoleTransport.prototype._write = function (event, encoding, callback) {
	try {
		var message = util.format(
			'%s | %s | %s | %s\n',
			new moment.utc(event.meta.timestamp).format('MM/DD/YY HH:mm:ss'),
			padString(event.meta.level, 5),
			padString(event.meta.name, 20),
			event.payload.message
		);

		// Colorize the log according to its log level.
		message = chalk[ConsoleTransport.prototype.Colors[event.meta.level]](message);

		if (event.meta.level === 'error') {
			setImmediate(function () {
				callback(undefined, process.stderr.write(message));
			});
		}
		else {
			setImmediate(function () {
				callback(undefined, process.stdout.write(message));
			});
		}
	}
	catch (error) {
		setImmediate(function () {
			callback(error);
		});
	}
};

module.exports = ConsoleTransport;