define(
  function(
  ) {
    'use strict';

      return Backbone.Router.extend({
        routes: {
          ':type(/:subcat)(/:content)(/:more)': 'page',
          '': 'page'
        },

        initialize: function(options){

          this.on('route', this.publishRoute, this);
          this.options = {
            'pages': {}
          };

          this.model = options.model;

        },

        page: function(type, subcat, content, more) {
          type = this.options.pages[type] || 'wheel';
          this.model.set( 'wantedPage', type );

          Backbone.Mediator.publish('page', type, subcat, content, more );
        },

        publishRoute: function( method, parameters ){
          // tracking
        },

        start: function(){

          // create the l10n version of the routes
          _.each( this.model.get( 'pages' ), function( value, key ){
            //this.route( [ value, '(/:subcat)(/:content)' ].join('), key);
            this.options.pages[ value ] = key;
          }, this );

          // store the first page where the user land in order to display an opening animation or not
          this.model.set( 'firstPage', this.options.pages[ window.location.hash.replace( '#', '' ) || 'wheel' ] );

          Backbone.history.start({
            'pushState': false,
            'root': '/'
          });
        }
      });
  }
);
