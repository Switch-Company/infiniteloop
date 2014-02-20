define( [ 'view/v-track', 'view/v-word' ], function( View, Word ){
  'use strict';

  var track = Backbone.Model.extend( {

    defaults: {
      'current': false,
      'selected': false
    },

    initialize: function(){
      // get the group where the track is supposed to be stored
      var group = this.collection.view.groups[ this.get( 'type' ) ];

      // save it
      this.set( 'group', group );

      // event dont bubble to the collection
      this.on( 'change:textPos', function( model, pos){
        this.collection.trigger( 'change:textPos', model, pos );
      } );

      this.view = new View( {
        'model': this,
        'el': group.path().attr( 'id', [ 'track', this.id ].join('') ).node
      } );

      if( this.has( 'word' ) ){
        this.word = new Word( {
          'model': this,
          'el': group.text( this.get( 'word' ) ).attr( {
            'id': [ 'word', this.id ].join(''),
            'opacity': 0
          } ).node
        } );
        this.listenTo( this.collection, 'ready', $.proxy( this.word.clean, this.word ) );
      }
      this.listenTo( this.collection.control, 'change:type', this.handleType );
    },

    handleType: function( model, type ){
      var modelType = this.get( 'type' );
      if( type === modelType || type === 'outer' && modelType === 'center' ){
        this.set( 'selected', true );
      }
      else{
        this.set( 'selected', false );
      }
    },

    play: function(){
      this.view.select();
    }
  } );

  return track;

} );
