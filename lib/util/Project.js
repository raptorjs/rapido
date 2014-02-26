var raptorPromises = require('raptor-promises');


function write() {
    var _this = this;
    var writePromise = this._writePromise;

    function doWrite() {

        var deferred = raptorPromises.defer();
        var promise = deferred.promise;


        function writeCallback(err) {
            if (err) {
                return deferred.reject(err);
            }

            deferred.resolve();
        }
        try {
            var result = _this.doWrite(writeCallback);
            if (result != null) {
                if (typeof result.then === 'function') {
                    promise = result;
                } else {
                    promise = raptorPromises.resolved(result);
                }
            }
            
        } catch(e) {
            deferred.reject(e);
        }

        return promise;
    }

    if (writePromise) {
        writePromise = writePromise.then(doWrite);
    } else {
        writePromise = doWrite();
    }

    this._writePromise = writePromise;
    return writePromise;
}


function Project(rootDir) {
    this.rootDir = rootDir;
    this._readCache = {};
}

Project.readers = {};

Project.prototype = {
    read: function(namespaces, options) {
        var force = false;
        if (options) {
            force = options.force === true;
        }

        var _this = this;

        function doRead(namespace) {
            var promise = force ? null : _this._readCache[namespace];
            if (promise) {
                return promise;
            }

            var deferred = raptorPromises.defer();
            promise = deferred.promise;

            var readFunc = Project.readers[namespace];
            if (!readFunc) {
                deferred.reject('Project info reader not found for "' + namespace + '". Available: ' + Object.keys(Project.readers).join(', '));
            }

            function readCallback(err, data) {
                if (err) {
                    return deferred.reject(err);
                }

                deferred.resolve(data);
            }
            try {
                var result = readFunc(_this, readCallback);
                if (result != null) {
                    if (typeof result.then === 'function') {
                        promise = result;
                    } else {
                        promise = raptorPromises.resolved(result);
                    }
                }
                
            } catch(e) {
                deferred.reject(e);
            }

            _this._readCache[namespace] = promise;

            return promise;
        }

        var promises = namespaces.map(doRead);

        return raptorPromises.all(promises)
            .then(function(results) {
                var info = {
                    rootDir: _this.rootDir
                };

                for (var i=0; i<results.length; i++) {
                    var infoObject = results[i];
                    if (infoObject.doWrite) {
                        infoObject.write = write;
                    }
                    info[namespaces[i]] = results[i];
                }

                return info;
            });
    }
};

Project.registerInfoReader = function(namespace, handler) {
    Project.readers[namespace] = handler;
};

module.exports = Project;