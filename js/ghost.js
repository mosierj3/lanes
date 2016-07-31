var Ghost = function( l ) {
	var self = this;
	this.lane = l.lane;
	this.ghostLane;
	this.to = this.lane.lastSegment;
	this.width = l.width;
	this.toggleCurve = false;
	this.h1;
	this.h2;

	// Create ghost components
	this.ghostParts = new Group();
	this.makeGhost();
}

Ghost.prototype.makeGhost = function() {
	this.ghostLane = new Path( {
		strokeCap: 'round',
		strokeJoin: 'round',
		strokeWidth: this.width,
		strokeColor: 'white',
		opacity: 0.5
	} );
	this.ghostLane.add( this.lane.lastSegment.point );

	this.ghostParts.addChild( this.ghostLane );

	this.ghostOffsetLeft = new Path( {
		strokeColor: "grey",
		strokeWidth: 1
	} );
	this.ghostParts.addChild( this.ghostOffsetLeft );

	this.ghostOffsetRight = new Path( {
		strokeColor: "grey",
		strokeWidth: 1
	} );
	this.ghostParts.addChild( this.ghostOffsetRight );

	this.ghostStart = new Path.Circle( {
		center: this.lane.lastSegment.point,
		radius: 10,
		strokeColor: 'red',
		strokeWidth: 2
	} );
	this.ghostParts.addChild( this.ghostStart );

	this.ghostEnd = new Path.Circle( {
		center: this.to.point,
		radius: 10,
		strokeColor: 'blue',
		strokeWidth: 2
	} );
	this.ghostParts.addChild( this.ghostEnd );
}

Ghost.prototype.moveTo = function( event ) {
	this.snap = new Snap( event, this.lane, this.ghostLane );
	this.to = this.snap;
	this.killGhost();
	this.makeGhost();
	// Forces first component to be a straight section of road
	if ( this.lane.segments.length == 1 ) {
		toggleCurve = false;
	}
	if ( toggleOffsetAssist ) {
		//this.offset( 5 );
		this.ghostLane.arcTo( this.arcThrough( this.lane, this.to.point ), this.to.point );
	} else if ( toggleCurve ) {
		if ( toggleJoinCurve ) {
			this.joinCurve();
			this.ghostLane.cubicCurveTo( this.h1, this.h2, this.to.point );
		} else {
			this.ghostLane.arcTo( this.arcThrough( this.lane, this.to.point ), this.to.point );
			//this.ghostOffsetLeft.add( this.getOffsetPoint( this.ghostLane.firstSegment.point, "left" ) );
			//this.ghostOffsetLeft.arcTo( this.arcThrough(), this.getOffsetPoint( this.ghostLane.lastSegment.point, "left" ) );
			//this.ghostOffsetRight.add( this.getOffsetPoint( this.ghostLane.firstSegment.point, "right" ) );
			//this.ghostOffsetRight.arcTo( this.arcThrough(), this.getOffsetPoint( this.ghostLane.lastSegment.point, "right" ) );
			if ( this.snap.h2 ) {
				this.ghostLane.lastSegment.handleIn = this.snap.h2;
			}
		}
	} else {
		this.ghostLane.add( this.to.point );
		this.ghostOffsetLeft.add( this.getOffsetPoint( this.ghostLane.firstSegment.point, "left" ) );
		this.ghostOffsetLeft.add( this.getOffsetPoint( this.ghostLane.lastSegment.point, "left" ) );
		this.ghostOffsetRight.add( this.getOffsetPoint( this.ghostLane.firstSegment.point, "right" ) );
		this.ghostOffsetRight.add( this.getOffsetPoint( this.ghostLane.lastSegment.point, "right" ) );
	}
}

Ghost.prototype.getOffsetPoint = function( referencePoint, offsetSide, offsetDistance ) {
	var offsetSide = ( {
		"left": 1,
		"right": -1
	} )[ offsetSide ];
	var offsetDistance = offsetDistance || 5;
	var normal = this.ghostLane.getNormalAt( this.ghostLane.getOffsetOf( referencePoint ) ).multiply( offsetDistance * offsetSide );
	var offsetPoint = referencePoint.add( normal );
	return offsetPoint;
}

