define( [ 'view/v-player' ], function( View ){
  'use strict';

  var player = Backbone.Model.extend( {

    defaults: function(){
      return {
        'muted': JSON.parse( window.localStorage.getItem( 'muted' ) ),
        'track': false,
        'type': false,
      };

    },

    initialize: function(){
      this.view = new View( {
        'model': this
      } );
    },

    ready: function(){
      this.view.ready();
    }

  } );

  return player;
});
