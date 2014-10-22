/*global module:false*/
module.exports = function( grunt ){
  grunt.registerTask( 'js', function( target ){
    grunt.task.run( [ 'copy:js' ] );
  } );
};
