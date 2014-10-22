define( function(){
  "use strict";

  var trackView = Backbone.View.extend( {

    events: {
      'click': 'select'
    },

    subscriptions: {
      'timeline:change': 'handleCurrent'
    },

    initialize: function(){

      // need to reset the svg node as the view element
      this.setElement( this.el );
      // store the SVGjs reference for ease of use
      this.$svg = this.el.instance;

      this.render();

      this.listenTo( this.model, 'change:selected', this.handleSelection );

    },

    arc: function(){
      var arc,
          params = this.model.toJSON(),
          a = ( 90 - params.width ) * Math.PI / 180,
          x = params.radius + params.radius * Math.cos( a ),
          y = params.radius - params.radius * Math.sin( a );


      if( params.totalDuration === params.duration ) {
          arc = 'M' + params.radius + ',0A' + params.radius + ',' + params.radius + ' 0, 1, 1, ' + params.radius - 0.001 + ',0';
      }
      else{
          arc = 'M' + params.radius + ',0A' + params.radius + ',' + params.radius +' 0 '+ ( +( params.width > 180 ) ) +',1'+ x +','+ y;
      }

      return arc;
    },
    // handle the 'current' attribute of the track
    //  depending on the current track playing
    handleCurrent: function( track ){

      if( track.id !== this.model.id ){
        this.model.set( 'current', false );
      }
    },

    handleSelection: function( model, selected ){
      var width;
      if( selected && !model.previous( 'selected' ) ){
        width = 60;
      }
      else if( !selected && model.previous( 'selected' ) ){
        width = 30;
      }

      if( width ){
        this.$svg.animate( 250, '>' )
          .stroke( {
            'width': width
          } );
      }
    },

    render: function(){

      var attributes = {
        'd': this.arc(),
        'stroke': this.model.get( 'color' ),
        'stroke-width': 30,
        'fill': 'none'
      };

      if( this.model.get( 'type' ) === 'center' ){
        attributes[ 'stroke-dasharray' ] = 2;
      }

      this.$svg.attr( attributes );

      this.rotate();
    },

    rotate: function(){
      var radius = this.model.get( 'radius' );
      // add 180° to start at the bottom of the timeline
      this.$svg.rotate( this.model.get( 'angle' ) + 180 , radius, radius );
    },

    select: function( e ){
      if( e ){
        e.stopPropagation();
      }

      Backbone.Mediator.publish( "track:selected", this.model, e );
    }

  } );

  return trackView;

} );
