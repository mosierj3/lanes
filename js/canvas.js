// Global variables
var diff = 50;
var scale = 1;
var toggleCurve = false;
var toggleMergeAssist = false;
var toggleSnapToGrid = true;
var toggleSnapRelative = true;
var toggleShowGrid = true;

// Resize canvas
view.viewSize.width = window.innerWidth;
view.viewSize.height = window.innerHeight;

var background = new Path.Rectangle( {
	point: [ 0, 0 ],
	size: view.size,
	fillColor: 'lightgrey'
} );

var grid = new Layer();

// Grid lines
var gridLines = new Group();
// Horizontal grid lines from center out
var hLine = new Path.Line( {
	from: new Point( 0, view.center.y ),
	to: new Point( view.size.width, view.center.y ),
	strokeColor: 'white'
} );
gridLines.addChild( hLine );
var y = hLine.position.y - diff;
do {
	var copy = hLine.clone();
	copy.position.y = y;
	y += -diff;
	gridLines.addChild( copy );
} while ( y > 0 );
y = view.center.y + diff;
do {
	var copy = hLine.clone();
	copy.position.y = y;
	y += diff;
	gridLines.addChild( copy );
} while ( y < view.size.height );
// Vertical grid lines from center out
var vLine = new Path.Line( {
	from: new Point( view.center.x, 0 ),
	to: new Point( view.center.x, view.size.height ),
	strokeColor: 'white'
} );
gridLines.addChild( vLine );
var x = view.center.x - diff;
do {
	var copy = vLine.clone();
	copy.position.x = x;
	x += -diff;
	gridLines.addChild( copy );
} while ( x > 0 );
x = view.center.x + diff;
do {
	var copy = vLine.clone();
	copy.position.x = x;
	x += diff;
	gridLines.addChild( copy );
} while ( x < view.size.width );

// Crosshairs
var centerPoint = new Path.Circle( view.center, 2 );
var leftLine = new Path.Line( new Point( view.center.x - 10, view.center.y ), new Point( 0, view.center.y ) );
var topLine = new Path.Line( new Point( view.center.x, view.center.y - 10 ), new Point( view.center.x, 0 ) );
var rightLine = new Path.Line( new Point( view.center.x + 10, view.center.y ), new Point( view.size.width, view.center.y ) );
var bottomLine = new Path.Line( new Point( view.center.x, view.center.y + 10 ), new Point( view.center.x, view.size.height ) );
var crosshairs = new Group( [ centerPoint, leftLine, topLine, rightLine, bottomLine ] );
crosshairs.strokeColor = 'grey';
centerPoint.fillColor = 'grey';

