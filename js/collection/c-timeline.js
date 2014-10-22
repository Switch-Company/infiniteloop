define( [ 'view/v-swap', 'view/v-timeline', 'model/m-track', 'model/m-control', 'view/v-trackInfos', 'vendors/svg' ], function( Swap, View, Track, Control, Infos, SVG ){
  'use strict';

  var timeline = Backbone.Collection.extend( {

    model: Track,

    initialize: function( tracks, options ){

      this.on( 'change:textPos', this.storeWords );

      this.root = options.root;

      this.parentEl = document.getElementById( 'wheel' );

      // sort event happen when the collection is loaded
      this.once( 'sort', this.ready );

      this.backgrounds = new Swap( {
        'collection': this
      } );

      this.control = new Control( {
        'collection': this,
        'root': this.root
      } );

      this.view = new View( {
        'collection': this,
        // add 2 more px for the pointers border
        'el': SVG( 'wheel' ).attr( 'id', 'wheelWrapper' ).node
      } );

      this.infos = new Infos( {
        'collection': this
      } );

      this.listenTo( this.control, 'change:type', this.setPlayableTracks );
    },

    // filter the track playble based on the control's type selection
    setPlayableTracks: function( model, type ){
      var track,
          start;

      this.tracks = this.filter( function( track ){
        return type ? track.get( 'type' ) === type || type === 'outer' && track.get( 'type' ) === 'center' : true;
      } );

      // change track if not in filtered array
      if( this.currentTrack && this.tracks.indexOf( this.currentTrack ) === -1 ){
        start = this.currentTrack.get( 'start' );

        // find a track whose start is higher than the currentTrack
        track = _.find( this.tracks, function( track ){
          return track.get( 'start' ) >= start;
        } );

        if( !track ){
          track = this.tracks[ 0 ];
        }

      }

      // if there's no track higher than the current or no current then use the first in the array
      if( !track && !this.currentTrack ){
        track = this.tracks[ 0 ];
      }

      if( track ){
        // move to the track by simulating a click on it
        track.view.$el.trigger( 'click' );
      }

    },

    ready: function(){

      this.parentEl.insertBefore( this.backgrounds.el, this.parentEl.firstChild );

      // resort the collection in the playing order
      this.comparator = 'id';
      this.sort();

      this.tracks = this.models;

      this.view.ready();
    },

    storeCurrentTrack: function( model ){
      this.currentTrack = model;
    },

    storeWords: function( model, pos ){
      if( !this.words ){
        this.words = [];
      }
      var degToTimeline = ( ( 360 - pos ) + 360 ) % 360;

      this.words.push( {
        pos: degToTimeline,
        model: model
      } );
    }

  } );

  return timeline;

} );
