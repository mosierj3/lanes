var Snap = function( event, l, g ) {
	var self = this;
	this.from = l
	this.ghostLane = g;
	this.point = event.point;
	this.nearestIntersection = new Point( 0, 0 );
	this.lane;
	this.angle;
	this.first;
	this.h1;
	this.h2;
	this.offsetLane;
	toggleJoinCurve = false;

	if ( toggleSnapToGrid && !toggleOffsetAssist ) this.toGrid();
	if ( l && !toggleOffsetAssist ) {
		this.toLane( 20, false );
		this.toOffset( 5, true );
		this.toLane( 50, true );
	}
	if ( toggleOffsetAssist ) {
		this.toOffset( 5, false, 15 );
	}
}

Snap.prototype.toGrid = function() {
	for ( var i = 0; i < grid.intersections.length; i++ ) {
		var oldVector = this.point.subtract( this.nearestIntersection );
		var newVector = this.point.subtract( grid.intersections[ i ] );
		if ( newVector.length < oldVector.length ) this.nearestIntersection = grid.intersections[ i ];
	}
	this.point = this.nearestIntersection;
}

Snap.prototype.toLane = function( s, isEnd ) {
	var L, n;
	for ( var i = 0; i < lanes.children.length; i++ ) {
		L = lanes.children[ i ].children[ 0 ];
		// Ensure more than one segment exists
		if ( L.segments.length > 1 && L != this.offsetLane ) {
			n = L.getNearestPoint( this.point );
			// Check if within sensitivity
			if ( n.subtract( this.point ).length < s ) {
				if ( isEnd ) {
					if ( L.firstSegment.point.subtract( this.point ).length <= s ) {
						this.first = true;
						toggleJoinCurve = true;
						this.point = L.firstSegment.point;
						this.lane = L;
					} else if ( L.lastSegment.point.subtract( this.point ).length <= s && L != this.from ) {
						this.first = false;
						toggleJoinCurve = true;
						this.point = L.lastSegment.point;
						this.lane = L;
					}
				} else if ( !isEnd ) {
					this.point = n;
					toggleJoinCurve = false;
				}
			}
		}
	}
}

Snap.prototype.toOffset = function() {
	var self = this;

	// Iterate through all offset paths
	for ( var i = 0; i < lanes.children.length; i++ ) {
		var lane = lanes.children[ i ].children[ 0 ];
		var offsetLeft = lanes.children[ i ].children[ 3 ];
		var offsetRight = lanes.children[ i ].children[ 4 ];

		// Ensure more than one segment exists
		if ( lane.segments.length > 1 ) {
			// Hook to offset Path
			if ( !togglePreOffset ) {

			}


		}
	}

}


/*
Snap.prototype.toOffset = function( s, setOffset, j ) {
	var self = this;
	var s = s || 5;
	var j = j || 0;
	var L;
	for ( var i = 0; i < lanes.children.length; i++ ) {
		L = lanes.children[ i ].children[ 0 ];
		// Ensure more than one segment exists
		if ( L.segments.length > 1 ) {
			// Check if within sensitivity
			if ( ( L.getNearestPoint( this.point ).subtract( this.point ) ).length < ( s + j ) ) {
				if ( ( L.getNearestPoint( this.point ).subtract( this.ghostLane.firstSegment.point ) ).length < s ) return;
				if ( !setOffset ) {
					setOffset( 0, s + 1 );
					return;
				}
				// Get merge angle
				
				if ( a2 ) {
					var relA = Math.abs( this.relativeAngle( a1, a2 ) );
					if ( relA > 160 ) {
						setOffset( 0, s + 1 );
					} else if ( relA < 20 ) {
						setOffset( 180, s + 1 );
					} else {
						this.h2 = null;
						//offsetLane = null;
						if ( setOffset ) {
							togglePreOffset = false;
						}
					}
				}
			}
		}
	}

	function setOffset( a, o ) {
		var newHandle = self.ghostLane.lastSegment.handleIn;
		newHandle.angle = a1.angle + a;
		newHandle.length = self.ghostLane.firstSegment.handleOut.length;
		if ( !toggleOffsetAssist ) self.h2 = newHandle;
		var closestPoint = L.getNearestPoint( self.point );
		var v1 = closestPoint.add( L.getNormalAt( L.getOffsetOf( L.getNearestPoint( self.point ) ) ).multiply( o ) );
		var v2 = closestPoint.add( L.getNormalAt( L.getOffsetOf( L.getNearestPoint( self.point ) ) ).multiply( o * -1 ) );
		v1.x = Math.round( v1.x );
		v1.y = Math.round( v1.y );
		v2.x = Math.round( v2.x );
		v2.y = Math.round( v2.y );
		self.point = v1;
		offsetLane = L;
		togglePreOffset = true;
		if ( crossCheck() ) self.point = v2;
	}

	function crossCheck() {
		var tempPath = new Path( self.ghostLane.firstSegment.point );
		tempPath.add( self.point );
		if ( tempPath.intersects( L ) ) {
			tempPath.remove();
			return true;
		} else {
			tempPath.remove();
			return false;
		}
	}
}
*/

Snap.prototype.relativeAngle = function( a1, a2 ) {
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
