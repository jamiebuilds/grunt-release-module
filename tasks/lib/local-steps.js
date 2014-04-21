var Promise = require('bluebird');
var promptAsync = require('./prompt-async');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var Repo = Promise.promisifyAll(require('gitty')('./'));

function updateJsonFileVersion(file, version) {
  var data = require(file);
  var filepath = path.resolve(__dirname, file);

  data.version = version;
  data = JSON.stringify(data, null, 2);
  data += '\n';

  return fs.writeFileAsync(filepath, data);
}

module.exports = function (grunt) {
  return {
    confirmReadyToPublish: function() {
      grunt.verbose.writeln('Checking if ready to publish');
      return promptAsync([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you ready to publish ' + this.NEXT_VERSION + '?'
      }]).then(function (answers) {
        if (!answers.confirm) {
          throw new Error('Cancelled.');
        }
      });
    },

    updatePackageJson: function() {
      grunt.verbose.writeln('Updating package.json');
      return updateJsonFileVersion(path.join('../', 'package.json'), this.NEXT_VERSION);
    },

    updateBowerJson: function() {
      grunt.verbose.writeln('Updating bower.json');
      return updateJsonFileVersion(path.join('../', 'bower.json'), this.NEXT_VERSION);
    },

    getUnstagedFiles: function() {
      grunt.verbose.writeln('Getting unstaged files');
      return Repo.statusAsync()
        .get('not_staged')
        .map(function (item) {
          return item.file;
        });
    },

    addAllRepoFiles: function (files) {
      grunt.verbose.writeln('Add all repo files');
      return Repo.addAsync(files);
    },

    commitNextVersion: function () {
      grunt.log.writeln('GIT: Commit "Release v' + this.NEXT_VERSION + '"');
      return Repo.commitAsync('Release v' + this.NEXT_VERSION);
    },

    tagNextVersion: function () {
      grunt.log.writeln('GIT: Tag "v' + this.NEXT_VERSION + '"');
      return Repo.tagAsync('v' + this.NEXT_VERSION);
    }
  };
};
