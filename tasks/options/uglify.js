/* global module: false */
module.exports = {
  options: {
    banner: '<%= banner %>',
    wrap: 'stains',
    exportAll: true
  },
  dist: {
    src: '<%= concat.dist.dest %>',
    dest: '<%= concat.dist.dest %>'
  }
};