var exec = require('child-process-promise').exec;
var raptorPromises = require('raptor-promises');
var projectManager = require('./project-manager');

module.exports = function(command, options) {
    var rapido = require('../').instance;
    options = options || {};
    var logger = options.logger || rapido.log;


    var deferred = raptorPromises.defer();

    options.cwd = options.cwd || projectManager.rootDir;

    if (options.cwd && typeof options.cwd !== 'string') {
        options.cwd = options.cwd.toString();
    }

    if (options.cwd !== projectManager.rootDir) {
        logger.info('exec', 'Executing "' + command + '" (cwd: ' + options.cwd + ')...');
    }
    else {
        logger.info('exec', 'Executing "' + command + '"...');    
    }

    exec(command, options)
        .then(function(result) {
            logger.info('exec', '"' + command + '" completed successfully');
            deferred.resolve(result);
        })
        .fail(function(e) {
            var message = '"' + command + '" failed: ' + e;
            logger.error('exec', message);
            deferred.reject(message);
        });

    return deferred.promise;
};