/* global module:false */
module.exports = function( grunt ) {

  var jadeVars = grunt.util._.extend(
    grunt.file.readJSON('pages/vars.json'),
    grunt.file.readJSON('config.json'),
    '<%= scripts %>' );

  grunt.registerTask( 'release', function(){

    // configure jade for release
    grunt.config.set( 'jade.release', {
      files: '<%= jade.html.files %>',
      options: {
        data: jadeVars,
        pretty: true,
        selfClose: true,
        compileDebug: false
      }
    } );

    grunt.task.run( [
      'clean:dist',
      'copy:config',
      'jshint:release',
      'jade:release',
      'sass:release',
      'requirejs',
      'clean:require',
      'sass:release'
    ] );

  } );
};
