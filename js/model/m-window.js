define( [ 'router', 'view/v-window', 'view/v-footer', 'model/m-player', 'collection/c-timeline' ], function( Router, View, Footer, Player, Timeline ) {
  "use strict";

    var app = Backbone.Model.extend( {

      defaults: function(){

        var getQuality = function(){
          // return the saved quality
          var qlt = window.localStorage.getItem( 'quality' );
          // set the quality on first visit
          if( !qlt ){
            qlt = document.body.clientWidth > 1024 ? 'md' : 'sd';
          }

          return qlt;
        };

        return {
          'colors': {
            'outer': '#fff700',
            'center': '#fff700',
            'inner': '#111111'
          },
          'quality': getQuality()
        };
      },

      url: '/config.json',

      initialize: function(){
        // bind the view to the body
        this.view = new View( {
          'model': this
        } );
        // bind the footer
        this.footer = new Footer( {
          'model': this
        } );

        // start the router
        this.router = new Router( {
          'model': this
        } );

        // listen to the config fetch and the ready to start the router
        this.once( 'sync', this.ready );
        this.once( 'ready', this.ready );

        // fetch the config file
        this.fetch();
      },

      open: function( type, subcat, content, more ){

        if( 'wheel' !== type && document.getElementById( type ) ){
            this.showText( type, subcat, content, more );
            type = false;
        }
        else{
            this.showPlayer( subcat, content, more );
            type = 'wheel';
        }

        if( type ){
          this.currentType = type;
          this.view.el.className = type;
        }
      },

      parse: function( response ){
        var sum = 0,
            numbering,
            quality = this.get( 'quality' ),
            colors = response.colors || this.get( 'colors' ),
            length = response.tracks.length - 1;

        // reverse order
        response.tracks.reverse();

        // compute the total duration
        if( !response.duration ){
          response.duration = 0;
          _.each( response.tracks, function( track ){
            response.duration += track.duration;
          } );
        }

        // update each tracks
        _.each( response.tracks, function( track ){
          // convert "1" to "01"
          numbering = track.id < 10 ? [ 0, track.id ].join('') : track.id ;
          // build the video path
          track.video = [ response.cdn, 'wheel', '{q}', ( track.name || numbering ) ].join('/');

          track.color = colors[ track.type ];
          track.radius = 250;
          track.angle = 360 / response.duration * sum;
          track.width = 360 / response.duration * track.duration;
          track.totalDuration = response.duration;
          sum += track.duration;
          if( sum === 360 ){
            sum = 0;
          }
        } );

        // store the start angle base upon the group rotation
        //  e.g. how many ° is needed to rotate the global group
        //  in order to have the desired track at the bottom of the timeline
        sum = 0;
        for(; length >= 0; length-- ){
          response.tracks[ length ].start = sum;
          sum += response.tracks[ length ].width;
          response.tracks[ length ].end = sum;
        }

        // update backface video items
        _.each( response.backface, function( backface ){
          if( backface.type !== 'video' ){
            return;
          }
          // convert "1" to "01"
          numbering = backface.id < 10 ? [ 0, backface.id ].join('') : backface.id ;
          // build the video path
          backface.src = [ response.cdn, 'backface', quality, numbering ].join('/');
        } );

        return response;
      },

      ready: function( model, datas ){
        if( datas ){
          this.synced = true;
          this.startPlayer();
        }
        else {
          this.loaded = true;
        }

        if( this.synced && this.loaded ){
          this.router.start();
        }
      },

      startPlayer: function(){
        this.player = new Player( {
          'root': this,
          'quality': this.get( 'quality' )
        } );

        this.$wheel = this.view.$( '#wheel' );
        this.$wheel.append( this.player.view.el );
      },

      showPlayer: function(){
        if( !this.timeline ){

          this.$wheel.show();

          this.player.ready();

          this.timeline = new Timeline( [], {
            root: this
          } );

          this.timeline.set( this.get( 'tracks' ), {reset: true} );
        }
        else{
          this.timeline.trigger( 'show' );
        }

      },

      showText: function( type ){
        this.view.openLayer( type );
      }

    } );

    return app;
} );
