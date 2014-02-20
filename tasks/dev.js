/*global module:false*/
module.exports = function( grunt ){
  grunt.registerTask( 'dev', function(){
    grunt.task.run( [
      'copy:config',
      'copy:js',
      'jade:html',
      'sass:dev',
      'notify:dev'
    ] );
  } );
};
