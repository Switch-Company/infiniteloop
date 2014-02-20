/*global module:false*/
module.exports = function( grunt ){
  var files = grunt.option( 'scripts' ).slice();
  files.splice( 0, 1, 'vendors/almond.js' );

  return {
    release: {
      options: {
        baseUrl: './js',
        mainConfigFile: './js/init.js',
        dir: '<%= build %>/js',
        modules: [
          {
            name: 'init',
            include: files
          }
        ],
        inlineText: true,
        keepBuildDir: false,
        optimize: 'uglify2',
        preserveLicenseComments: false,
        removeCombined: true,
        wrap: true
      }
    }
  };
};
