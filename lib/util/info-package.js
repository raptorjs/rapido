var nodePath = require('path');
var version = require('./version');
var extend = require('raptor-util').extend;
var fs = require('fs');

function PackageInfo(path, pkg) {
    var pkgVersion = pkg.version;
    delete pkg.version;

    extend(this, pkg);

    var parsedVersion;

    Object.defineProperty(this, "path", {
        get: function() {
            return path;
        },
        set: function(value) {
            path = value;
        },
        enumerable: false,
        configurable: false
    });

    Object.defineProperty(this, "parsedVersion", {
        get: function() {
            return parsedVersion;
        },
        set: function(value) {
            parsedVersion = value;
        },
        enumerable: false,
        configurable: false
    });
    
    Object.defineProperty(this, "version", {
        get: function() {
            return parsedVersion.toString(); 
        },
        set: function(value) {
            parsedVersion = version.parse(value);
        },
        enumerable: true,
        configurable: true
    });

    this.version = pkgVersion;
}

PackageInfo.prototype = {
    doWrite: function(callback) {
        var json = JSON.stringify(this, null, '    ');
        fs.writeFile(this.path, json, {encoding: 'utf8'}, callback);
    }
};

exports.read = function read(project) {
    var path = nodePath.join(project.rootDir, 'package.json');
    var pkg = JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
    return new PackageInfo(path, pkg);
};