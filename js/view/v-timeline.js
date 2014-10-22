define( function(){
  'use strict';

  var timelineView = Backbone.View.extend( {

    events: {
      'click': 'playpause',
      'click #global': 'handleDrag',
      'mousedown #global': 'handleDrag',
      'mouseenter #global': 'handleOver',
      'mouseleave #global': 'handleOver',
      'mousemove': 'publishMove',
      'mouseup #global': 'handleDrag',
      'touchstart #global': 'handleDrag'
    },

    positions: {
      'outer': {
        'scaleX': 470/500,
        'scaleY': 470/500,
        'x': 50,
        'y': 50
      },
      'center': {
        'scaleX': 490/500,
        'scaleY': 490/500,
        'x': 40,
        'y': 40
      },
      'inner': {
        'scaleX': 510/500,
        'scaleY': 510/500,
        'x': 30,
        'y': 30
      },
      'flat': {
        'scaleX': 1,
        'scaleY': 1,
        'x': 35,
        'y': 35
      }
    },

    subscriptions: {
      'drag:move': 'rotateTimeline',
      'move': 'handleMousemove',
      'over': 'handleOver',
      'page': 'handleDisplay',
      'resize': 'position',
      'showInterface': 'handleInterface',
      'track:selected': 'moveToTrack',
      'video:noTrack': 'handleDefaultTrack',
      'video:playing': 'handlePlayback',
      'video:pause': 'handlePlayback',
      'video:seeked': 'handlePlayback',
      'video:ended': 'handleTrack',

      'wheel:group': 'fadeGroups',
      'wheel:ready': 'ready'
    },

    initialize: function(){

      // need to reset the svg node as the view element
      this.setElement( this.el );
      // store the SVGjs reference for ease of use
      this.$svg = this.el.instance;

      // definitions
      this.$defs = this.$svg.defs().attr( 'id', 'defs' );

      // main group
      this.$baseGroup = this.$svg.group().attr( 'id', 'global' );

      // DEBUG
      this.$baseGroup.circle( 560 ).center( 285, 285 ).attr( 'fill-opacity', '0' );

      // groups
      this.groups = {
        'outer': this.$baseGroup.group().attr( { 'id': 'outer', 'opacity': 0 } ).move( 35, 35 ) ,
        'center': this.$baseGroup.group().attr( { 'id': 'center', 'opacity': 0 } ).move( 35, 35 ) ,
        'inner': this.$baseGroup.group().attr( { 'id': 'inner', 'opacity': 0 } ).move( 35, 35 )
      };

      // create pointer
      this.pointers();

      // center the wheel
      this.position();

      // listen to the mouse/touch on the document for the drag
      $( document ).on( 'mousemove.timeline touchmove.timeline mouseup.timeline touchend.timeline', $.proxy( this.handleDrag, this ) );

      // listen to the change of playback track outer||inner
      this.listenTo( this.collection.control, 'change:type', this.selectGroup );

      this.listenTo( this.collection, 'show', this.show );

      // listen for the first drag:end publication in order to display the controls
      Backbone.Mediator.subscribeOnce( 'drag:end', this.firstInteraction, this );
      Backbone.Mediator.subscribeOnce( 'video:play', this.firstInteraction, this );

      this.ready();
    },

    animate: function( duration, track ){

      // store current rotation to reapply
      //  before starting the animation
      //  ( bug when playing the first track )
      var currentRotation = this.$baseGroup.stop().transform().rotation,
          rotation = track.end;

      if( track.start === 0 ){
        this.$baseGroup
          .stop()
          .transform( {
            rotation: 0
          } );
      }

      this.$baseGroup
        .stop()
        .transform( {
          rotation: currentRotation
        } )
        .animate( duration, '=' )
          .transform( {
            rotation: rotation
          } );
    },

    displayTimeline: function(){
      if( !this.timelineReady ){
        return;
      }

      if( Modernizr.touch ){
        this.el.style.opacity = 1;
      }
      else {
        this.$svg
          .animate( 500, '=' )
            .opacity( 1 );
      }
      Backbone.Mediator.publish( 'timeline:visible', true );
    },

    fadeGroups: function( end ){
      if( end ){
        this.fadedOuter = true;
        this.fadeInner = true;
      }
      if( !this.fadedOuter ){
        this.fadedOuter = true;
        this.groups.outer
          .animate( 500, '>' )
            .opacity( 0.9 );

        this.groups.center
          .animate( 500, '>' )
            .opacity( 0.9 );

        this.groups.inner
          .animate( 500, '>' )
            .opacity( 0.1 );
      }
      else if( !this.fadeInner ) {
        this.fadeInner = true;
        this.groups.outer
          .animate( 500, '>' )
            .opacity( 0.1 );

        this.groups.center
          .animate( 500, '>' )
            .opacity( 0.1 );

        this.groups.inner
          .animate( 500, '>' )
            .opacity( 0.9 );
      }
      else {
        _.each( this.groups, function( group ){
          group
            .animate( 500, '>' )
              .opacity( 0.9 );
        } );
      }
    },

    findTrack: function(){
      if( this.draggedTrack ){
        this.moveToTrack( this.draggedTrack, 'drag' );
      }

    },

    firstInteraction: function(){
      this.interacted = true;
      Backbone.Mediator.unsubscribe( 'drag:move', this.firstInteraction );
      Backbone.Mediator.unsubscribe( 'video:play', this.firstInteraction );

      // insert the controls
      this.collection.control.view.append();
    },

    handleDefaultTrack: function(){
      var track = this.collection.tracks[ 0 ];
      track.play();
    },

    handleDisplay: function( type ){

      if( type === 'wheel' ){
        this.currentView = true;

        if( this.timelineReady ){
          // svgjs bug, opacity is not applied if parent is hidden
          this.$basePointer
            .animate( 250, '>' )
              .opacity( 1 );
        }
      }
    },

    handleDrag: function( e ){
      // dont listen to drag if the pedagogy is not ended
      if( !this.timelineReady || this.moving ){
        return;
      }

      if( e.originalEvent) {
        e = e.originalEvent;
      }
      e.preventDefault();
      switch( e.type ){
        case 'mousedown':
        case 'touchstart':
          var offset = this.$baseGroup.transform();

          this.drag = {
            'center': {
              'x': offset.cx,
              'y': offset.cy
            }
          };

          this.scaleGroup( true );

          Backbone.Mediator.publish( 'drag:start' );

          break;
        case 'mousemove':
        case 'touchmove':

          if( !this.drag ){
            return;
          }

          var x = e.targetTouches ? e.targetTouches[ 0 ].pageX : e.pageX,
              y = e.targetTouches ? e.targetTouches[ 0 ].pageY : e.pageY,
              deg = Math.atan2( this.drag.center.y - y, this.drag.center.x - x) * ( 180 / Math.PI );


              if( !this.drag.base ){
                this.drag.base = Math.round( this.$baseGroup.transform().rotation );
              }
              if( !this.drag.start ){
                this.drag.start = deg;
              }
              deg = Math.floor( deg - this.drag.start ) + this.drag.base;

              if( deg < 0 ){
                deg = 360 + deg;
              }

              // ensure to be under 360°
              deg = deg % 360;

              if( this.drag.last && deg !== this.drag.last || !this.drag.last ){
                this.drag.last = deg;
                Backbone.Mediator.publish( 'drag:move', deg );
              }

          break;
        default:
          if( this.drag && this.drag.last ){
            var rotation = this.drag.last;
            Backbone.Mediator.publish( 'drag:end' );
            this.findTrack( rotation );
          }
          this.drag = false;
          this.scaleGroup();
      }
    },

    handleInterface: function( hide ){
      if( hide && !this.timelineVisible ){
        this.hideTimeline();
      }
      else {
        this.displayTimeline();
      }
    },

    handleMousemove: function(){

      if( !this.interacted ){
        return;
      }

      // allow to enable the fadein/out of the interface at touch
      if( Modernizr.touch ){
        this.touched = !this.touched;
      }

      this.collection.parentEl.classList.remove( 'hidden' );
      if( !this.displaying ){
        this.displaying = true;
        this.displayTimeline();
      }
      window.clearTimeout( window.mouseTimeout );

      if( this.timelineVisible || this.touched ){
        return;
      }

      window.mouseTimeout = window.setTimeout( $.proxy( this.hideTimeline , this ), Modernizr.touch ? 0 : 1000 );
    },

    handleOver: function( e ){

      if( !this.interacted ){
        return;
      }

      if( !e || e.type === 'mouseenter' ){
        if( !this.timelineVisible ){
          this.displayTimeline();
        }
        this.timelineVisible = true;
      }
      else if( this.playing ){
        this.timelineVisible = false;
      }

    },

    handlePlayback: function( video, track, type ){

      // force to false so the wheel can be interacted
      this.moving = false;

      // store timeline duration
      if( !this.duration ){
        this.duration = track.totalDuration;
      }
      if( this.hush ){
        var cancel;
        if( this.hush === 'pause' && type === 'pause' || this.hush === 'play' && type !== 'pause' ){
          cancel = true;
        }
        this.hush = false;
        if( cancel ){
          return;
        }
      }

      // stop animation if video is paused
      if( type === 'pause' ){
        this.playing = false;
        this.timelineVisible = true;
        this.$baseGroup.stop();
      }
      else{
        this.playing = true;
        this.timelineVisible = false;
        this.animate( ( track.duration - video.currentTime * 1000 ), track );
      }
    },

    handleTrack: function( video, currentTrack ){
      var index = this.collection.tracks.indexOf( this.collection.get( currentTrack.id ) ),
          nextTrack = this.collection.tracks[ index + 1 ];

      if( !nextTrack ){
        nextTrack = this.collection.tracks[ 0 ];
      }

      nextTrack.play();
    },

    handleTimeline: function( reverse ){
      if( reverse ){
        this.hideTimeline();
      }
      else {
        this.displayTimeline();
      }
    },

    hideTimeline: function(){
      if( !this.playing ){
        return;
      }

      this.touched = false;
      this.displaying = false;

      if( Modernizr.touch ){
        window.clearTimeout( this.fadeTimeout );
        this.el.style.opacity = 0;
        this.fadeTimeout = window.setTimeout( $.proxy( function(){
          this.collection.parentEl.classList.add( 'hidden' );
        }, this ), 550 );
      }
      else {
        this.$svg
          .animate( 500, '>' )
            .opacity( 0 )
              .after( $.proxy( function(){
                this.collection.parentEl.classList.add( 'hidden' );
              }, this ) );
      }

      Backbone.Mediator.publish( 'timeline:visible', false );
    },

    moveToTrack: function( track, e ){

      if( this.moving || !this.interacted ){
        return;
      }

      this.moving = true;

      // the track become current
      track.set( 'current', true );

      var nextTrack = track.toJSON(),
          start = nextTrack.start,
          rotation,
          currentTrack = this.collection.currentTrack,
          filter = this.collection.control.get( 'type' );

      // if there's a filter, test if the next track is a part of the filtered collection
      //  if not unfilter the collection
      if( filter ){
        if( this.collection.tracks.indexOf( track ) === -1 ){
          this.collection.control.set( 'type', false );
        }
      }

      // broadcast a track change if the track is different from the current
      if( !currentTrack || currentTrack && currentTrack.id !== track.id ){
        this.collection.storeCurrentTrack( track );
        Backbone.Mediator.publish( 'timeline:change', nextTrack, e );
      }
      // when playing again the same track broadcast a replay
      else if( currentTrack && currentTrack.id === track.id ){
        Backbone.Mediator.publish( 'timeline:replay', nextTrack, e );
      }

      // store the current rotation of the group
      rotation = this.$baseGroup.stop().transform().rotation;

      // automatic moving to next track if at the end of the previous
      //  if the rotation difference with the next start is less than 2
      if( currentTrack && start === currentTrack.get( 'end' ) % 360 && Math.ceil( start - rotation % 360 ) <= 1 && Math.ceil( rotation - currentTrack.get( 'end' ) ) < 1 ){
        window.clearTimeout( window.mouseTimeout );
        if( start === 0 && rotation ){
          this.$baseGroup
            .transform( {
              rotation: 0
            } );
        }
        this.moving = false;
        Backbone.Mediator.publish( "player:play", nextTrack );
        return;
      }

      // store the event we dont want to listen one time
      //  so the animation is not stopped
      this.hush = 'pause';
      // pause the player
      Backbone.Mediator.publish( 'player:playback', 'pause' );

      if( currentTrack && currentTrack.id !== track.id && e !== 'drag' ){
        // always animate in the same direction
        //  if the group already rotated, animate to 0 passing by 360
        if( start === 0 && rotation ){
          start = 360;
        }
        // if the current rotation state of the group is higher than
        //  the angle we want to rotate to, add 360° to rotate in the same direction
        else if( rotation > start ){
          start += 360;
        }
      }

      // rotate to the start of the track and play
      this.$baseGroup
        .stop()
        .animate( 500, '>')
          .transform( {
            rotation: start
          } )
            .after( $.proxy( function(){
              // force the rotation to be lower than 360° by re-applying the track start
              this.$baseGroup
                .transform( {
                  rotation: nextTrack.start
                } );
              Backbone.Mediator.publish( "player:play", nextTrack );
              this.moving = false;
            }, this ) );

      // change the background for the next track playing
      Backbone.Mediator.publish( 'swap:img', Math.ceil( nextTrack.start ) );
    },

    playpause: function(){
      if( Modernizr.touch ){
        Backbone.Mediator.publish( 'move' );
      }
      else{
        Backbone.Mediator.publish( 'player:playback' );
      }
    },

    pointers: function(){
      // create the pointer group
      this.$pointerGroup = this.$svg.group().attr( 'id', 'pointers' ).move( 278, 500 );

      // create the definition
      this.$basePointer = this.$defs.path( 'M0,0L12,0 6,10z' ).attr( {
        'fill': '#fff',
        'id': 'basePointer',
        'opacity': 0,
        'stroke': '#000',
        'stroke-width': 2,
        'stroke-opacity': 0.5
      } );

      // create the pointers
      this.$pointers = {
        'up': this.$pointerGroup.use( this.$basePointer ).attr( 'id', 'up' ) ,
        'down': this.$pointerGroup.use( this.$basePointer ).attr( 'id', 'down' )
      };

      // transform the bottom pointer
      this.$pointers.down.transform( {
        rotation: 180,
        y: 50
      } );
    },

    position: function( el, width, height ){
      var left = ( width || this.collection.parentEl.clientWidth ) / 2,
          top = ( height || this.collection.parentEl.clientHeight )/ 2;

      this.$baseGroup
        .move( left - 285, top -285 )
        .transform({
          cx: left,
          cy: top
        });

      this.$pointerGroup.move( left - 6, top + 215 );
    },

    publishMove: function(){
      Backbone.Mediator.publish( 'move' );
    },

    // rotate the timeline on drag
    rotateTimeline: function( deg ){

      if( !this.swapLoaded ){
        this.swapLoaded = true;
        Backbone.Mediator.publish( 'swap:load', 'rotation' );
      }

      // change the background
      Backbone.Mediator.publish( 'swap:img', deg );


      var start, end, draggedTrack;
      // loop hover the filter track
      draggedTrack = _.find( this.collection.tracks, function( track ){
        start = track.get( 'start' );
        end = track.get( 'end' );
        return start <= deg && deg <= end;
      } );

      if( draggedTrack ){
        this.draggedTrack = draggedTrack;
        this.collection.infos.handleTrack( draggedTrack.toJSON() );
      }

      this.$baseGroup.transform( {
        rotation: deg
      } );
    },

    ready: function(){
      this.fadedOuter = true;
      this.fadeInner = true;
      this.timelineReady = true;
      // publish to all the tracks that the timeline is ready
      this.collection.trigger( 'ready' );

      // fadeIn the pointers
      this.$basePointer
        .animate( 250, '>' )
          .opacity( 1 );

      // explode the timeline
      this.scaleGroup();
    },

    scaleGroup: function( contracted ){
      if( this.filtered ){
        return;
      }

      // move the pointer
      this.$pointers.down
        .animate( 250, '>' )
          .transform( {
              y: 50
          } );

      _.each( this.groups, function( group, name ){
        if( contracted ){
          group
            .animate( 250, '>' )
              .transform( this.positions.flat )
              .opacity( 0.9 );
        }
        else{
          group
            .animate( 250, '>' )
              .transform( this.positions[ name ] )
              .opacity( 0.9 );
        }
      }, this );
    },

    selectGroup: function( model, type ){

      if( type ){
        this.filtered = true;
      }
      else{
        this.filtered = false;
        this.scaleGroup();
        return;
      }

      var ratio = 414/500,
        scaleDown = {
          'scaleX': ratio,
          'scaleY': ratio,
          'x': 78,
          'y': 78
        },
        scaleUp = {
          'scaleX': 1,
          'scaleY': 1,
          'x': 35,
          'y': 35
        };

        // explode group
        _.each( this.groups, function( group, name ){
          if( type === name || type === 'outer' && name === 'center' ){
            group
              .animate( 250, '>' )
                .transform( scaleUp )
                .attr( {
                  'opacity': 1
                } );
          }
          else{
            group
              .animate( 250, '>' )
                .transform( scaleDown )
                .attr( {
                  'opacity': 0.6
                } );
          }
        } );

        // move the pointer
        this.$pointers.down
          .animate( 250, '>' )
            .transform( {
                y: 60
            } );

    },

    show: function(){
      this.collection.parentEl.style.display = 'block';
    }

  } );

  return timelineView;
} );
