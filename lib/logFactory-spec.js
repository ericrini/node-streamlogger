var logFactory = require('./logFactory');
var WritableStream = require('stream').Writable || require('readable-stream').Writable;
var util = require('util');
var moment = require('moment');

describe('The LogFactory', function () {

	var MockStream = function () {
		WritableStream.call(this, { objectMode: true });
	};

	util.inherits(MockStream, WritableStream);

	it('can create log streams', function () {
		var log1 = logFactory.create('log1');
		expect(log1).toBeDefined();
		var log2 = logFactory.create('log2');
		expect(log2).toBeDefined();
		expect(log1 === log2).toBe(false);
	});

	it('can merge many log streams into a single output stream', function (done) {
		spyOn(moment, 'utc').and.callFake(function () {
			return 0;
		});

		var log1 = logFactory.create('log1');
		log1.info('log 1 info');

		var log2 = logFactory.create('log2');
		log2.info('log 2 info');

		var mockStream = new MockStream();
		spyOn(mockStream, 'write').and.callFake(function () { return true; });
		logFactory.pipe(mockStream);

		setTimeout(function () {
			expect(mockStream.write).toHaveBeenCalledWith({
				type: 'log',
				meta: {
					name: 'log1',
					level: 'info',
					timestamp: 0
				},
				payload: {
					message: 'log 1 info'
				}
			});

			expect(mockStream.write).toHaveBeenCalledWith({
				type: 'log',
				meta: {
					name: 'log2',
					level: 'info',
					timestamp: 0
				},
				payload: {
					message: 'log 2 info'
				}
			});

			done();
		}, 10);
	});

});