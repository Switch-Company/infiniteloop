/* global module:false */
module.exports = function( grunt ){
  var jadeVars = grunt.util._.extend(
    grunt.file.readJSON('pages/vars.json'),
    grunt.file.readJSON('config.json'), {
    scripts: grunt.option( 'scripts')
  } );

  return {
    html: {
      files: [{
        expand: true,
        cwd: 'pages/',
        src: [ '*.jade', '!_*.jade' ],
        ext: '.html',
        dest: '<%= build %>'
      }],
      options: {
        data: jadeVars,
        pretty: true,
        selfClose: true,
        compileDebug: false
      }
    }
  };
};
