/*global module:false */
var path = require( 'path' );

var rest = function( req, res, next ){
  if(req.url !== '/' && path.extname(req.url) === '' && req.url.lastIndexOf( '/' ) !== req.url.length - 1 ){
    if(req.headers[ 'x-requested-with' ] === 'XMLHttpRequest' ){
      req.url = [ req.url, 'json'].join( '.' );
    }
    else{
      req.url = '/index.html';
    }
  }
  next();
};

var middlewares = function( connect, options ){
  return [
    connect.bodyParser( options.base ),
    rest,
    connect.compress( options.base ),
    connect.static( options.base ),
    connect.directory( options.base )
  ];
};

module.exports = function( grunt ){
  return {
    server: {
      options: {
        port: 3000,
        base: '<%= build %>',
        keepalive: true,
        hostname: '*',
        middleware: middlewares
      }
    }
  };
};
