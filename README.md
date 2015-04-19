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

Logs can be output to any node.js stream. For convenience a console transport implementation is included.
```
LogFactory.pipe(new StreamLogger.ConsoleTransport());
```

The console output might look like this. It's nicely colorized as well.
```
01/01/01 00:00:00 | info  | component1.name      | message content
01/01/01 00:00:00 | error | component1.name      | message content
    stack trace...
    stack trace...
    stack trace...
01/01/01 00:00:00 | info  | component2.name      | message content
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