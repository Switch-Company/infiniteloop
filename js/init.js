require.config({
  baseUrl: "/js",
  paths: {
    "text": "vendors/text"
  }
});


var App = {};

if( Modernizr.touch ){
  document.documentElement.style.height = window.innerHeight+'px';
}

require( [ 'vendors/fastclick', 'model/m-window' ], function( FastClick, Window ){
  $.browser = {
    'msie': false
  };

  FastClick.attach( document.body );

  Backbone.View.prototype.remove = function(){
    if( this.$el ){
      this.$el.remove();
    }
    this.stopListening();
    if(this.undelegateEvents){
      this.undelegateEvents();
    }
    return this;
  };

  App.root = new Window();

} );
