var rapido = require('../').instance;

function Logger() {
    this.logs = [];
}

Logger.prototype = {
    _addLog: function(level, args) {
        var logInfo = {
            log: function() {
                var logFunc = rapido.log[level];
                logFunc.apply(rapido.log, args);
            }
        };
        this.logs.push(logInfo);
        logInfo.log();
    },

    replay: function() {
        this.logs.forEach(function(logInfo) {
            logInfo.log();
        });
    },

    summarize: function() {
        rapido.log.info("summary", "Below is a summary of what happened:");
        console.log("----------------------------------------------");
        this.replay();
        console.log("----------------------------------------------");
        rapido.log.info("summary", "(end summary)");
        rapido.log();
    }
};

var logLevels = ['debug', 'info', 'warn','error','success'];
logLevels.forEach(function(logLevel) {
    Logger.prototype[logLevel] = function() {
        this._addLog(logLevel, arguments);
    };
 });

module.exports = function create() {
    return new Logger();
};

