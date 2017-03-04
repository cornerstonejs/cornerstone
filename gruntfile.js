var babel = require('rollup-plugin-babel');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            default: {
                src: [
                    'dist', ' build',
                ]
            }
        },
        rollup: {
          build: {
            options: {
              format: 'iife',
              moduleName: 'cornerstone',
              plugins: [ babel() ],
            },
            files: [{
              'build/built.js': ['src/cornerstone.js'], // Only one source file is permitted
            }],
          }
        },
        concat: {
            css: {
                options: {
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                        '| (c) 2014 Chris Hafey | https://github.com/chafey/cornerstone */\n'
                },
                src: ['src/cornerstone.css'],
                dest: 'dist/cornerstone.css',
            },
            dist: {
                options: {
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                        '| (c) 2014 Chris Hafey | https://github.com/chafey/cornerstone */\n'
                },
                src : ['build/built.js'],
                dest: 'dist/cornerstone.js'
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/cornerstone.min.js': ['dist/cornerstone.js']
                }
            },
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                    '| (c) 2014 Chris Hafey | https://github.com/chafey/cornerstone */\n'
            }
        },
        qunit: {
            all: ['test/**/*.html']
        },
        jshint: {
            files: [
                'src/*.js'
            ],
            options: {
              esversion: 6
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.js', 'test/**/*'],
                tasks: ['buildAll']
            }
        },
        cssmin: {
            dist: {
                files: {
                    'dist/cornerstone.min.css': ['dist/cornerstone.css']
                }
            }
        }

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('buildAll', ['rollup', 'concat', 'uglify', 'jshint', 'cssmin', 'qunit']);
    grunt.registerTask('default', ['clean', 'buildAll']);
    //grunt.registerTask('default', ['babel']);
};


// Release process:
//  1) Update version numbers in package.json and bower.json
//  2) do a build (needed to update dist versions with correct build number)
//  3) commit changes
//      git commit -am "Changes...."
//  4) tag the commit
//      git tag -a 0.1.0 -m "Version 0.1.0"
//  5) push to github
//      git push origin master --tags
