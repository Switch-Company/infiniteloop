/* global module:false */
module.exports = {
  files: {
    expand: true,
    cwd: 'medias/dyn/rotation',
    src: '{,**/}*.jpg',
    dest: '<%= build %>/medias/dyn/rotation'
  },
  options: {
    verbose: false,
    quality: 80,
    compressionMethod: 6,
    filterStrength: 100,
    filterSharpness: 0
  }
};
