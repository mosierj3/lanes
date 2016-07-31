var Map = function() {
	var map = this;
	map.center = new Point( view.center );
	map.maxZoom = 2.5;
	map.minZoom = 0.5;
	map.width = 4000;
	map.height = 4000;
}

Map.prototype.resize = function() {
	view.viewSize.width = window.innerWidth;
	view.viewSize.height = window.innerHeight;
}

Map.prototype.move = function( dX, dY, spd ) {
	var map = this;
	var bounds = view.bounds;
	if ( Math.abs( bounds.left + dX * spd ) > map.width / 2 || Math.abs( bounds.right + dX * spd ) > map.width / 2 ) return false;
	if ( Math.abs( bounds.top + dY * spd ) > map.height / 2 || Math.abs( bounds.bottom + dY * spd ) > map.height / 2 ) return false;
	view.center = new Point( view.center.x + dX * spd, view.center.y + dY * spd );
	view.update();
}

Map.prototype.zoom = function( factor ) {
	var map = this;
	var newZoom = Math.fround( view.zoom + factor );
	if ( newZoom > map.maxZoom || newZoom < map.minZoom ) return false;
	view.zoom += factor;
	if ( Math.abs( view.bounds.top ) > map.height / 2 ) {
		view.center = new Point( view.center.x, view.center.y + ( Math.abs( view.bounds.top ) - map.height / 2 ) );
	}
	if ( Math.abs( view.bounds.bottom ) > map.height / 2 ) {
		view.center = new Point( view.center.x, view.center.y - ( Math.abs( view.bounds.bottom ) - map.height / 2 ) );
	}
	if ( Math.abs( view.bounds.left ) > map.width / 2 ) {
		view.center = new Point( view.center.x + ( Math.abs( view.bounds.left ) - map.width / 2 ), view.center.y );
	}
	if ( Math.abs( view.bounds.right ) > map.width / 2 ) {
		view.center = new Point( view.center.x - ( Math.abs( view.bounds.right ) - map.width / 2 ), view.center.y );
	}
	view.update();
}
