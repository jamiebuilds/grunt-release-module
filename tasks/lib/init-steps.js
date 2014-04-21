var Promise = require('bluebird');
var promptAsync = require('./prompt-async');
var semver = require('semver');
var path = require('path');
var Repo = Promise.promisifyAll(require('gitty')('./'));
var editorAsync = Promise.promisify(require('editor'));

module.exports = function (grunt) {
  return {
    checkStatusOfRepo: function() {
      grunt.verbose.writeln('Checking status of repo');
      return Repo.statusAsync().then(function(status) {
        if (status.staged.length > 0 || status.not_staged.length > 0) { // jshint ignore: line
          throw new Error('Please commit all files before performing a release.');
        }
      });
    },

    getTypeOfRelease: function() {
      grunt.verbose.writeln('Getting type of release');
      return promptAsync([{
        type : 'list',
        name : 'type',
        message : 'What kind of release is this?',
        choices : ['patch', 'minor', 'major']
      }]).get('type');
    },

    getVersion: function(type) {
      grunt.verbose.writeln('Getting semver version');
      var currentVersion = require(path.join('../', 'package.json')).version;

      grunt.verbose.writeln('Validating current version');
      if (!semver.valid( currentVersion )) {
        throw new Error('Current version (' + currentVersion + ') is invalid.', currentVersion);
      }

      this.NEXT_VERSION = semver.inc(currentVersion, type);

      grunt.verbose.writeln('Validating next version');
      if (!semver.valid( this.NEXT_VERSION )) {
        throw new Error('Current version (' + this.NEXT_VERSION + ') is invalid.');
      }

      grunt.verbose.writeln('Confirming next version');
      return promptAsync([{
        type: 'confirm',
        name: 'confirm',
        message: 'Is version ' + this.NEXT_VERSION + ' okay?'
      }]).then(function(answers) {
        if (!answers.confirm) {
          throw new Error('Cancelled.');
        }
      });
    },

    checkForBadVersion: function() {
      grunt.verbose.writeln('Checking if tag already exists for version');
      return Repo.tagsAsync().then(function(tags) {
        if (tags.indexOf('v' + this.NEXT_VERSION) > -1) {
          throw new Error('Tag v' + this.NEXT_VERSION + ' already exists.');
        }
      });
    },

    editChangelog: function() {
      grunt.log.writeln('Editor: Edited CHANGELOG');
      return editorAsync('CHANGELOG.md');
    },

    editUpgradeGuide: function() {
      grunt.log.writeln('Editor: Edited Upgrade Guide');
      return editorAsync('UPGRADE-GUIDE.md');
    }
  };
};
