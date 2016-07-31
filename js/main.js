paper.install( window );
// Define global variables
var lanes;
var grid;
var cursor;
var offsetLane;

var toggleCurve = false;
var toggleJoinCurve = false;
var togglePreOffset = false;
var toggleOffsetAssist = false;
var toggleSnapToGrid = true;
var toggleSnapRelative = true;
var toggleShowGrid = true;

window.onload = function() {
	paper.setup( 'map' );

	grid = new Grid();
	lanes = new Group();

	var tool = new Tool();
	tool.onMouseDown = function( event ) {
		roadTool( event );
	}

	tool.onMouseMove = function( event ) {
		if ( cursor ) cursor.remove();
		if ( r != null ) {
			r.lanes.ghost.moveTo( event );
		} else {
			var snap = new Snap( event );
			cursor = new Path.Circle( {
				radius: 5,
				fillColor: "white",
				center: snap.point
			} );
			cursor.sendToBack();
		}
	}

	window.onkeydown = function( event ) {
		var key;
		//console.log( event.keyCode );
		switch ( event.keyCode ) {
			case 38:
				key = "up";
				grid.move( 0, -1, 10 );
				grid.draw();
				break;
			case 40:
				key = "down";
				grid.move( 0, 1, 10 );
				grid.draw();
				break;
			case 37:
				key = "left";
				grid.move( -1, 0, 10 );
				grid.draw();
				break;
			case 39:
				key = "right"
				grid.move( 1, 0, 10 );
				grid.draw();
				break;
			case 187: //(+)
				if ( event.shiftKey ) {
					grid.zoom( 0.1 );
					grid.draw();
				}
				break;
			case 189: //(-)
				if ( event.shiftKey ) {
					grid.zoom( -0.1 );
					grid.draw();
				}
				break;
			case 71: //(g)
				if ( !event.shiftKey ) {
					toggleShowGrid = !toggleShowGrid;
					grid.toggleVisible( toggleShowGrid );
				} else {
					//(shift + g)
					toggleSnapToGrid = !toggleSnapToGrid;
				}
				break;
			case 67: //(c)
				toggleCurve = !toggleCurve;
				break;
			case 77: //(m)
				toggleMergeAssist = !toggleMergeAssist;
			case 27: //(esc)
				newRoad = true;
				toggleOffsetAssist = false;
				if ( r ) {
					r.lanes.ghost.killGhost();
				}
				r = null;
				break;
			case 79:
				if ( event.shiftKey ) {
					r.lanes.makeOffset();
				}
				break;
		}


	}

	window.onresize = function() {
		grid.resize();
		grid.draw();
	}
	view.draw();
}
