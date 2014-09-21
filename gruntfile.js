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
        copy: {
            bower: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jquery/dist/jquery.min.map',
                ],
                dest: 'example',
                expand: true,
                flatten: true
            }
        },
        concat: {
            build: {
                src : ['src/ieVer.js','src/*.js'],
                dest: 'build/built.js'
            },
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
            ]
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'test/**/*.js'],
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

    grunt.registerTask('buildAll', ['copy', 'concat', 'uglify', 'jshint', 'cssmin']);
    grunt.registerTask('default', ['clean', 'buildAll']);
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