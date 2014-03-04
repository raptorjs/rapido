var spawn = require('child_process').spawn;
var split = require('split');
var raptorPromises = require('raptor-promises');

module.exports = function(cmd, args, options) {
    var rapido = require('../').instance;
    options = options || {};
    var logger = options.logger || rapido.log;
    var captureOutput = options.captureOutput === true;

    return require('./project-manager').load()
        .then(function(projectInfo) {
            var deferred = raptorPromises.defer();

            options.cwd = options.cwd || projectInfo.rootDir.getAbsolutePath();
            options.stdio = 'inherit';

            var command = cmd + ' ' + args.join(' ');

            if (options.cwd && typeof options.cwd !== 'string') {
                options.cwd = options.cwd.toString();
            }
            
            if (options.cwd !== projectInfo.rootDir.getAbsolutePath()) {
                logger.info(cmd, 'Executing "' + command + '" (cwd: ' + options.cwd + ')...');
            }
            else {
                logger.info(cmd, 'Executing "' + command + '"...');    
            }

            var stderr = '';
            var stdout = '';
            
            var p = spawn(cmd, args, options);

            p.stdout
                .pipe(split())
                .on('data', function (data) {
                    if (captureOutput) {
                        stdout += data + '\n';
                    }

                    data = data.toString().trim();
                    if (!data) {
                        return;
                    }
                    rapido.log.info(cmd, data);
                });

            p.stderr
                .pipe(split())
                .on('data', function (data) {
                    if (captureOutput) {
                        stderr += data + '\n';
                    }

                    data = data.toString().trim();
                    if (!data) {
                        return;
                    }

                    rapido.log.info(cmd, data.toString().trim());
                });

            p.on('close', function (code) {
                if (code !== 0) {
                    logger.error(cmd, '"' + command + '" exited with error code ' + code);

                    var e = new Error('"' + command + '" failed with code ' + code);
                    if (captureOutput) {
                        e.stderr = stderr;
                        e.stdout = stdout;
                    }

                    deferred.reject(e);
                }
                else {
                    logger.info(cmd, '"' + command + '" completed successfully');
                    deferred.resolve(captureOutput ? stdout : null);
                }
            });

            return deferred.promise;
        });
};