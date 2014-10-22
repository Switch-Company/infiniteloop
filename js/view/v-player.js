  define( function(){
  'use strict';

  var playerView = Backbone.View.extend( {

    attributes: function(){
      var attrs = {
        'id': 'player',
        'preload': 'auto'
      };

      if( this.model.get( 'muted' ) ){
        attrs.muted = true;
      }

      return attrs;
    },

    events: {
      'canplaythrough': 'handleVideo',
      'ended': 'handleVideo',
      'emptied': 'handleVideo',
      'loadedmetadata': 'handleVideo',
      'pause': 'handleVideo',
      'play': 'handleVideo',
      'playing': 'handleVideo',
      'progress': 'handleVideo',
      'seeked': 'handleVideo',
      'seeking': 'handleVideo',
      'stalled': 'handleVideo',
      'suspend': 'handleVideo',
      'timeupdate': 'handleVideo'
    },

    subscriptions: {
      'drag:move': 'pause',
      'fullscreen': 'setPosition',
      'resize': 'setPosition',
      //'keyboard': 'handleKeyboard',
      'player:play': 'playTrack',
      'player:playback': 'playpause',
      'player:quality': 'setQuality',
      'sound': 'setSound',
      'volume': 'setVolume'
    },

    tagName: 'video',

    initialize: function(){

      var volume = +window.localStorage.getItem( 'volume' ) || 100,
          video = this.model.get( 'preload' );

      this.el.volume = volume / 100;
      this.getType();

      this.listenTo( this.model, 'change:quality', this.handleQuality );

      if( video ){
        this.el.setAttribute( 'src', [ video, this.model.get( 'type' ) ].join('.') );
      }
    },

    fakeCanplay: function(){
      this.waiting = false;
      this.handleVideo( {
        type: 'playing'
      } );
    },

    fakeWaiting: function(){
      this.waiting = true;
      this.handleVideo( {
        type: 'pause'
      } );
    },

    // define the video extension
    getType: function(){
      var type = 'webm';

      if( this.el.canPlayType( 'video/mp4' ).length ){
        type = 'mp4';
      }

      this.model.set( 'type', type );
    },

    handleControls: function( hide ){
      window.clearTimeout( this.controlTimeout );

      var delay = hide ? 1000 : 50;

      if( hide ){
        // display the video when there's something to show
        this.el.style.visibility = 'visible';
      }

      this.controlTimeout = window.setTimeout( function(){
        //console.log( 'show', !!hide );
        Backbone.Mediator.publish( 'showInterface', hide );
      }, delay );

    },

    handleQuality: function( model, quality ){
      var currentTrack = this.model.get( 'track' ),
          type = this.model.get( 'type' ),
          isPaused = this.el.paused;

      if( !this.el.src.length || this.silent ){
        return;
      }

      this.currentTime = this.el.currentTime;

      this.el.pause();
      this.el.setAttribute( 'src', [ currentTrack.video.replace( '{q}', quality ) , type ].join('.') );
      this.el.load();

      if( isPaused ){
        return;
      }

      Backbone.Mediator.subscribeOnce( 'video:loadedmetadata', $.proxy( function(){
        this.el.currentTime = this.currentTime;
        this.el.play();
      }, this ) );
    },

    handleKeyboard: function( e ){
      // playpause on spacebar
      if( e.keyCode === 32 ){
        this.playpause();
      }
    },

    handleVideo: function( e ){

      var _this = this;
      /*if( e.type === 'waiting' ){
        e.type = 'pause';
      }*/

      switch( e.type ){
        case 'loadedmetadata':
          this.loadedmetadata = true;
          break;
        case 'ended':
          // cancel the pause event fired at the end of a video
          window.clearTimeout( this.eventTimeout );
          /* falls through */
        case 'emptied':
          this.loadedmetadata = false;
          break;
        case 'pause':
          window.clearTimeout( this.timeUpdate );
          break;
        case 'progress':
          // dont publish progress events until the metadata are loaded
          if( !this.loadedmetadata ){
            return;
          }
          break;
        case 'timeupdate':
          window.clearTimeout( this.timeUpdate );
          if( this.waiting ){
            this.fakeCanplay();
          }
          //this.waiting = false;
          this.timeUpdate = window.setTimeout( $.proxy( this.fakeWaiting, this ), 600 );
          break;
      }

      this.eventTimeout = window.setTimeout( function(){
        _this.publishEvent( e );
      }, 0 );
    },

    pause: function(){

      // pause the video
      this.el.pause();

      // hide the video
      this.el.style.visibility = 'hidden';
    },

    // allow to play or pause the current video
    //  @method : force the state of the video (play || pause)
    //  if no @method is provided the function will toggle
    //  the current state of the video
    playpause: function( method ){

      if( !this.model.get( 'track' ) && !method ){
        Backbone.Mediator.publish( 'video:noTrack' );
        return;
      }

      if( _.isString( method ) ){
        this.el[ method ]();
        return;
      }

      if(this.el.paused){
        this.el.play();
      }else{
        this.el.pause();
      }
    },

    playTrack: function( track ){
      var currentTrack = this.model.get( 'track' ),
          quality = this.model.get( 'quality' ),
          type = this.model.get( 'type' );

      // if the next track to play is the same as the previous one
      //  only move to the start of the track
      if( currentTrack && track.id === currentTrack.id ){
        this.el.currentTime = 0;
        this.el.play();
        return;
      }

      if( track.silent ){
        this.silent = true;
      }
      else {
        this.silent = false;
      }

      this.model.set( 'track', track );
      this.el.setAttribute( 'src', [ track.video.replace( '{q}', quality ), type ].join('.') );

      if( track.loop ){
        this.el.setAttribute( 'loop', true );
      }
      else {
        this.el.removeAttribute( 'loop' );
      }

      this.loadedmetadata = false;

      // hide the video while changing source
      this.el.style.visibility = 'hidden';
      this.el.load();
      this.el.play();
    },

    publishEvent: function( e ){

      if( e.type === 'playing' ){
        this.handleControls( true );
      }
      else if( e.type === 'pause' ){
        this.handleControls();
      }

      // dont publish anything ( e.g. pedagogy )
      if( this.silent ){
        return;
      }

      Backbone.Mediator.publish( [ 'video', e.type ].join(':'), this.el, this.model.get( 'track' ), e.type );
    },

    ready: function(){
      this.playerReady = true;
      this.$container = this.$el.parent();
      this.setPosition( !!document.fullscreenEl(), document.body.clientWidth );
    },

    setPosition: function( isFullScreen, width ){
      if( !this.playerReady ){
        return;
      }
      var newRatio = {},
          height = this.$container.height(),
          left,
          top,
          videoRatio = 720 / 1280;

      newRatio.x = width;
      newRatio.y = width * videoRatio;

      if( newRatio.y < height ){
        newRatio.y = height;
      }

      left = 0;
      top = ( ( newRatio.y - height ) / 2 ) * -1;

      this.$el.css( {
        width: newRatio.x,
        height: newRatio.y,
        left: left,
        top: top
      } );
    },

    setQuality: function( quality ){
      this.model.set( 'quality', quality );
    },

    setSound: function( muted ){
      this.el.muted = muted;
      if( muted ){
        this.el.setAttribute( 'muted', muted );
      }
      else{
        this.el.removeAttribute( 'muted' );
      }
      this.model.set( 'muted', muted );
    },

    setVolume: function( volume ){
      this.el.volume = volume / 100;
    }

  } );

  return playerView;

} );
