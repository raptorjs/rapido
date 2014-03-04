var File = require('raptor-files/File');


exports.resolveHomePath = function(path) {
    if (!path) {
        return path;
    }

    if (path.startsWith('~/')) {
        var homePath = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        if (!homePath) {
            throw new Error('Unable to resolve home directory for path "' + path + '".');
        }

        return homePath + path.substring(1);
    }
    else {
        return path;
    }
};

exports.findSnapshotVersions = function(project, recursive) {
    var rapido = require('../').instance;

    // if (project.version.label === 'SNAPSHOT') {
    //     // SNAPSHOT versions are allowed for SNAPSHOT modules
    //     return;
    // }

    var snapshotModules = [];

    function checkDependencies(pkg, type, packageFile) {
        var dependencies = pkg[type];
        if (!dependencies) {
            return;
        }

        for (var moduleName in dependencies) {
            if (dependencies.hasOwnProperty(moduleName)) {
                var moduleVersion = dependencies[moduleName].toLowerCase();
                if (moduleVersion.indexOf('-beta') !== -1 || moduleVersion.indexOf('-SNAPSHOT') !== -1) { // Look for a "-" as a pre-release indicator for a module
                    snapshotModules.push(moduleName + '@' + moduleVersion + ' in ' + rapido.relativePath(packageFile) + ' (' + type + ')');
                }
            }
        }
    }

    function checkPackage(pkg, packageFile) {
        checkDependencies(pkg, 'dependencies', packageFile);
        checkDependencies(pkg, 'devDependencies', packageFile);
    }

    // Check the root package
    checkPackage(project.packageManifest, project.packageFile);

    function checkPackagesRecursive(dir) {
        var nodeModulesDir = new File(dir, "node_modules");
        if (!nodeModulesDir.exists()) {
            return;
        }

        nodeModulesDir.listFiles().forEach(function(moduleDir) {
            if (moduleDir.isDirectory()) {
                var packageFile = new File(moduleDir, 'package.json');
                if (packageFile.exists()) {
                    checkPackage(JSON.parse(packageFile.readAsString()), packageFile);
                    checkPackagesRecursive(moduleDir);
                }
            }
        });
    }

    if (recursive !== false) {
        checkPackagesRecursive(project.rootDir);
    }
    
    if (snapshotModules.length) {
        throw 'Unable to publish module since it depends on SNAPSHOT versions:\n- ' + snapshotModules.join('\n -') + '\n\npackage.json should be modified as to not depend on any SNAPSHOT versions.';
    }

    return snapshotModules;
};

var utilMethods = ['exec', 'replayLogger', 'request', 'spawn', 'spawnGit', 'spawnNpm', 'spawnNpmRaw', 'version'];

utilMethods.forEach(function(utilMethod) {
    Object.defineProperty(exports, utilMethod, {
        get: function() {
            return require('./' + utilMethod);
        }
    });
});