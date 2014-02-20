define( [ 'text!view/templates/t-volume.html' ], function( Volume ){
  var footer = Backbone.View.extend( {
    el: '#footer',

    events: {
      'click .size': 'handleFullscreen',
      'click .muter': 'soundManager',
      'click .quality button': 'handleQuality',
      'click .volumeTrack': 'skipVolume',
      'keydown  .volume': 'handleKeyboard',
      'touchstart .volume': 'handleDrag',
      'touchmove': 'handleDrag',
      'touchcancel': 'handleDrag',
      'touchend': 'handleDrag',
      'mousedown .volume': 'handleDrag',
      'mousemove': 'handleDrag',
      'mouseleave': 'handleDrag',
      'mouseup': 'handleDrag',
      'mouseenter .sound': 'handleOver',
      'mouseleave .sound': 'handleOver'
    },

    subscriptions: {
      'timeline:visible': 'handleVisibility',
    },

    template: _.template( Volume ),

    initialize: function(){
      this.sound = this.el.querySelector( '.sound' );
      this.size = this.el.querySelector( '.size' );

      this.muted = JSON.parse( window.localStorage.getItem( 'muted' ) );
      this.volume = +window.localStorage.getItem( 'volume' ) || 100;

      this.handleSound();

      this.sliderSound();


      this.toggle = this.el.querySelector( '.toggle' );

      this.quality = this.el.querySelector( '.quality' );
      this.listenTo( this.model, 'change:quality', this.setQuality );
      this.setQuality( this.model, this.model.get( 'quality' ) );

    },

    displayFooter: function(){
      this.handleDisplay();
    },

    handleDisplay: function( reverse ){

      if( reverse && reverse.type === 'mouseenter'){
        Backbone.Mediator.publish( 'over', reverse );
      }

      var opacity = 1;

      if( reverse ){
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

      e.preventDefault();

      switch( e.type ){
        case 'mousedown':
        case 'touchstart':
          this.sliderHeight = this.$track.height();
          this.drag = {
            'start': ( e.targetTouches ? e.targetTouches[ 0 ].pageY : e.pageY ) + parseInt( this.$slider.css( 'bottom' ), 10 )
          };

          break;
        case 'mousemove':
        case 'touchmove':
          window.clearTimeout( window.mouseTimeout );
          if( !this.drag ){
            return;
          }

          var y = e.targetTouches ? e.targetTouches[ 0 ].pageY : e.pageY,
              height =  this.drag.start - y,
              delta;

            if( height < 0 ){
              height = 0;
            }
            else if( height > this.sliderHeight ){
              height = 60;
            }

            delta = height * 100 / this.sliderHeight;

            if( this.drag.last && delta === this.drag.last ){
              return;
            }

            this.drag.last = delta;

            this.volumeManager( delta );

          break;
        default:
          Backbone.Mediator.publish( 'over', e );
          if( !this.drag ){
            return;
          }

          this.drag = false;

          // send one last time the current volume
          this.volumeManager( this.volume );
      }
    },

    handleFullscreen: function(){
      if( document.fullscreenEl() ){
        document.exitFullscreen();
      }
      else{
        document.documentElement.requestFullscreen();
      }
    },

    handleKeyboard: function( e ){
      var volume;
      this.sliderHeight = this.$track.height();

      switch( e.keyCode ){
        // up
        case 38:
          volume = 1;
          break;
        // page up
        case 33:
          volume = 10;
          break;
        // down
        case 40:
          volume = -1;
          break;
        // page down
        case 34:
          volume = -10;
          break;
      }

      if( volume ){
        volume = this.volume + volume;

        if( volume > 100 ){
          volume = 100;
        }
        else if( volume < 0 ){
          volume = 0;
        }

        this.volumeManager( volume );
      }

    },

    handleOver: function( e ){
      this.sound.classList.toggle( 'show', e.type === 'mouseenter' );
    },

    handleQuality: function( e ){
      var qlt = e.currentTarget.innerHTML;
      Backbone.Mediator.publish( 'player:quality', qlt );
      this.model.set( 'quality', qlt );
    },

    handleSound: function(){
      this.sound.classList.toggle( 'muted', this.muted );
    },

    handleTrack: function(){
      this.hush = true;
    },

    handleVisibility: function( visible ){
      this.handleDisplay( !visible );
    },

    hideFooter: function(){
      this.handleDisplay( true );
    },

    setQuality: function( model, qlt ){
      if( this.currentQualityBtn ){
        this.currentQualityBtn.classList.remove( 'current' );
        window.localStorage.setItem( 'quality', qlt );
      }
      this.currentQualityBtn = this.quality.querySelector( [ '.', qlt ].join('') );

      this.currentQualityBtn.classList.add( 'current' );
    },

    skipVolume: function( e ){
      this.volumeManager( ( this.sliderHeight - ( e.pageY - this.$track.offset().top ) ) *100 / this.sliderHeight );
    },

    sliderSound: function(){
      $(this.sound).append( this.template( { 'volume': this.volume } ) );
      this.slider = this.sound.querySelector( '.volume' );
      this.shadow = this.slider.querySelector( '.shadow' );
      this.$slider = $( this.slider );
      this.$track = this.$( '.volumeTrack' );

      this.updateSlider();
    },

    soundManager: function( status ){
      this.muted = window.localStorage.muted = typeof status !== 'undefined' && !status.type ? status : !JSON.parse( window.localStorage.getItem( 'muted' ) );
      Backbone.Mediator.publish( 'sound', this.muted );
      this.handleSound();
    },

    volumeManager: function( volume ){

      if( !volume && !this.muted ){
        this.soundManager( true );
      }
      else if( volume && this.muted ){
        this.soundManager( false );
      }

      this.volume = volume;

      Backbone.Mediator.publish( 'volume', this.volume );

      if( !this.drag ){
        window.localStorage.setItem( 'volume', this.volume );
      }
      this.updateSlider();
    },

    updateSlider: function(){

      this.sliderHeight = this.$track.height();

      this.slider.setAttribute( 'aria-valuenow', this.volume );

      var volume = [ this.volume, '%'].join('');

      this.slider.setAttribute( 'aria-valuetext', volume );
      this.slider.style.bottom = volume;
      this.shadow.style.height = [ ( this.volume * this.sliderHeight / 100 ), 'px'].join('');
    }
  } );

  return footer;
} );
