define( [ 'text!view/templates/t-trackInfos.html' ], function( Template ){
  'use strict';

  var trackInfoView = Backbone.View.extend( {

    attributes: {
      'class': 'infos'
    },

    subscriptions: {
      'drag:start': 'handleDisplay',
      'timeline:visible': 'handleInterface',
      'timeline:change': 'handleTrack'
    },

    template: _.template( Template ),

    initialize: function(){
      this.collection.parentEl.appendChild( this.el );

      this.el.innerHTML = this.template();
      // store the elements in order to update the text
      this.domInfos = [
        this.el.querySelector( '.ttl-track' ),
        this.el.querySelector( '.dsc-track' )
      ];
      // create a GSAP timelineLite
      this.setTimeline();

      this.timelineVisible = true;
    },

    afterRender: function(){
      // play the timeline ( fade in )
      this.tlInfos.play( 0 );
    },

    beforeRender: function( track ){
      this.track = track;

      // if animation is paused, play it ( fade out )
      if( this.tlInfos.paused() ){
        this.tlInfos.play( 1 );
        window.clearTimeout( this.mouseTimeout );
      }
      // else call render to update the text
      else{
        this.render();
      }
    },

    handleDisplay: function( reverse ){
      var opacity = 1;

      if( reverse ){
        opacity = 0;
      }


      if( Modernizr.touch ){
        this.el.style.display = opacity ? 'block' : 'none';
        window.requestAnimationFrame( $.proxy( function(){
          this.el.style.opacity = opacity;
        }, this ) );
      }
      else {
        this.$el.stop().animate( {
          'display': opacity ? 'block' : 'none',
          'opacity': opacity
        }, 500 );
      }
    },

    handleInterface: function( visible ){
      this.handleDisplay( !visible );
    },

    // 3 part title animation
    handleTrack: function( track ){
      this.hush = true;
      if( !this.track || this.track && track.id !== this.track.id ){
        // render the new infos
        this.beforeRender( track );
      }
    },

    render: function(){
      // ensure the timeline rewinded
      this.tlInfos.seek( 0 );
      // update the track infos
      this.domInfos[ 0 ].innerHTML = [ '<span>', this.track.title, '</span>'].join('');
      this.domInfos[ 1 ].innerHTML = this.track.description;

      this.afterRender();

    },

    setTimeline: function(){
        this.tlInfos = new window.TimelineLite({
          'paused': true
        });

        this.tlInfos
          // fade in
          .staggerFromTo( this.domInfos, 0.25, { 'opacity': 0, 'x': 75 }, { 'opacity': 1, 'x': 0 }, 0.05 )
          // pause
          .addPause( 1 )
          // fade out
          .staggerFromTo( this.domInfos, 0.25, { 'opacity': 1, 'x': 0 }, { 'opacity': 0, 'x': -75 }, 0.05 )
          // update the tack infos when elements have faded out
          .call( $.proxy( this.render, this ) );
    }

  } );

  return trackInfoView;

} );
