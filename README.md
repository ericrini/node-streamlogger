# Usage Example
The most basic usage. This will allow logs to be written.
```
var StreamLogger = require('node-streamlogger');
var log = StreamLogger.LogFactory.create('my.component.name');
log.debug('This is a simple debug log.');
```

The text formatting is very flexible and capable of handling parameterization, JSON objects (that do not contian circular references) and Error objects (which will include a complete stack trace in the logs).
```
log.info('Everyone cares about this: %s, %s, %s.', 'val1', 'val2', 'val3');
log.warn('Some data: %s', { x: 0, y: 0, z: 0 });
log.error(new Error('Something is broken.'));
```

There is also a fatal log level. This will cause the process to shutdown (via SIGINT) if it is called.
```
log.fatal('Holy FUBAR!');
```

Multiple loggers can exist at the same time. The output of each logger can be configured independently. For example, stable components can be set to warn\error, while newer components can be set to debug levels.
```
var syslog = StreamLogger.LogFactory.create('system');
syslog.setLogLevel('warn');
var log1 = StreamLogger.LogFactory.create('stable.component');
log1.setLogLevel('info');
var log2 = StreamLogger.LogFactory.create('unstable.component');
log1.setLogLevel('debug');
```

Logs can be output to any node.js stream running in object mode. The raw stream events look like this.
```
{
    type: 'log',
    meta: {
        name: 'logger.name',
        level: [1,2,3,4,5],
        timestamp: '2000-01-01T00:00:00+00:00'
    },
    payload: {
        message: 'The formatted log message.'
    }
}
```

For convenience a console transport implementation is included.
```
LogFactory.pipe(new StreamLogger.ConsoleTransport());
```

The ConsoleTransport will send nice colorized ASCII to the stdout and stderr streams. However custom implementations could send JSON data to a flat file or TCP data to a log aggregation server.
```
04/19/15 22:08:41 | info  | http                 | Linux process listening @ http://ijoin.localhost:8081.
04/19/15 22:08:41 | info  | http                 | Visit http://ijoin.localhost:8081/api/swagger-ui for documentation.
04/19/15 22:09:41 | debug | system               | Online for 1 minutes. Using 30 of 60 Mb (50%) heap. Over the last minute, the load average was 1.
04/19/15 22:09:41 | debug | some.component       | Is this data {
      "json": "json",
      "data": []
    } as screwy as I think it is?
04/19/15 22:09:41 | error | unstable.component   | Error: Its FUBAR
    at null.<anonymous> (/var/www/ijoin/api/source/server.js:115:14)
    at wrapper [as _onTimeout] (timers.js:261:14)
    at Timer.listOnTimeout [as ontimeout] (timers.js:112:15)
```

# Development
Run tests.
```
gulp jasmine
```

Generate jsdoc.
```
gulp jsdoc
```

Run jscheck.
```
gulp jscheck
```