Ghost.prototype.joinCurve = function() {
	var self = this;
	var p = this.to.point.subtract( this.lane.lastSegment.point );
	p = p.length * 0.5;

	this.h1 = getHandle1Point( p );
	this.h2 = getHandle2Point( this.to, p );

	function getHandle1Point( p ) {
		var t = self.lane.getTangentAt( self.lane.length - 1 ).multiply( p );
		var rtn = self.lane.lastSegment.point.add( t );
		return rtn;
	}

	function getHandle2Point( to, p ) {
		if ( to.first ) {
			var t = to.lane.getTangentAt( 0 ).multiply( -1 * p );
			var rtn = to.lane.firstSegment.point.add( t );
		} else if ( to.lane ) {
			var t = to.lane.getTangentAt( to.lane.length - 1 ).multiply( p );
			var rtn = to.lane.lastSegment.point.add( t );
		} else if ( to.angle ) {
			var t = to.angle * p;
			var rtn = to.point.add( t );
			console.log( rtn );
		}
		return rtn;
	}
}

Ghost.prototype.arcThrough = function( from, to ) {
	//var lastPoint = this.lane.lastSegment.point;
	var tV = from.getTangentAt( from.length - 1 );
	var cV = to.subtract( from.lastSegment.point );
	var v1 = cV.divide( 2 );
	var tA = tV.angle - cV.angle;
	var r = ( cV.length / 2 ) / Math.abs( Math.sin( ( tA ) * ( Math.PI / 180 ) ) );
	var s = r * ( 1 - Math.cos( tA * ( Math.PI / 180 ) ) );
	var v2 = cV.subtract( v1 );
	v2.length = s;
	var relcv = this.relativeAngle( cV, tV );
	if ( relcv >= 0 ) {
		v2.angle -= 90;
	} else {
		v2.angle += 90;
	}
	var vector = v1.add( v2 );
	vector = vector.add( from.lastSegment.point );
	var through = new Point( vector.x, vector.y );
	return through;
}

Ghost.prototype.offset = function( s ) {
	var self = this;
	this.segments;
	var s = s || 5;
	var O = offsetLane;
	var G = this.ghostLane;
	togglePreOffset = false;
	//if ( clone ) clone.remove();
	//if ( split1 ) split1.remove();
	//if ( split2 ) split2.remove();
	var clone = O.clone();
	var o1 = O.getOffsetOf( O.getNearestPoint( this.lane.lastSegment.point ) );
	var o2 = O.getOffsetOf( O.getNearestPoint( this.to.point ) );
	var p2 = O.getNearestPoint( this.to.point );
	var n1a = O.getNormalAt( o1 ).multiply( s + 1 );
	var n1b = O.getNormalAt( o1 ).multiply( s + 1 ).multiply( -1 );
	var n2a = O.getNormalAt( o2 ).multiply( s + 1 );
	var n2b = O.getNormalAt( o2 ).multiply( s + 1 ).multiply( -1 );
	if ( crossCheck( n2a ) ) {
		var n1 = n1b;
		var n2 = n2b;
	} else {
		var n1 = n1a;
		var n2 = n2a;
	}
	var split1 = clone.split( o1 );
	var split2 = split1.split( o2 );
	split1.translate( n1 );
	this.ghostLane.segments = split1.segments;
	clone.remove();
	if ( split1 ) split1.remove();
	if ( split2 ) split2.remove();

	//return this.segments;

	function crossCheck( n ) {
		var tempPath = new Path( self.ghostLane.firstSegment.point );
		tempPath.add( n );
		if ( tempPath.intersects( offsetLane ) ) {
			tempPath.remove();
			return true;
		} else {
			tempPath.remove();
			return false;
		}
	}
}

// Calculator: relative angles
Ghost.prototype.relativeAngle = function( a1, a2 ) {
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

Ghost.prototype.killGhost = function() {
	if ( this.ghostParts.children.length > 0 ) {
		this.ghostParts.removeChildren();
	}
}
