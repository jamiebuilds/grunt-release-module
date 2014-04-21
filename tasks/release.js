var Promise = require('bluebird');

module.exports = function (grunt) {
  var initSteps = require('./lib/init-steps')(grunt);
  var localSteps = require('./lib/local-steps')(grunt);
  var remoteSteps = require('./lib/remote-steps')(grunt);

  grunt.task.registerTask('release', 'Automated releases.', function () {
    Promise.bind({})
      .then( initSteps.checkStatusOfRepo )
      .then( initSteps.getTypeOfRelease )
      .then( initSteps.getVersion )
      .then( initSteps.checkForBadVersion )
      .then( initSteps.editChangelog )
      .then( initSteps.editUpgradeGuide )
      .then( localSteps.confirmReadyToPublish )
      .then( localSteps.updatePackageJson )
      .then( localSteps.updateBowerJson )
      .then( localSteps.getUnstagedFiles )
      .then( localSteps.addAllRepoFiles )
      .then( localSteps.commitNextVersion )
      .then( localSteps.tagNextVersion )
      .then( remoteSteps.checkIfReadyToPush )
      .then( remoteSteps.pushBranchToOrigin )
      .then( remoteSteps.publishToNPM )
      .then(function () {
        grunt.log.ok('Great Success');
      })
      .catch(grunt.log.error)
      .finally(this.async());
  });
};
