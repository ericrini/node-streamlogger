var WebSocketTransport = require('./WebSocketTransport');
var LogStream = require('../LogStream');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;

describe('The WebSocketTransport', function () {

	var mockSocket;

	beforeEach(function () {
		mockSocket = new EventEmitter();
		mockSocket.readyState = 3;
		mockSocket.OPEN = 3;
		mockSocket.send = jasmine.createSpy().and.callFake(function (message, callback) {
			callback();
		});
		spyOn(mockSocket, 'on').and.callThrough();
	});

	it('will remove closed sockets', function () {
		var webSocketTransport = new WebSocketTransport();
		expect(webSocketTransport._sockets.length).toBe(0);
		webSocketTransport.addSocket(mockSocket);
		expect(webSocketTransport._sockets.length).toBe(1);
		mockSocket.emit('close');
		expect(webSocketTransport._sockets.length).toBe(0);
	});

	it('will write streaming events to an open WebSocket.', function (done) {
		spyOn(moment, 'utc').and.callFake(function () {
			return 0;
		});

		var webSocketTransport = new WebSocketTransport();

		var log1 = new LogStream('logger');
		log1.debug('debug message 1');
		log1.pipe(webSocketTransport);

		expect(webSocketTransport._sockets.length).toBe(0);
		webSocketTransport.addSocket(mockSocket);
		expect(webSocketTransport._sockets.length).toBe(1);

		setTimeout(function () {
			var payload = '{"type":"log","meta":{"name":"logger","level":"debug","timestamp":0},"payload":{"message":"debug message 1"}}';
			expect(mockSocket.on).toHaveBeenCalledWith('close', jasmine.any(Function));
			expect(mockSocket.send).toHaveBeenCalledWith(payload, jasmine.any(Function));
			done();
		}, 10);
	});

	it('will not try to write streaming events to a closed socket', function (done) {
		var webSocketTransport = new WebSocketTransport();

		var log1 = new LogStream('logger');
		log1.debug('debug message 1');
		log1.pipe(webSocketTransport);

		expect(webSocketTransport._sockets.length).toBe(0);
		mockSocket.readyState = 4;
		webSocketTransport.addSocket(mockSocket);
		expect(webSocketTransport._sockets.length).toBe(1);

		setTimeout(function () {
			expect(mockSocket.on).toHaveBeenCalledWith('close', jasmine.any(Function));
			expect(mockSocket.send.calls.count()).toBe(0);
			done();
		}, 10);
	});

});