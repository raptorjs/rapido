var exec = require('child-process-promise').exec;
var raptorPromises = require('raptor-promises');

exports.read = function(project) {
    var gitBranch;
    var gitUrl;

    var rootDir = project.rootDir || process.cwd();

    function determineBranch() {
        if (process.env.GIT_BRANCH) {
            gitBranch = process.env.GIT_BRANCH;
        }
        else {
            return exec("git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \\(.*\\)/ \\1/'", {cwd: rootDir})
                .then(function(result) {
                    gitBranch = result.stdout.toString().trim();
                    gitBranch = gitBranch === 'HEAD' ? null : gitBranch;
                })
                .fail(function() {
                });
        }
    }

    function determineGitUrl() {
        return exec('git config --get remote.origin.url', {cwd: rootDir})
            .then(function(result) {
                gitUrl = result.stdout.toString().trim();
            })
            .fail(function(e) {
            });
    }

    return raptorPromises.makePromise()
        .then(determineBranch)
        .then(determineGitUrl)
        .then(function() {
            return {
                branch: gitBranch,
                url: gitUrl
            };
        });


};