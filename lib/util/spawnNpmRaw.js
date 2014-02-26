var spawn = require('child_process').spawn;
var raptorPromises = require('raptor-promises');
var projectManager = require('./project-manager');

module.exports = function npmCommandRaw(args, options) {
    var rapido = require('../').instance;
    options = options = {};

    var logger = options.logger || rapido.log;

    var deferred = raptorPromises.defer();
    var hasError = false;

    options.cwd = options.cwd || projectManager.rootDir || process.cwd();
    options.stdio = 'inherit';

    var command = 'npm ' + args.join(' ');
    logger.info('npm', 'Executing "' + command + '"...');
    var npm = spawn('npm', args, options);

    npm.on('close', function (code) {
        if (hasError) {
            logger.error('npm', '"' + command + '" completed with errors');
            deferred.reject('"' + command + '" failed with errors');
        }
        else if (code !== 0) {
            logger.error('npm', '"' + command + '" exited with error code ' + code);
            deferred.reject('"' + command + '" failed with code ' + code);
        }
        else {
            logger.info('npm', '"' + command + '" completed successfully');
            deferred.resolve();
        }
    });

    return deferred.promise;
};