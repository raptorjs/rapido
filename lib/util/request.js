var raptorPromises = require('raptor-promises');
var _request = require('request');

function request(options, logger) {
    var rapido = require('../').instance;
    logger = logger || rapido.log;
    var deferred = raptorPromises.defer();

    var url;

    if (typeof options === 'string') {
        url = options;
    }
    else {
        url = options.url;
        logger = logger || options.logger;
    }

    logger.info('request', 'Making an HTTP request to "' + url + '"...');

    _request(options, function(error, response, body) {
        if (error) {
            deferred.reject('Request to "' + url + '" failed. Exception: ' + error);
        }
        else if (response.statusCode !== 200) {
            logger.debug('request', 'Response to "' + url + '": ' + body);
            deferred.reject('Request to "' + url + '" failed. Response status code: ' + response.statusCode);
        }
        else {
            var result = JSON.parse(body);
            if (options.logResponses !== false) {
                logger.debug('request', 'Response to "' + url + '": ' + JSON.stringify(result, null, 4));    
            }
            
            deferred.resolve(result);
        }
    });

    return deferred.promise;
}

module.exports = request;