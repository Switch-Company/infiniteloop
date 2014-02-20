/*global module:false*/
module.exports = {
  js: {
    files: [ 'js/**/*.js' ],
    tasks: [ 'jshint:dev', 'js:dev', 'notify:js' ]
  },
  config: {
    files: [ 'config.json'],
    tasks: [ 'copy:config' ]
  },
  templates: {
    files: [ 'js/view/templates/*.html' ],
    tasks: [ 'copy:templates' ]
  },
  gruntfile: {
    files: 'Gruntfile.js',
    tasks: [ 'jshint:gruntfile' ]
  },
  jade: {
    files: [ 'pages/**/*.jade' ],
    tasks: [ 'jade', 'notify:jade' ]
  },
  media: {
    files: [ 'medias/**/*','!medias/sprite' ],
    tasks: [ 'copy:img', 'notify:medias' ]
  },
  sass: {
    files: ['css-sass/**/*.scss' ],
    tasks: [ 'sass:dev', 'notify:sass' ]
  }
};
