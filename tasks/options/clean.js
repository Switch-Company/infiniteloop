/* global module:false */
module.exports = {
  dist: [ '<%= build %>/js', '<%= build %>/*.html', '<%= build %>/datas', '<%= build %>/css' ],
  require: [ '<%= build %>/js/build.txt', '<%= build %>/js/vendors/require.js', '<%= build %>/js/collection', '<%= build %>/js/model', '<%= build %>/js/view'],
  medias: ['<%= build %>/medias']
};
