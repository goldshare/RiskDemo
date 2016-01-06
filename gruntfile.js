module.exports = function(grunt) {

  // Load all grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long grunt task take. Can help when optimizing build times
  //require('time-grunt')(grunt);

  //Configure grunt
  grunt.initConfig({

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost', // Change this to '0.0.0.0' to access the server from outside.
        //keepalive: true // keep the server alive. so the grunt task won't stop
        livereload: 35729 
      },
      all: {
        options: {
          open: true,
          base: [
            'app' // This is the base file folder. we suppose our index.html is located in this folder
                       // replace with the directory you want the files served from
          ]
        }
      }
    },

    //Watch files for changes, and run tasks base on the changed files.
    watch: {
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>' // this port must be same with the connect livereload port
        },
        // Watch whatever files you needed.
        files: [
          'app/*.html',
          'app/*.css',
          'app/scripts/(,*/}*.js',
          'app/assets/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    }

  });

  // Creates the 'serve' task
  grunt.registerTask('serve', [
    'connect:all',
    'watch'
  ]);
};