// Do things on resize of window (not currently working)
function onResize( event ) {
	//console.log('resize');
	background.size = view.size;
	//project.position = view.center;
	boundGrid();
}
// Handle keyboard events
function onKeyDown( event ) {
	if ( Key.isDown( 'down' ) || Key.isDown( 'left' ) || Key.isDown( 'up' ) || Key.isDown( 'right' ) ) {
		translateGrid();
	}
	if ( Key.isDown( '+' ) || Key.isDown( '_' ) ) {
		scaleGrid();
	}
	if ( Key.isDown( 'c' ) ) {
		toggleCurve = !toggleCurve;
	}
	if ( Key.isDown( 'm' ) ) {
		toggleMergeAssist = !toggleMergeAssist;
	}
	if ( Key.isDown( 'escape' ) ) {
		newRoad = true;
		toggleMergeAssist = false;
		if ( r ) {
			r.lanes.killGhost();
		}
		r = null;
	}
}
// Move view left and right
function translateGrid() {
	var dX, dY, spd, move;
	spd = 10;
	dX = 0;
	dY = 0;
	if ( Key.isDown( 'down' ) ) {
		dY = -1;
	}
	if ( Key.isDown( 'up' ) ) {
		dY = 1;
	}
	if ( Key.isDown( 'left' ) ) {
		dX = 1;
	}
	if ( Key.isDown( 'right' ) ) {
		dX = -1;
	}
	grid.translate( new Point( dX * spd, dY * spd ) );
	boundGrid();
}
// Scale view in and out
function scaleGrid() {
	if ( Key.isDown( '+' ) ) {
		fact = 2;
	}
	if ( Key.isDown( '_' ) ) {
		fact = 0.5;
	}
	grid.scale( fact );
	diff = diff * fact;
	scale = scale * fact;
	boundGrid();
}
// Adjust grid lines to fit within viewable window
function boundGrid() {
	// Adjust edges of crosshairs
	leftLine.lastSegment.point = new Point( 0, leftLine.lastSegment.point.y );
	topLine.lastSegment.point = new Point( topLine.lastSegment.point.x, 0 );
	rightLine.lastSegment.point = new Point( view.size.width, rightLine.lastSegment.point.y );
	bottomLine.lastSegment.point = new Point( bottomLine.lastSegment.point.x, view.size.height );

	// Adjust edges of gridLines
	var children = gridLines.children;
	for ( var i = 0; i < children.length; i++ ) {
		var child = children[ i ];
		if ( Math.abs( child.firstSegment.point.x - child.lastSegment.point.x ) > 0 ) {
			child.firstSegment.point = new Point( 0, child.firstSegment.point.y );
			child.lastSegment.point = new Point( view.size.width, child.lastSegment.point.y );
		} else {
			child.firstSegment.point = new Point( child.firstSegment.point.x, 0 );
			child.lastSegment.point = new Point( child.lastSegment.point.x, view.size.height );
		}
	}

	// Adjust number of gridLines
	var lm = view.size.width;
	var rm = 0;

	for ( var i = 0; i < children.length; i++ ) {
		var child = children[ i ];
		// Iterate through vertical lines only
		if ( child.firstSegment.point.y == 0 && child.lastSegment.point.y == view.size.height ) {
			if ( child.firstSegment.point.x < lm ) {
				lm = child.firstSegment.point.x;
			}
			if ( child.firstSegment.point.x > rm ) {
				rm = child.firstSegment.point.x;
			}
		}
	}

	var tm = view.size.height;
	var bm = 0;

	for ( var i = 0; i < children.length; i++ ) {
		var child = children[ i ];
		// Iterate through horizontal lines only
		if ( child.firstSegment.point.x == 0 && child.lastSegment.point.x == view.size.width ) {
			if ( child.firstSegment.point.y < tm ) {
				tm = child.firstSegment.point.y;
			}
			if ( child.firstSegment.point.y > bm ) {
				bm = child.firstSegment.point.y;
			}
		}
	}

	diff = Math.abs( diff );
	//console.log( "left: " + lm + ", top: " + tm + ", right: " + rm + ", bottom: " + bm + ", diff: " + diff );

	// Add needed lines
	if ( lm > diff ) {
		do {
			var copy = vLine.clone();
			copy.position.x = lm - diff;
			gridLines.addChild( copy );
			lm = copy.position.x;
		} while ( lm > diff );
	}
	if ( ( view.size.width - rm ) > diff ) {
		do {
			var copy = vLine.clone();
			copy.position.x = rm + diff;
			gridLines.addChild( copy );
			rm = copy.position.x;
		} while ( ( view.size.width - rm ) > diff )
	}
	if ( tm > diff ) {
		do {
			var copy = hLine.clone();
			copy.position.y = tm - diff;
			gridLines.addChild( copy );
			tm = copy.position.y;
		} while ( tm > diff );
	}
	if ( ( view.size.height - bm ) > diff ) {
		do {
			var copy = hLine.clone();
			copy.position.y = bm + diff;
			gridLines.addChild( copy );
			bm = copy.position.y;
		} while ( ( view.size.height - bm ) > diff );
	}

	// Remove superfluous lines
	for ( var i = 0; i < children.length; i++ ) {
		var child = children[ i ];

		// Iterate through vertical lines only
		if ( child.firstSegment.point.y == 0 && child.lastSegment.point.y == view.size.height ) {
			if ( child.firstSegment.point.x < 0 ) {
				child.remove();
			}
			if ( child.firstSegment.point.x > view.size.width ) {
				child.remove();
			}
		}
	}
	for ( var i = 0; i < children.length; i++ ) {
		var child = children[ i ];

		// Iterate through horizontal lines only
		if ( child.firstSegment.point.x == 0 && child.lastSegment.point.x == view.size.width ) {
			if ( child.firstSegment.point.y < 0 ) {
				child.remove();
			}
			if ( child.firstSegment.point.y > view.size.height ) {
				child.remove();
			}
		}
	}
}

