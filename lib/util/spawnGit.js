var spawn = require('child_process').spawn;
var split = require('split');
var raptorPromises = require('raptor-promises');

module.exports = function gitCommand(args, options) {
    var rapido = require('../').instance;
    var logger;
    var expectError = false;
    options = options || {};

    if (options.debug) {
        logger = options;
        options = {};
    }
    else {
        logger = options.logger;
        expectError = options.expectError === true;
    }

    logger = logger || rapido.log;
    var rootDir = options.cwd || options.rootDir || require('./project-manager').rootDir;

    var deferred = raptorPromises.defer();
    var hasError = false;
    var stdout = '';

    var command = 'git ' + args.join(' ');
    logger.info('git', 'Executing "' + command + '"...');

    var git = spawn('git', args, {cwd: rootDir});

    git.stdout
        .pipe(split())
        .on('data', function (data) {
            var trimmed = data.toString().trim();
            if (!trimmed) {
                return;
            }
            stdout += data.toString() + '\n';
            rapido.log.info('git', data);
        });

    git.stderr
        .pipe(split())
        .on('data', function (data) {
            data = data.toString().trim();
            if (!data) {
                return;
            }

            rapido.log.info('git', data.toString().trim());
        });

    git.on('close', function (code) {
        if (hasError) {
            logger.error('git', '"' + command + '" completed with errors');
            deferred.reject('"' + command + '" failed with errors');
        }
        else if (code !== 0) {

            if (expectError) {
                logger.info('git', '"' + command + '" exited with error code ' + code);
            }
            else {
                logger.error('git', '"' + command + '" exited with error code ' + code);
            }
            
            deferred.reject('"' + command + '" failed with code ' + code);
        }
        else {
            logger.info('git', '"' + command + '" completed successfully');
            deferred.resolve({
                stdout: stdout
            });
        }
    });

    return deferred.promise;
};