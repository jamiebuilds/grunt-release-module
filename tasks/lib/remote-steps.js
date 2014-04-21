var Promise = require('bluebird');
var promptAsync = require('./prompt-async');
var Repo = Promise.promisifyAll(require('gitty')('./'));
var shell = require('shelljs');

module.exports = function (grunt) {
  return {
    checkIfReadyToPush: function () {
      grunt.verbose.writeln('Checking if ready to push');
      return promptAsync([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you ready to push v' + this.NEXT_VERSION + ' to origin?'
      }]).then(function (answers) {
        if (!answers.confirm) {
          throw new Error('Cancelled.');
        }
      });
    },

    pushBranchToOrigin: function () {
      grunt.verbose.writeln('Pushing branch to origin master');
      return Repo.pushAsync('origin', 'master', []);
    },

    publishToNPM: function () {
      grunt.verbose.writeln('Publishing to npm');
      return new Promise(function (resolve, reject) {
        shell.exec('npm publish', function (code) {
          if (code !== 0) {
            return reject('npm publish exited with ' + code);
          }
          resolve();
        });
      });
    }
  };
};
