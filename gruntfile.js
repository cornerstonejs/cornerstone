module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            default: {
                src: [
                    'dist'
                ]
            }
        },
        concat: {
            dist: {
                src : ['src/client/core/*.js', 'src/client/*.js', 'src/client/tools/*.js'],
                dest: 'dist/cornerstone.js'
            }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/cornerstone.min.js': ['dist/cornerstone.js']
                }
            }
        },
        qunit: {
            all: ['test/**/*.html']
        },
        watch: {
            scripts: {
                files: ['src/client/**/*.js', 'test/**/*.js'],
                tasks: ['concat', 'qunit']
            }
        },

    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['clean', 'concat', 'uglify']);
};