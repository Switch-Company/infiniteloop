define( [ 'view/v-control' ], function( View ){
  'use strict';

  var control = Backbone.Model.extend( {
    defaults: {
      'paused': true,
      // type of video filtered: outer|inner
      'type': false
    },

    initialize: function( options ){

      this.collection = options.collection;

      this.view = new View( {
        'model': this
      } );
    }

  } );

  return control;

} );
