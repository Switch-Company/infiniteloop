define( function() {
  'use strict';

  var appView = Backbone.View.extend({
    el: 'body',

    events: {
      'click .nav': 'handleNav',
      'click .backface': 'stopPropagation',
      'click .close': 'goBack',
      'click a[href ^= "/"]': 'route',
      'touchmove .l-txt': 'stopPropagation',
      'keydown': 'keyboard'
    },

    layers: {},

    subscriptions: {
      'page': 'open',
      'images': 'getCachedImages',
      'timeline:visible': 'handleVisibility'
    },

    initialize: function() {
      this.bindFullscreen();
      $(window).on( 'resize', $.proxy( this.handleResize, this ) );
      this.preload();
    },

    bindFullscreen: function(){
      //equalize methods
      window.HTMLElement.prototype.requestFullscreen = window.HTMLElement.prototype.requestFullscreen ||
        window.HTMLElement.prototype.webkitRequestFullscreen ||
        window.HTMLElement.prototype.mozRequestFullScreen ||
        window.HTMLElement.prototype.msRequestFullscreen;


      document.fullscreenEl = function(){
       return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || false;
      };

      if( !window.HTMLElement.prototype.requestFullscreen ){
        return;
      }
      document.documentElement.classList.remove( 'no-fullscreen' );
      document.documentElement.classList.add( 'fullscreen' );

      document.exitFullscreen = document.exitFullscreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

      $(document).on( 'webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange', $.proxy( this.handleFullscreen, this ) );
    },

    closeLayer: function( open ){
      if( !this.$currentLayer ){
        if( open ){
          open();
        }
        return;
      }

      var self = this;

      window.TweenLite
        .fromTo( this.$currentLayer, 0.5, {
          y: 0
        }, {
          y: document.body.clientHeight,
          ease: window.Quart.easeIn,
          onComplete: $.proxy( function(){
            self.$currentLayer
              .removeAttr( 'style' )
              .removeClass( 'display' );
            self.$currentLayer = false;
            if( open ){
              open();
            }
          }, this )
        } );
    },

    getCachedImages: function( type, callback, scope ){
      callback.call( scope, this.images[ type ] );
    },

    // close layer by going back to the last page if available
    goBack: function(){
      var pages = this.model.get( 'pages' );
      this.model.router.navigate( pages[ this.model.currentType ], {
        'trigger': true
      } );
    },

    handleFullscreen: function(){
      this.resizing = true;
    },

    handleMetanav: function( reverse ){
      // hide metanav & button
      this.el.classList.toggle( 'hideNav', reverse );
      // fold the metanav
      this.el.classList.remove( 'displayNav' );
    },

    handleNav: function(){
      this.el.classList.toggle( 'displayNav' );
    },

    handleResize: function( e ){
      var fsEl, width, height;
      // on resize triggered by fullscreen
      if( this.resizing || e ){
        window.clearTimeout( this.timerResize );
        this.timerResize = window.setTimeout( $.proxy( function(){
          this.resizing = false;
          fsEl = document.fullscreenEl() || document.body;
          width = fsEl.clientWidth;
          height = fsEl.clientHeight;
          Backbone.Mediator.publish( e ? e.type : 'fullscreen', !!document.fullscreenEl(), width, height );
        }, this ), 200 );
      }
    },

    handleVisibility: function( visible ){
      this.handleMetanav( !visible );
    },

    keyboard: function(e) {
      Backbone.Mediator.publish( 'keyboard', e );
    },

    open: function( type, subcat, content, more ){
      this.el.className = '';
      Backbone.Mediator.publish( 'player:playback', 'pause' );
      this.closeLayer( $.proxy( function(){
        this.model.open( type, subcat, content, more );
      }, this ));
    },

    openLayer: function( layer ){

      //console.log( this.$currentLayer && this.$currentLayer === this.layers[ layer ], this.layers[ layer ] );

      if( !this.layers[ layer ] ){
        this.$currentLayer = this.layers[ layer ] = this.$( [ '#', layer ].join('') );
      }
      else if( this.$currentLayer && this.$currentLayer === this.layers[ layer ] ){
        this.closeLayer();
        return;
      }
      else{
        this.$currentLayer = this.layers[ layer ];
      }

      if( this.model.get( 'firstPage' ) !== layer ){
        window.TweenLite.fromTo( this.$currentLayer, 0.5, {
          'y': document.body.clientHeight
        }, {
          'display': 'block',
          'y': 0,
          ease: window.Quart.easeOut,
          onComplete: $.proxy( function(){
            this.$currentLayer.addClass( 'display' );
            this.$currentLayer.removeAttr( 'style' );
          }, this)
        } );
      }
      else{
        this.$currentLayer.addClass( 'display' );
      }

    },

    // preload all images
    preload: function() {
      this.preloader = document.createElement( 'div' );
      var ext = Modernizr.webp ? '.webp' : '.jpg',
          wrapper,
          img,
          fileIndex,
          trailing;

      this.preloader.className = 'preloader';

      this.imagesLoaded = [];

      _.each( [ 'rotation' ], function( type ){
        wrapper = document.createElement( 'div' );
        wrapper.className = type;

        for( var index = 0; index < 360; index++ ) {

          trailing = index < 10 ? "00" : index < 100 ? "0" : "";
          fileIndex = [ trailing, index ].join('');

          img = document.createElement( 'img' );

          img.addEventListener( 'load',$.proxy( this.preloadedImage, this) , false );

          wrapper.appendChild( img );

          img.src = [ '/medias/dyn/', type ,'/', fileIndex, ext].join('');
        }
        this.preloader.appendChild( wrapper );

      }, this );

      this.el.appendChild( this.preloader );

    },

    preloadedImage: function( e ){
      this.imagesLoaded.push( e.src );
      if( this.imagesLoaded.length === 180 ){
        this.ready = true;
        this.el.removeChild( this.preloader );
        document.documentElement.classList.remove( 'loading' );
        this.model.trigger( 'ready' );
      }
    },

    route: function( e ){
      if( e.currentTarget.target === '_blank' || e.currentTarget.classList.contains( 'refresh' ) ){
        return;
      }
      e.preventDefault();

      if( !this.ready ){
        return;
      }

      this.model.router.navigate( e.currentTarget.getAttribute("href"), {
          "trigger": true,
          "replace": false
        } );
    },

    // stop the events' propagation ( touchmove )
    stopPropagation: function( e ){
      e.stopPropagation();
    }

  });

  return appView;
} );
