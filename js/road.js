var laneId = 0;
var l;
var el;
var newLane = true;
var newRoad = true;
var r;
var er;

function roadTool( event ) {
	if ( newRoad ) {
		if ( er == null ) {
			// Create new road
			r = new Road();
			newRoad = !newRoad;
		} else {
			// Add to existing roadTool
			r = null;
			r = er;
			// Orient existing road to allow adding segments
			var nearestPath = project.getItem( {
				class: Path,
				id: r.lanes.id
			} );
			if ( r.lanes.firstPointHighlight.visible ) {
				r.lanes.reverse();
			}
			newRoad = !newRoad;
			return;
		}
	}
	r.addTo( event );
}

var Road = function() {
	Map.call( this );
	this.lanes = new Lane( this );
}

Road.prototype = Object.create( Map.prototype );
Road.prototype.constructor = Road;

Road.prototype.addTo = function( event ) {
	this.lanes.addTo( event );
}

var Lane = function( road ) {
	var self = this;
	this.id = laneId++;
	this.first = true;
	this.width = 5;
	this.ghost;
	this.offset = 5;
	this.offsetLeft;
	this.offsetRight;

	// Define lane components
	this.firstPointSense = new Path.Circle( {
		center: cursor.position,
		radius: 10,
		fillColor: 'blue',
		opacity: 0
	} );

	this.firstPointHighlight = new Path.Circle( {
		center: cursor.position,
		radius: 10,
		strokeColor: 'blue'
	} );
	this.firstPoint = new Group( [ this.firstPointSense, this.firstPointHighlight ] );
	this.lastPointSense = new Path.Circle( {
		center: cursor.position,
		radius: 10,
		fillColor: 'blue',
		opacity: 0
	} );
	this.lastPointHighlight = new Path.Circle( {
		center: cursor.position,
		radius: 10,
		strokeColor: 'blue'
	} );
	this.lastPoint = new Group( [ this.lastPointSense, this.lastPointHighlight ] );
	this.firstPointHighlight.visible = false;
	this.lastPointHighlight.visible = false;
	this.lane = new Path( {
		strokeColor: 'darkgrey',
		strokeCap: 'round',
		strokeJoin: 'round',
		strokeWidth: this.width,
		strokeScaling: true
	} );
	this.offsetLeft = new Path( {
		strokeColor: "grey",
		strokeWidth: 1
	} );
	this.offsetRight = new Path( {
		strokeColor: "grey",
		strokeWidth: 1
	} );
	this.group = new Group( [ this.lane, this.firstPoint, this.lastPoint, this.offsetLeft, this.offsetRight ] );
	lanes.addChild( this.group );

	// Handle mouse events
	this.lane.onMouseEnter = function( event ) {
		this.selected = true;
	}
	this.lane.onMouseLeave = function( event ) {
		this.selected = false;
	}
	this.firstPointSense.onMouseEnter = function( event ) {
		self.firstPointHighlight.visible = true;
		er = road;
	};
	this.firstPointSense.onMouseLeave = function( event ) {
		self.firstPointHighlight.visible = false;
		er = null;
	};
	this.lastPointSense.onMouseEnter = function( event ) {
		self.lastPointHighlight.visible = true;
		er = road;
	};
	this.lastPointSense.onMouseLeave = function( event ) {
		self.lastPointHighlight.visible = false;
		er = null;
	};
}

Lane.prototype.addTo = function( event ) {
	if ( this.ghost ) {
		this.ghost.killGhost();

		this.lane.addSegments( this.ghost.ghostLane.segments );

		var referenceSegmentLeft = this.offsetLeft.lastSegment;
		var referenceSegmentRight = this.offsetRight.lastSegment;

		this.offsetLeft.addSegments( this.ghost.ghostOffsetLeft.segments );
		this.offsetRight.addSegments( this.ghost.ghostOffsetRight.segments );

		this.fixOffetJoints( this.offsetLeft, referenceSegmentLeft );
		this.fixOffetJoints( this.offsetRight, referenceSegmentRight );

		if ( togglePreOffset ) {
			toggleOffsetAssist = true;
			togglePreOffset = false;
		}
	} else {
		this.lane.add( cursor.position );
	}
	// Look for oportunity to join two lanes, this does not
	// create intersections
	var iL;
	for ( var i = 0; i < lanes.children.length; i++ ) {
		iL = lanes.children[ i ].children[ 0 ];
		if ( iL != this.lane ) {
			var a = iL.lastSegment.point;
			var b = iL.firstSegment.point;
			var c = this.lane.lastSegment.point;
			if ( a.x == c.x && a.y == c.y || b.x == c.x && b.y == c.y ) {
				this.ghost.killGhost();
				this.lane.join( iL );
				lanes.children[ i ].remove();
				newRoad = true;
				r = null;
				this.firstPoint.position = this.lane.firstSegment.point;
				this.lastPoint.position = this.lane.lastSegment.point;
				return;
			}
		}
	}
	this.ghost = new Ghost( this );
	this.firstPoint.position = this.lane.firstSegment.point;
	this.lastPoint.position = this.lane.lastSegment.point;
}

Lane.prototype.reverse = function() {
	this.lane.reverse();
}

Lane.prototype.fixOffetJoints = function( path, start ) {
	// Ensure more than one segment exists
	if ( path.segments.length > 2 ) {
		console.log( "hello" );
	}
}
