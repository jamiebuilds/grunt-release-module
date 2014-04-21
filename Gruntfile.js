module.exports = function (grunt) {

  grunt.loadTasks('tasks');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: '<%= pkg.version %>',
    release: {
      options: {

      }
    }
  });

  grunt.registerTask('default', ['release']);

};
