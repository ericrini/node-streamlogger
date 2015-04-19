var WritableStream = require('stream').Writable || require('readable-stream').Writable;
var lodash = require('lodash');
var util = require('util');
var moment = require('moment');
var async = require('async');

/**
 * A WebSocket log transport.
 * @param options
 * @constructor
 */
var WebSocketTransport = function (options) {
	var self = this;
	self._sockets = [];
	options = lodash.assign({}, options);
	options.objectMode = true;
	WritableStream.call(self, options);
};

util.inherits(WebSocketTransport, WritableStream);

WebSocketTransport.prototype._write = function (event, encoding, callback) {
	var self = this;

	try {
		var serializedEvent = JSON.stringify(event);
		var asyncFunctions = [];
		lodash.reduce(self._sockets, function (asyncFunctions, socket) {
			asyncFunctions.push(function (callback) {
				if (socket.readyState === socket.OPEN) {
					socket.send(serializedEvent, callback);
				}
			});
		}, asyncFunctions);

		async.parallel(asyncFunctions, function (errors, results) {
			callback(undefined, true);
		});
	}
	catch (error) {
		setImmediate(function () {
			callback(error);
		});
	}
};

WebSocketTransport.prototype.addSocket = function (socket) {
	var self = this;
	socket.on('close', function () {
		self.removeSocket(socket);
	});
	self._sockets.push(socket);

};

WebSocketTransport.prototype.removeSocket = function (socket) {
	var self = this;
	lodash.remove(self._sockets, function (currentSocket) {
		return currentSocket === socket;
	})
};

module.exports = WebSocketTransport;