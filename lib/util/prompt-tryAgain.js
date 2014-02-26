function tryAgain(message, cause, tryAgainCallback) {
    var rapido = require('../').instance;
    var prompt = rapido.prompt;

    if (arguments.length === 2) {
        // No cause
        tryAgainCallback = arguments[1]; 
        cause = null;
    }

    var errMessage;

    if (cause) {
        if (message) {
            errMessage = message + '. Error: ' + (cause.stack || cause);
        }
        else {
            errMessage = 'Error: ' + (cause.stack || cause);
        }
    }
    else {
        errMessage = message;
    }
    
    rapido.log.error('FAILED', errMessage);

    return prompt({
            properties: {
                "tryAgain": {
                    type: 'string', 
                    description: 'Try again with new input?',
                    default: 'Y',
                    required: true
                }
            }
        })
        .then(function(result) {
            var cont = (result['tryAgain'] || '').toUpperCase();

            if (cont === 'Y' || cont === 'YES' ) {
                return tryAgainCallback();
            }

            throw 'Command aborted';
        })
        .fail(function(err) {
            if (err.message === 'canceled') {
                throw 'Command aborted';
            }
            else {
                throw err;
            }
        });
}

tryAgain.errorHandler = function(tryAgainCallback, message) {
    message = message || "An error has occured";
    
    return function(cause) {
        return tryAgain(message, cause, tryAgainCallback);
    };
};

module.exports = tryAgain;

