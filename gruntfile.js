module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            default: {
                src : ['src/client/cornerstone.js'],
                dest: 'dist',
                expand: true,
                flatten: true
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask('default', ['copy']);
};