var ConsoleTransport = require('./ConsoleTransport');
var LogStream = require('../LogStream');
var moment = require('moment');

describe('The ConsoleTransport', function () {

	it('will write log statements to stdio streams', function (done) {
		var utc = moment.utc;
		spyOn(moment, 'utc').and.callFake(function () {
			return utc('2001-01-01');
		});
		spyOn(process.stdout, 'write');
		spyOn(process.stderr, 'write');

		var log1 = new LogStream('more.then.twenty.characters.long');
		var log2 = new LogStream('logger.name');
		log1.debug('debug message');
		log1.pipe(new ConsoleTransport());
		log2.pipe(new ConsoleTransport());
		log2.info('info message');
		log2.warn('warn message');
		log2.error('error message');

		setTimeout(function () {
			expect(process.stdout.write).toHaveBeenCalledWith('\u001b[90m01/01/01 00:00:00 | debug | more.then.twenty.... | debug message\n\u001b[39m');
			expect(process.stdout.write).toHaveBeenCalledWith('\u001b[37m01/01/01 00:00:00 | info  | logger.name          | info message\n\u001b[39m');
			expect(process.stdout.write).toHaveBeenCalledWith('\u001b[33m01/01/01 00:00:00 | warn  | logger.name          | warn message\n\u001b[39m');
			expect(process.stderr.write).toHaveBeenCalledWith('\u001b[31m01/01/01 00:00:00 | error | logger.name          | error message\n\u001b[39m');
			done();
		}, 10);
	});

});