//// Begin lane drawing code ////
var newLane = true;
var lanes = new Group();
var l; // generic lane
var el; //existing lane
var selId;
var laneId = 0;

var newRoad = true;
var r;
var er;

function onMouseDown( event ) {
	//laneTool( event );
	roadTool( event );
}

function onMouseMove( event ) {
	if ( r != null ) {
		r.lanes.Ghost( event );
	}
}

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
			if ( r.lanes.lane.getNearestPoint( event.point ) >= nearestPath.firstSegment.point - 10 ) {
				r.lanes.reverseLane();
			}
			newRoad = !newRoad;
			return;
		}
	}
	r.addTo( event );
}

var Road = function() {
	var thisRoad = this;

	thisRoad.lanes = new Lane();

	thisRoad.addTo = function( event ) {
		thisRoad.lanes.addTo( event );
	}
}

var Lane = function() {
	var thisLane = this;
	thisLane.id = laneId++;
	thisLane.first = true;
	thisLane.width = 5;

	// Define lane components
	thisLane.firstPointSense = new Path.Circle( {
		center: event.point,
		radius: 10,
		fillColor: 'blue',
		opacity: 0
	} );
	thisLane.firstPointHighlight = new Path.Circle( {
		center: event.point,
		radius: 10,
		strokeColor: 'blue'
	} );
	thisLane.firstPoint = new Group( [ thisLane.firstPointSense, thisLane.firstPointHighlight ] );
	thisLane.lastPointSense = new Path.Circle( {
		center: event.point,
		radius: 10,
		fillColor: 'blue',
		opacity: 0
	} );
	thisLane.lastPointHighlight = new Path.Circle( {
		center: event.point,
		radius: 10,
		strokeColor: 'blue'
	} );
	thisLane.lastPoint = new Group( [ thisLane.lastPointSense, thisLane.lastPointHighlight ] );
	thisLane.firstPointHighlight.visible = false;
	thisLane.lastPointHighlight.visible = false;
	thisLane.lane = new Path( {
		strokeColor: 'darkgrey',
		strokeCap: 'round',
		strokeJoin: 'round',
		strokeWidth: thisLane.width,
		strokeScaling: true
	} );
	thisLane.group = new Group( [ thisLane.lane, thisLane.firstPoint, thisLane.lastPoint ] );
	lanes.addChild( thisLane.group );

	// Define ghost components
	thisLane.ghostParts = new Group();
	thisLane.ghostLane;
	thisLane.ghostStart;
	thisLane.ghostEnd;

	// Handle extending lane
	thisLane.addTo = function( event ) {
		if ( thisLane.ghostLane ) {
			thisLane.lane.addSegments( thisLane.ghostLane.segments );
		} else {
			thisLane.lane.add( event.point );
		}
		thisLane.firstPoint.position = thisLane.lane.firstSegment.point;
		thisLane.lastPoint.position = thisLane.lane.lastSegment.point;
	};

	// Used to show potential lane extention
	thisLane.Ghost = function( event ) {
		var thisGhost = this;
		thisGhost.to = snapTo( event );
		thisGhost.toggleJoinCurve = false;
		thisGhost.segments = new Array();

		// Remove previous ghost components
		thisLane.killGhost();

		// Create ghost components
		thisLane.ghostLane = new Path( {
			strokeCap: 'round',
			strokeJoin: 'round',
			strokeWidth: thisLane.width,
			strokeColor: 'white',
			opacity: 0.5
		} );
		thisLane.ghostParts.addChild( thisLane.ghostLane );
		thisLane.ghostStart = new Path.Circle( {
			center: thisLane.lane.lastSegment.point,
			radius: 10,
			strokeColor: 'red',
			strokeWidth: 2
		} );
		thisLane.ghostParts.addChild( thisLane.ghostStart );
		thisLane.ghostEnd = new Path.Circle( {
			center: thisLane.to.point,
			radius: 10,
			strokeColor: 'blue',
			strokeWidth: 2
		} );
		thisLane.ghostParts.addChild( thisLane.ghostEnd );

		// Create ghost path
		thisLane.ghostLane.add( thisLane.lane.lastSegment.point );
		// Forces first component to be a straight section of road
		if ( thisLane.lane.segments.length == 1 ) {
			toggleCurve = false;
		}
		if ( toggleCurve ) {
			thisLane.ghostLane.arcTo( arcThroughPoint( thisGhost.to, thisLane.lane ), thisGhost.to.point );
		} else {
			thisLane.ghostLane.add( thisGhost.to );
		}

		// Calculator: perfect lane join curve
		function getJoinCurvePoints( event ) {
			var p = event.point - thisLane.lane.lastSegment.point;
			p = p.length * 0.5;
			this.h1 = getHandle1Point( p );
			this.h2 = getHandle2Point( snap, p );

			function getHandle1Point( p ) {
				var t = thisLane.lane.getTangentAt( thisLane.lane.length - 1 ) * p;
				var rtn = thisLane.lane.lastSegment.point + t;
				return rtn;
			}

			function getHandle2Point( snap, p ) {
				if ( snap.first ) {
					var t = snap.lane.getTangentAt( 0 ) * -1 * p;
					var rtn = snap.lane.firstSegment.point + t;
				} else if ( snap.lane ) {
					var t = snap.lane.getTangentAt( snap.lane.length - 1 ) * p;
					var rtn = snap.lane.lastSegment.point + t;
				} else if ( snap.angle ) {
					var t = snap.angle * p;
					var rtn = snap.point + t;
				}
				return rtn;
			}
		}

		// Calculator: perfect lane curve
		function arcThroughPoint( event, L ) {
			var lastPoint = L.lastSegment.point;
			var tV = L.getTangentAt( L.length - 1 ) * 100;
			var cV = event.point - lastPoint;
			var v1 = cV / 2;
			var tA = tV.angle - cV.angle;
			var r = ( cV.length / 2 ) / Math.abs( Math.sin( ( tA ) * ( Math.PI / 180 ) ) );
			var s = r * ( 1 - Math.cos( tA * ( Math.PI / 180 ) ) );
			var v2 = cV - v1;
			v2.length = s;
			var relcv = relativeAngle( cV, tV );
			if ( relcv >= 0 ) {
				v2.angle -= 90;
			} else {
				v2.angle += 90;
			}
			var vector = v1 + v2 + lastPoint;
			var through = new Point( vector.x, vector.y );
			return through;
		}

		// Calculator: relative angles
		function relativeAngle( a1, a2 ) {
			var rA = a1.angle - a2.angle;
			if ( Math.abs( rA ) > 180 ) {
				if ( rA > 0 ) {
					rA -= 360;
				} else {
					rA += 360;
				}
			}
			return rA;
		}

		function snapTo( event ) {
			var snap = event;
			var first = false;

			if ( toggleMergeAssist ) {
				//snap.point = toMergeAssist( event, snap.point, thisLane.width + 1 );
			} else if ( toggleSnapRelative ) {
				snap.point = toLane( event, snap.point, thisLane.width * 2, false ); // Snap to lane (wide)
				snap.point = toLane( event, snap.point, thisLane.width * 5, true ); // Snap to end
			}

			function toMergeAssist( event, t, s ) {
				var L, S, E, G, a, b, c, d, e;
				var rtn = t;
				S = thisLane.lane.lastSegment.point;
				E = event.point;
				G = thisLane.ghostLane.lastSegment;
				for ( var i = 0; i < lanes.children.length; i++ ) {
					L = lanes.children[ i ].children[ 0 ];
					// Ensure more than one segment exists
					if ( L.segments.length > 1 ) {
						d = E - S;
						b = L.getNearestPoint( E );
						c = L.getNearestPoint( S ) - S;
						// Check if within sensitivity
						if ( ( b - E ).length < s ) {
							// Get merge angle
							a = L.getTangentAt( L.getOffsetOf( b ) );
							e = Math.abs( relativeAngle( d, c ) ) / relativeAngle( d, c );
							snap.angle = a * e;
							// Set initial snap point (distance s from other lane)
							rtn = b + L.getNormalAt( L.getOffsetOf( b ) ) * s;
							if ( thisLane.ghostLane.intersects( L ) ) {
								rtn = b + L.getNormalAt( L.getOffsetOf( b ) ) * -1 * s;
							}
							thisLane.toggleJoinCurve = true;
						}
					}
				}
				return rtn;
			}

			function toLane( event, t, s, isEnd ) {
				var L, n;
				var rtn = t;
				for ( var i = 0; i < lanes.children.length; i++ ) {
					L = lanes.children[ i ].children[ 0 ];
					// Ensure more than one segment exists
					if ( L.segments.length > 1 ) {
						n = L.getNearestPoint( event.point );
						// Check if within sensitivity
						if ( ( n - event.point ).length < s ) {
							// Check if end-point
							if ( isEnd && L.firstSegment.point == n || isEnd && L.lastSegment.point == n ) {
								rtn = n;
								snap.lane = L;
								if ( n != L.lastSegment.point ) {
									thisLane.toggleJoinCurve = true;
								}
								if ( L.firstSegment.point == n ) {
									first = true
								} else {
									first = false;
								}
							} else if ( !isEnd ) {
								rtn = n;
							}
						}
					}
				}
				return rtn;
			}

			return snap;
		}
	};
	// Reverse all lane components
	function reverseLane() {
		thisLane.lane.reverse();
	}

	// Remove any ghost components created last frame
	thisLane.killGhost = function() {
		if ( thisLane.ghostParts.children.length > 0 ) {
			thisLane.ghostParts.removeChildren();
		}
	};


}

