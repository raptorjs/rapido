var spawn = require('child_process').spawn;
var split = require('split');
var raptorPromises = require('raptor-promises');
var projectManager = require('./project-manager');

module.exports = function npmCommand(args, options) {
    var rapido = require('../').instance;

    options = options || {};

    var captureOutput = options.captureOutput === true;

    var logger = options.logger || rapido.log;

    var deferred = raptorPromises.defer();
    var hasError = false;

    options.cwd = options.cwd || projectManager.rootDir;

    if (options.cwd && typeof options.cwd !== 'string') {
        options.cwd = options.cwd.toString();
    }

    var command = 'npm ' + args.join(' ');
    if (options.cwd !== projectManager.rootDir) {
        logger.info('npm', 'Executing "' + command + '" (cwd: ' + options.cwd + ')...');
    }
    else {
        logger.info('npm', 'Executing "' + command + '"...'); 
    }

    var npm = spawn('npm', args, options);
    var stdout = '';
    var stderr = '';

    npm.stdout
        .pipe(split())
        .on('data', function (data) {
            if (captureOutput) {
                stdout += data + '\n';
            }

            data = data.toString().trim();
            if (!data) {
                return;
            }
            rapido.log.info('npm', data);
        });

    npm.stderr
        .pipe(split())
        .on('data', function (data) {
            if (captureOutput) {
                stderr += data + '\n';
            }

            data = data.toString().trim();
            if (!data) {
                return;
            }

            if (data.indexOf('No repository field') !== -1) {
                return;
            }

            if (data.indexOf('No README data') !== -1) {
                return;
            }

            if (data.indexOf('excluding symbolic link') !== -1) {
                return;
            }

            if (data.startsWith('npm ERR!')) {
                rapido.log.error('npm', data.toString().trim());
                hasError = true;    
            }
            else if (data.startsWith('npm WARN')) {
                rapido.log.warn('npm', data.toString().trim());
            }
            else {
                rapido.log.info('npm', data.toString().trim());
            }
        });

    npm.on('close', function (code) {
        
        var errMessage;

        if (hasError) {
            errMessage = '"' + command + '" completed with errors';
        }
        else if (code !== 0) {
            errMessage = '"' + command + '" exited with error code ' + code;
            
            deferred.reject('"' + command + '" failed with code ' + code);
        }
        else {
            logger.info('npm', '"' + command + '" completed successfully');
            var result = null;
            if (captureOutput) {
                result = {
                    stdout: stdout,
                    stderr: stderr
                };
            }
            deferred.resolve(result);
        }

        if (errMessage) {
            if (captureOutput && stderr) {
                errMessage += '. stderr: ' + stderr;
            }
            
            var err = new Error('[npm] ' + errMessage);
            logger.error('npm', errMessage);
            if (captureOutput) {
                err.stdout = stdout;
                err.stderr = stderr;
            }
            deferred.reject(err);
        }
        
    });

    return deferred.promise;
};