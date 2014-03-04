var propertyHandlers = require('property-handlers');

function load(rapido, options) {
    propertyHandlers(options, {
        title: function(value) {
            rapido.title = value;
        },

        configFilename: function(value) {
            rapido.configFilename = value;
        },

        stackDirs: function(value) {
            for (var i=0; i<value.length; i++) {
                rapido.addStackDir(value[i]);
            }
        },

        enabledStacks: function(value) {
            for (var i=0; i<value.length; i++) {
                rapido.enableStack(value[i]);
            }
        },

         nodeModulesDirs: function(value) {
            for (var i=0; i<value.length; i++) {
                rapido.addNodeModulesDir(value[i]);
            }
        },

        version: function(value) {
            if (typeof value === 'function') {
                Object.defineProperty(rapido, 'version', {
                    get: value
                });
            } else {
                rapido.version = value;
            }
        }
    }, 'options');
}

exports.load = load;