/*global module:false*/
module.exports = function( grunt ){
  grunt.registerTask( 'medias', function(){
    grunt.task.run( [
      'copy:medias',
      'img',
      'notify:medias'
    ] );
  } );
};
