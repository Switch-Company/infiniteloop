define( function(){
  'use strict';
  var swapView = Backbone.View.extend( {

    attributes: function(){
      return {
        'height': document.body.clientHeight,
        'id': 'swap',
        'width': document.body.clientWidth

      };
    },

    subscriptions: {
      'resize': 'setSize',
      'swap:load': 'preloadImages',
      'swap:img': 'updateImages'
    },

    tagName: 'canvas',

    initialize: function(){
      this.images = [];
      this.context = this.el.getContext('2d');

      this.getRatio();
    },

    // draw images on canvas
    drawImage: function( src ) {

      var _this = this,
          img = new Image();

      img.addEventListener( 'load', function(){
        img.removeEventListener( 'load', null );

        _this.context.drawImage( img, _this.ratio.x, _this.ratio.y, _this.ratio.w, _this.ratio.h );

        img = null;
      } );

      img.src = src;

    },

    getRatio: function( width, height ){
      var newRatio = {},
          currentRatio,
          left,
          top,
          videoRatio = 720 / 1280;

      width = width || document.body.clientWidth;
      height = height || document.body.clientHeight;

      currentRatio = height / width;

      newRatio.x = width;
      newRatio.y = width * videoRatio;

      left = 0;
      top = ( ( newRatio.y - height ) / 2 ) * -1;

      this.ratio = {
        w: newRatio.x,
        h: newRatio.y,
        x: left,
        y: top
      };
    },

    // preload all images
    preloadImages: function( type ) {
      this.images.length = 0;
      var ext = Modernizr.webp ? '.webp' : '.jpg',
          trailing,
          fileIndex;

      for( var index = 0; index < 360; index++ ) {
        trailing = index < 10 ? "00" : index < 100 ? "0" : "";
        fileIndex = [ trailing, index ].join('');

        this.images.push( [ '/medias/dyn/', type ,'/', fileIndex, ext ].join('') );
      }
    },

    setSize: function( isFullscreen, width, height ){
      this.el.setAttribute( 'width', width );
      this.el.setAttribute( 'height', height );

      this.getRatio( width, height );

    },

    // set image according to timeline rotation
    updateImages: function( index ) {
      var src = this.images[ index ];

      if( !src ){
        return;
      }

      window.clearTimeout( this.timeout );
      // add a delay so we wont swap every frames if the wheel moves too fast
      this.timeout = window.setTimeout( $.proxy( function(){
          this.drawImage( src );
        }, this ), 10 );

    }

  } );

  return swapView;
} );
