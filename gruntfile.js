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
            distCornerstone: {
                src : ['src/*.js'],
                dest: 'dist/cornerstone.js'
            }
        },
        uglify: {
            cornerstone: {
                files: {
                    'dist/cornerstone.min.js': ['dist/cornerstone.js']
                }
            }
        },
        qunit: {
            all: ['test/**/*.html']
        },
        jshint: {
            files: [
                'src/*.js'
            ]
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'test/**/*.js'],
                tasks: ['buildAll']
            }
        },

    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('buildAll', ['concat:distCornerstone', 'uglify:cornerstone', 'jshint']);

    grunt.registerTask('default', ['clean', 'buildAll']);
};