var nodePath = require('path');

var PUBLIC_REGISTRY = 'https://registry.npmjs.org/';
var DEFAULT_USER_CONFIG = '~/.npmrc';

var util = require('./util');
var rapido = require('../');

function NpmInfo(pkg) {
    var config = rapido.instance.config;

    this.registryRead = config['npm.registryRead'] || config['npm.registry'] || pkg.registry || PUBLIC_REGISTRY;
    this.registryWrite = config['npm.registryWrite'] || config['npm.registry'] || pkg.registry || PUBLIC_REGISTRY;

    var publishConfig = pkg.publishConfig;
    if (publishConfig && publishConfig.registry) {
        this.registryWrite = publishConfig.registry;
    }

    var installConfig = pkg.installConfig;
    if (installConfig && installConfig.registry) {
        this.registryRead = installConfig.registry;
    }

    this.userConfig = util.resolveHomePath(config['npm.userConfig'] || DEFAULT_USER_CONFIG);
}

NpmInfo.prototype = {
};

exports.read = function read(project) {
    var pkg = require(nodePath.join(project.rootDir, 'package.json'));
    return new NpmInfo(pkg);
};

