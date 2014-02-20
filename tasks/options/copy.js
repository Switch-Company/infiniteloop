/*global module:false*/
module.exports = {
  files: {
    files: {
      '<%= build %>/': [ 'medias/**/*', '.htaccess', 'favicon.ico', 'js/vendor/modernizr.js' ]
    }
  },
  js: {
    files: {
      '<%= build %>/': [ 'js/**/*' ]
    }
  },
  config: {
    files: {
      '<%= build %>/': [ 'config.json' ]
    }
  },
  medias: {
    files: {
      '<%= build %>/': [ 'medias/**/*' ]
    }
  },
  img: {
    files: {
      '<%= build %>/': [ 'medias/images/*' ]
    }
  },
  fonts: {
    files: {
      '<%= build %>/': [ 'medias/fonts/*']
    }
  },
  templates: {
    files: {
      '<%= build %>/': [ 'js/view/templates/*.html']
    }
  }
};
