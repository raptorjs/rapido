var fs = require('fs');
var Project = require('./Project');
var ok = require('assert').ok;
var cache = {};

function PackageInfo() {

}

PackageInfo.prototype = {
    write: function() {

    }
};

function getProject(options) {
    var config = require('../').instance.config;

    if (!options) {
        options = {};
    }

    var rootDir = options.cwd || options.rootDir || config["root.dir"] || config["webapp.dir"] || process.cwd();
    rootDir = fs.realpathSync(rootDir);

    var project = cache[rootDir];
    if (!project) {
        project = new Project(rootDir);
        cache[rootDir] = project;
    }

    return project;
}

function read(props, options) {
    var project = getProject(options);
    return project.read(props, options);
}

function write(props, options) {
    var project = getProject(options);
    return project.write(props, options);
}

function registerInfoReader(namespace, handler) {
    ok(typeof namespace === 'string');
    ok(typeof handler === 'function');
    
    Project.registerInfoReader(namespace, handler);
}

registerInfoReader('package', require('./info-package').read);
registerInfoReader('npm', require('./info-npm').read);
registerInfoReader('git', require('./info-git').read);

exports.registerInfoReader = registerInfoReader;
exports.read = read;
exports.write = write;