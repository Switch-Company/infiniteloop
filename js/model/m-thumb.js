define( [ 'view/v-thumb' ], function( View ){
  'use strict';

  var thumb = Backbone.Model.extend( {

    initialize: function() {
      this.view = new View({
        model: this
      });

    }

  } );

  return thumb;

} );
