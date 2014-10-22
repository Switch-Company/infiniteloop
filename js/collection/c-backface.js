define( [ 'view/v-backface', 'model/m-thumb' ], function( View, Thumb ){
  'use strict';

  var backface = Backbone.Collection.extend( {
    model: Thumb,

    initialize: function(){
      this.view = new View( {
        'collection': this
      } );

      this.on( 'reset', this.ready );

    },

    ready: function(){
      this.view.ready();
    }
  } );

  return backface;
} );
