/*global module:false*/
module.exports = function( grunt ){
  var files = [
    'vendors/require',
    'vendors/jquery.min',
    'vendors/underscore',
    'vendors/backbone',
    'tools/backbone.mediator',
    'tools/requestanimationframe',
    'tools/classlist',
    'vendors/TweenMax.min',
    'vendors/jquery.gsap.min',
    'init'
  ];

  grunt.option.init( {
    'scripts': files,
    'releasing': false
  } );

  // default grunt configuration
  var defaults = {
    build: 'publish/',
    verbose: true
  };

  var config = require('load-grunt-config')(grunt, {
    configPath: 'tasks/options',
    init: false
  });

  grunt.loadTasks( 'tasks' );

  grunt.util._.extend( config, defaults );

  grunt.initConfig( config );
};
