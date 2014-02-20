define( [ 'text!view/templates/t-control.html', 'vendors/svg' ], function( Template, SVG ){
  'use strict';

  var controlView = Backbone.View.extend( {

    attributes: {
      'class': 'control'
    },

    bufferIndex: 0,

    events: {
      'click button': 'handleAction',
      'mouseenter': 'handleOver',
      'touchstart .playback': 'handleDrag',
      'touchmove': 'handleDrag',
      'touchcancel': 'handleDrag',
      'touchend': 'handleDrag',
      'mousedown .playback': 'handleDrag',
      'mousemove': 'handleDrag',
      'mouseleave': 'handleDrag',
      'mouseup': 'handleDrag',
    },

    positions: {
      'outer': 2,
      'all': 26,
      'inner': 50
    },

    subscriptions: {
      'timeline:change': 'resetProgressBar',
      'timeline:replay': 'resetProgressBar',
      'timeline:visible': 'handleVisibility',
      'video:playing': 'handlePlayback',
      'video:progress': 'handleBuffer',
      'video:pause': 'handlePlayback'
    },

    template: _.template( Template ),

    initialize: function(){
      // firefox dasharray animation is reversed
      //  should be fixed in FF 29+
      this.revertedDash = Modernizr.prefixed('boxSizing') === 'MozBoxSizing' ? true : false;

      this.render();

      this.listenTo( this.model, 'change:type', this.moveControl );

    },

    append: function(){
      this.model.collection.parentEl.appendChild( this.el );
      this.el.style.zIndex = "2";
    },

    getPosition: function(){
      var type = this.model.get( 'type' );

      return type ?  type === 'outer' ? this.positions.outer : this.positions.inner : this.positions.all;
    },

    handleAction: function( e ){
      if( this.drag ){

        if( this.preventClick ){
          e.preventDefault();
          e.stopPropagation();
          this.preventClick = false;
        }

        return;
      }

      e.stopPropagation();

      var action;

      action = e.currentTarget.className === "all" ? false : e.currentTarget.className;
      if( e.currentTarget.classList.contains( 'playback' ) ){
        // force the unfocus styles
        e.currentTarget.blur();
        Backbone.Mediator.publish( 'player:playback' );
      }
      else{
        this.model.set( 'type', action );
      }
    },

    handleBuffer: function( video, track, type ){
      // force the progress bar to start from zero
      if( !this.firstBuffer ){
        this.firstBuffer = true;

        this.$progressBar.stroke( {
          'dashoffset': this.progressBarWidth
        } );

        this.handlePlayback( video, track, type );
      }

      // the progressBuffer tend to 0 as the video is buffering
      var delta = ( video.buffered.end( video.buffered.length - 1 ) * this.progressBarWidth ) / video.duration,
          progressBuffer = this.progressBarWidth - delta;

      if( progressBuffer < 0 ){
        progressBuffer = 0;
      }

      this.$bufferBar
        .stroke( {
          'dashoffset': progressBuffer
        } );
    },

    handleDisplay: function( reverse ){

      var opacity = 1;

      if( reverse && !reverse.type ){
        opacity = 0;
      }

      if( Modernizr.touch ){
        this.el.style.opacity = opacity;
      }
      else {
        this.$el.stop().animate( {
          'opacity': opacity
        }, 500 );
      }
    },

    handleDrag: function( e ){
      if( e.originalEvent) {
        e = e.originalEvent;
      }

      if( e.type === "mouseleave" ){
        this.handleOver( e );
      }

      e.preventDefault();

      switch( e.type ){
        case 'mousedown':
        case 'touchstart':
          this.preventClick = true;

          this.drag = {
            'start': ( e.targetTouches ? e.targetTouches[ 0 ].pageY : e.pageY ) - this.getPosition(),
            'limits': {
              'top': this.positions.outer - 5,
              'bottom': this.positions.inner + 5
            }
          };

          break;
        case 'mousemove':
        case 'touchmove':

          if( !this.drag ){
            return;
          }

          var y = e.targetTouches ? e.targetTouches[ 0 ].pageY : e.pageY,
              delta = y - this.drag.start;

            if( delta < this.drag.limits.top ){
              delta = this.drag.limits.top;
            }
            else if( delta > this.drag.limits.bottom ){
              delta = this.drag.limits.bottom;
            }

            this.drag.last = delta;

            this.playback.style.top = [ delta, 'px'].join('');

          break;
        default:
          this.handleOver( e );
          if( !this.drag ){
            return;
          }

          if( !_.isUndefined( this.drag.last ) ){
            var offset = Math.ceil( this.drag.last / 13 ),
                type;

            if( offset <= 1 ){
              type = 'outer';
            }
            else if( offset <= 3 ){
              type = false;
            }
            else{
              type = 'inner';
            }

            // if the type is still the same
            //  only animate back to the position
            if( type === this.model.get( 'type' ) ){
              this.moveControl();
            }
            else{
              this.model.set( 'type', type );
            }

          }
          else{
            this.drag = false;
          }
      }
    },

    handleOver: function( e ){
      Backbone.Mediator.publish( 'over', e );
    },

    handlePlayback: function( video, track, type ){
      if( !this.firstBuffer ){
        return;
      }
      if( type === 'pause' ){
        this.playback.classList.remove( 'play' );
        this.playback.classList.add( 'pause' );
      }
      else{
        this.playback.classList.remove( 'pause' );
        this.playback.classList.add( 'play' );
      }

      if( this.hush ){
        var cancel;
        if( this.hush === 'pause' && type === 'pause' || this.hush === 'play' && type !== 'pause' ){
          cancel = true;
        }
        this.hush = false;
        if( cancel ){
          return;
        }
      }

      this.handleProgressBar( video, track, type );
    },

    handleProgressBar: function( video, track, type ){
      var duration = ( track.duration - video.currentTime * 1000 );
      this.$progressBar.stop();

      if( video.currentTime === 0 ){
        this.resetProgressBar();
      }

      if( type !== 'pause' ){
        this.$progressBar
          .animate( duration, '=' )
            .stroke( {
              'dashoffset': 0
            } );
      }
    },

    handleVisibility: function( visible ){
      this.handleDisplay( !visible );
    },

    moveControl: function( model, type ){
      this.$playback.animate( {
        'top': this.getPosition()
      }, 250, $.proxy( function(){
        this.drag = false;
      }, this ) );
    },

    render: function(){

      this.progressBarWidth = Math.PI*52;

      var barAttributes = {
          'fill': 'none',
          'stroke-width': 4,
          'stroke': '#cacaca',
          'stroke-linecap': 'round',
          'stroke-dasharray': this.progressBarWidth,
          'stroke-dashoffset': this.progressBarWidth
        },
        barTransform = {
          rotation: this.revertedDash ? 0 : -90,
          cx: 28,
          cy: 28
        };

      this.el.innerHTML = this.template();
      this.$playback = this.$( '.playback' );
      this.playback = this.$playback[ 0 ];
      this.$progress = SVG( this.playback ).size( 56, 57 ).attr( 'id', 'controlProgress' );
      this.$bufferBar = this.$progress.circle( 52, 52 ).center( 28, 28 );
      this.$progressBar = this.$progress.circle( 52, 52 ).center( 28, 28 );

      barAttributes.id = 'progressBar';
      this.$progressBar
        .attr( barAttributes )
        .transform( barTransform );

      barAttributes.id = 'bufferBar';
      barAttributes[ 'stroke-opacity' ] = 0.3;
      this.$bufferBar
        .attr( barAttributes )
        .transform( barTransform );
    },

    resetProgressBar: function( track, e ){

      this.firstBuffer = false;

      if( e ){
        // store the event we dont want to listen one time
        //  so the animation is not stopped
        this.hush = 'pause';
        this.$progressBar
          .animate( 500, '=' )
            .stroke( {
              'dashoffset': this.progressBarWidth
            } );

        this.$bufferBar
          .animate( 500, '=' )
            .stroke( {
              'dashoffset': this.progressBarWidth
            } );
      }
      else{
        this.$progressBar.stroke( {
          'dashoffset': this.progressBarWidth
        } );

        this.$bufferBar.stroke( {
          'dashoffset': this.progressBarWidth
        } );
      }
    }

  } );

  return controlView;

} );
