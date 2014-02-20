/*global module:false*/
module.exports = {
  dev:{
    files: [{
      expand: true,
      cwd: 'css-sass',
      src: [ '**/*.scss', '!**/_*.scss', '!tools/**/*' ],
      dest: '<%= build %>/css',
      ext: '.css'
    }],
    options: {
      'precision': 7
    }
  },
  release: {
    files: '<%= sass.dev.files %>',
    options: {
      'precision': '<%= sass.dev.options.precision %>',
      'style': 'compressed'
    }
  }
};
