define( function(){
  "use strict";

  var wordView = Backbone.View.extend( {

    initialize: function(){

      // need to reset the svg node as the view element
      this.setElement( this.el );
      // store the SVGjs reference for ease of use
      this.$svg = this.el.instance;

      this.render();

      this.listenTo( this.model, 'show:word', this.handleWord );

    },

    clean: function(){
      this.$svg.remove();
      this.remove();
    },

    handleWord: function(){
      this.$svg
        .animate( 850, '=' )
          .opacity( 1 )
            .after( $.proxy( function(){
              this.$svg
                .animate( 850, '=' )
                  .opacity( 0 );
            }, this ) );
    },

    render: function(){
      this.$tspan = this.el.querySelector( 'tspan' ).instance;

      var radius = this.model.get( 'radius' ),
          center = ( this.model.get( 'end' ) - this.model.get( 'start' ) ) / 2,
          textPos = this.model.get( 'angle' ) + center + 90;

      this.model.set( 'textPos', textPos );

      // text positioning
      this.$svg
        .transform( {
          rotation: textPos,
          cx: radius,
          cy: radius,
          x: ( radius * 2 ) + 25,
          y: radius - 20
        } );
    }

  } );

  return wordView;

} );
