var LogStream = require('./LogStream');
var moment = require('moment');

describe('The LogStream', function () {

	it('will stream readable log entries', function (done) {
		var timestamp = 0;

		spyOn(process, 'kill');
		spyOn(moment, 'utc').and.callFake(function () {
			return {
				valueOf: function () {
					return timestamp;
				}
			};
		});

		var logStream = new LogStream('some.test.component.name');

		var count = 0;
		logStream.on('data', function (log) {
			count += 1;

			if (count === 1) {
				expect(log).toEqual({
					type: 'log',
					meta: {
						name: 'some.test.component.name',
						level: 'debug',
						timestamp: timestamp
					},
					payload: {
						message: 'This is a simple debug log.'
					}
				});
			}

			if (count === 2) {
				expect(log).toEqual({
					type: 'log',
					meta: {
						name: 'some.test.component.name',
						level: 'info',
						timestamp: timestamp
					},
					payload: {
						message: 'Everyone cares about this: val1, val2, val3.'
					}
				});
			}

			if (count === 3) {
				expect(log).toEqual({
					type: 'log',
					meta: {
						name: 'some.test.component.name',
						level: 'warn',
						timestamp: timestamp
					},
					payload: {
						message: 'Some data: {\n  "x": 0,\n  "y": 0,\n  "z": 0\n}'
					}
				});
			}

			if (count === 4) {
				expect(log.type).toBe('log');
				expect(log.meta.name).toBe('some.test.component.name');
				expect(log.meta.level).toBe('error');
				expect(log.meta.timestamp).toBe(timestamp);
				expect(log.payload.message).toBeDefined();	// This is a stacktrace that contains paths that will vary by machine.
			}

			if (count === 5) {
				expect(log).toEqual({
					type: 'log',
					meta: {
						name: 'some.test.component.name',
						level: 'fatal',
						timestamp: timestamp
					},
					payload: {
						message: 'Holy FUBAR!'
					}
				});

				setImmediate(function () {
					expect(process.kill).toHaveBeenCalledWith(process.pid, 'SIGINT');
					done();
				});
			}
		});

		logStream.debug('This is a simple debug log.');
		logStream.info('Everyone cares about this: %s, %s, %s.', 'val1', 'val2', 'val3');
		logStream.warn('Some data: %s', { x: 0, y: 0, z: 0 });
		logStream.error(new Error('Something is broken.'));
		logStream.fatal('Holy FUBAR!');
	});

	it('will squelch logs below the set severity level', function (done) {
		var logStream = new LogStream('some.test.component.name');

		expect(logStream._logLevel).toBe(1);
		logStream.setLogLevel('error');
		expect(logStream._logLevel).toBe(4);
		logStream.debug('noise');
		logStream.info('noise');
		logStream.warn('noise');
		logStream.error('signal');
		logStream.setLogLevel('warn');
		expect(logStream._logLevel).toBe(3);
		logStream.debug('noise');
		logStream.info('noise');
		logStream.warn('signal');
		logStream.error('signal');
		logStream.setLogLevel('info');
		expect(logStream._logLevel).toBe(2);
		logStream.debug('noise');
		logStream.info('signal');
		logStream.warn('signal');
		logStream.error('signal');
		logStream.setLogLevel('debug');
		expect(logStream._logLevel).toBe(1);
		logStream.debug('signal');
		logStream.info('signal');
		logStream.warn('signal');
		logStream.error('signal');

		logStream.setLogLevel('invalid');
		expect(logStream._logLevel).toBe(1);

		var count = 0;
		logStream.on('data', function (log) {
			count += 1;
			expect(log.payload.message).toBe('signal');
			if (count === 10) {
				done();
			}
		});
	});

});