/*
function Lane() {
	var self = this;
	self.id = laneId++;
	self.first = true;
	self.w = 10;

	self.ghostPath;
	self.ghostVector;
	self.ghostStart;
	self.ghostEnd;
	self.pathMarker;
	self.toggleJoinCurve;

	// Instantiate components
	self.firstPointSense = new Path.Circle( {
		center: event.point,
		radius: 10,
		fillColor: 'blue',
		opacity: 0
	} );
	self.firstPointHighlight = new Path.Circle( {
		center: event.point,
		radius: 10,
		strokeColor: 'blue'
	} );
	self.firstPoint = new Group( [ self.firstPointSense, self.firstPointHighlight ] );
	self.lastPointSense = new Path.Circle( {
		center: event.point,
		radius: 10,
		fillColor: 'blue',
		opacity: 0
	} );
	self.lastPointHighlight = new Path.Circle( {
		center: event.point,
		radius: 10,
		strokeColor: 'blue'
	} );
	self.lastPoint = new Group( [ self.lastPointSense, self.lastPointHighlight ] );
	self.lane = new Path( {
		strokeColor: 'darkgrey',
		strokeCap: 'round',
		strokeJoin: 'round',
		strokeWidth: self.w,
		strokeScaling: true
	} );

	self.firstPointHighlight.visible = false;
	self.lastPointHighlight.visible = false;

	// Make this lane a group and add it to the global lanes group
	self.thisLane = new Group( [ self.lane, self.firstPoint, self.lastPoint ] );
	lanes.addChild( self.thisLane );

	// Add next segment to lane components
	self.addPoint = function( event ) {
		if ( self.ghostPath ) {
			self.lane.addSegments( self.ghostPath.segments );
		} else {
			self.lane.add( event.point );
		}
		// Look for oportunity to join two lanes, this does not
		// create intersections
		var iL;
		for ( var i = 0; i < lanes.children.length; i++ ) {
			iL = lanes.children[ i ].children[ 0 ];
			if ( iL != self.lane ) {
				if ( iL.firstSegment.point == self.lane.lastSegment.point || iL.lastSegment.point == self.lane.lastSegment.point ) {
					self.lane.join( iL );
					newLane = true;
					self.killGhostTool();
					l = null;
					lanes.children[ i ].remove();
				}
			}
		}
		self.firstPoint.position = self.lane.firstSegment.point;
		self.lastPoint.position = self.lane.lastSegment.point;
	};

	// Create ghost path
	self.ghostTool = function( event ) {
		// Remove old ghost objects if any exist
		self.killGhostTool();

		// Determine snap point, if any
		self.to = new self.snapTo( event );

		// Create ghost path components
		self.ghostPath = new Path( {
			strokeCap: 'round',
			strokeJoin: 'round',
			strokeWidth: self.w,
			strokeColor: 'white',
			opacity: 1
		} );
		self.ghostStart = new Path.Circle( {
			center: self.lane.lastSegment.point,
			radius: 10,
			strokeColor: 'red',
			strokeWidth: 2
		} );
		self.ghostEnd = new Path.Circle( {
			center: self.to.point,
			radius: 10,
			strokeColor: 'blue',
			strokeWidth: 2
		} );

		// Create first ghost segment
		self.ghostPath.add( self.lane.lastSegment.point );

		// Forces first component to be a straight section of road
		if ( self.lane.segments.length == 1 ) {
			toggleCurve = false;
		}

		if ( toggleCurve ) {
			if ( self.toggleJoinCurve ) {
				// Create join curve
				var joinCurve = new self.getJoinCurvePoints( self.to );
				self.ghostPath.cubicCurveTo( joinCurve.h1, joinCurve.h2, self.to.point );
			} else {
				// Create ghose curve
				var through = calculateArc( self.to );
				self.ghostPath.arcTo( through, self.to.point );
			}
		} else {
			// Create ghost line
			self.ghostPath.add( self.to.point );
		}
	};

	// Calculator: perfect road join curve
	self.getJoinCurvePoints = function( snap ) {
		var p = snap.point - self.lane.lastSegment.point;
		p = p.length * 0.5;
		this.h1 = getHandle1Point( p );
		this.h2 = getHandle2Point( snap, p );

		function getHandle1Point( p ) {
			var t = self.lane.getTangentAt( self.lane.length - 1 ) * p;
			var rtn = self.lane.lastSegment.point + t;
			return rtn;
		}

		function getHandle2Point( snap, p ) {
			if ( snap.first ) {
				var t = snap.lane.getTangentAt( 0 ) * -1 * p;
				var rtn = snap.lane.firstSegment.point + t;
			} else if ( snap.lane ) {
				var t = snap.lane.getTangentAt( snap.lane.length - 1 ) * p;
				var rtn = snap.lane.lastSegment.point + t;
			} else if ( snap.angle ) {
				var t = snap.angle * p;
				var rtn = snap.point + t;
			}
			return rtn;
		}
	};

	// Calculator: perfect road curve
	function calculateArc( event ) {
		var tV = self.lane.getTangentAt( self.lane.length - 1 ) * 100;
		var cV = event.point - self.lane.lastSegment.point;
		var v1 = cV / 2;
		var tA = tV.angle - cV.angle;
		var r = ( cV.length / 2 ) / Math.abs( Math.sin( ( tA ) * ( Math.PI / 180 ) ) );
		var s = r * ( 1 - Math.cos( tA * ( Math.PI / 180 ) ) );
		var v2 = cV - v1;
		v2.length = s;
		var relcv = relativeAngle( cV, tV );
		if ( relcv >= 0 ) {
			v2.angle -= 90;
		} else {
			v2.angle += 90;
		}
		var vector = v1 + v2 + self.lane.lastSegment.point;
		var through = new Point( vector.x, vector.y );
		return through;
	};

	// Calculator: relative angles as needed
	function relativeAngle( a1, a2 ) {
		var rA = a1.angle - a2.angle;
		if ( Math.abs( rA ) > 180 ) {
			if ( rA > 0 ) {
				rA -= 360;
			} else {
				rA += 360;
			}
		}
		return rA;
	};

	// Snap point class
	self.snapTo = function( event ) {
		self.toggleJoinCurve = false;
		var snap = this;
		snap.point = event.point;
		snap.lane;
		snap.first;
		snap.angle;
		snap.h1;
		snap.h2;

		if ( toggleMergeAssist ) {
			snap.point = toMergeAssist( event, snap.point, self.w + 1 );
		} else if ( toggleSnapRelative ) {
			snap.point = toLane( event, snap.point, self.w * 2, false ); // Snap to lane (wide)
			snap.point = toLane( event, snap.point, self.w * 5, true ); // Snap to end
		}

		function toMergeAssist( event, t, s ) {
			var L, S, E, G, a, b, c, d, e;
			var rtn = t;
			S = self.lane.lastSegment.point;
			E = event.point;
			G = self.ghostPath.lastSegment;
			for ( var i = 0; i < lanes.children.length; i++ ) {
				L = lanes.children[ i ].children[ 0 ];
				// Ensure more than one segment exists
				if ( L.segments.length > 1 ) {
					d = E - S;
					b = L.getNearestPoint( E );
					c = L.getNearestPoint( S ) - S;
					// Check if within sensitivity
					if ( ( b - E ).length < s ) {
						// Get merge angle
						a = L.getTangentAt( L.getOffsetOf( b ) );
						e = Math.abs( relativeAngle( d, c ) ) / relativeAngle( d, c );
						snap.angle = a * e;
						// Set initial snap point (distance s from other lane)
						rtn = b + L.getNormalAt( L.getOffsetOf( b ) ) * s;
						if ( self.ghostPath.intersects( L ) ) {
							rtn = b + L.getNormalAt( L.getOffsetOf( b ) ) * -1 * s;
						}

						self.toggleJoinCurve = true;
					}
				}
			}
			return rtn;

		}


		function toLane( event, t, s, isEnd ) {
			var L, n;
			var rtn = t;
			for ( var i = 0; i < lanes.children.length; i++ ) {
				L = lanes.children[ i ].children[ 0 ];
				// Ensure more than one segment exists
				if ( L.segments.length > 1 ) {
					n = L.getNearestPoint( event.point );
					// Check if within sensitivity
					if ( ( n - event.point ).length < s ) {
						// Check if end-point
						if ( isEnd && L.firstSegment.point == n || isEnd && L.lastSegment.point == n ) {
							rtn = n;
							snap.lane = L;
							if ( n != self.lane.lastSegment.point ) {
								self.toggleJoinCurve = true;
							}
							if ( L.firstSegment.point == n ) {
								snap.first = true
							} else {
								snap.first = false;
							}
						} else if ( !isEnd ) {
							rtn = n;
						}
					}
				}
			}
			return rtn;
		}
	};

	// Reverse all lane components
	self.reverseLane = function() {
		self.lane.reverse();
	};

	// Destroy all ghost tool components as needed
	self.killGhostTool = function() {
		if ( self.ghostPath ) {
			self.ghostPath.remove();
		}
		if ( self.ghostStart ) {
			self.ghostStart.remove();
		}
		if ( self.ghostEnd ) {
			self.ghostEnd.remove();
		}
		if ( self.ghostVector ) {
			self.ghostVector.remove();
		}
	}

	// Handle mouse events
	self.lane.onMouseEnter = function( event ) {
		this.selected = true;
	}
	self.lane.onMouseLeave = function( event ) {
		this.selected = false;
	}
	self.firstPointSense.onMouseEnter = function( event ) {
		self.firstPointHighlight.visible = true;
		el = self;
	};
	self.firstPointSense.onMouseLeave = function( event ) {
		self.firstPointHighlight.visible = false;
		el = null;
	};
	self.lastPointSense.onMouseEnter = function( event ) {
		self.lastPointHighlight.visible = true;
		el = self;
	};
	self.lastPointSense.onMouseLeave = function( event ) {
		self.lastPointHighlight.visible = false;
		el = null;
	};
}
*/
