var lane;
var ghostPath;
var ghostVector;
var ghostStart;
var ghostEnd;
var pathMarker;
var toggleTool = false;
var toggleSmoothing = false;
var snap = 10;

// Define lanes
lane = new Path();
lane.strokeColor = 'grey';
lane.strokeCap = 'round';
lane.strokeJoin = 'round';
lane.strokeWidth = 10;

var radius = 8;

function onKeyDown(event) {
  if(Key.isDown('c')){
    if(!toggleSmoothing){
      toggleSmoothing = true;
    }else{
      toggleSmoothing = false;
    }
  }else if(Key.isDown('escape')){
    toggleTool = false;
    if(ghostPath){ ghostPath.remove(); }
    if(ghostVector){ ghostVector.remove(); }
    if(ghostStart){ ghostStart.remove(); }
    if(ghostEnd){ ghostEnd.remove(); }
    if(pathMarker){ pathMarker.remove(); }
  }
}

function onMouseDown(event) {
  if(toggleSmoothing){
    if(toggleTool){
      var toPoint = snapPoint(lane, event, 0);
      var throughPoint = calculateArc(lane, toPoint);
      lane.arcTo(throughPoint, toPoint);
    }else{
      var throughPoint = calculateArc(lane, event.point);
      lane.arcTo(throughPoint, event.point);
    }
  }else{
    if(toggleTool){
      var toPoint = snapPoint(lane, event, snap);
      lane.add(toPoint);
    }else{
      lane.add(event.point);
    }
  }
  toggleTool = true;
}

function onMouseMove(event) {
  if(toggleTool){
    ghostCurve(event);
  }
}

function ghostCurve(event){
  // Remove old ghost objects.
  if(ghostPath){ ghostPath.remove(); }
  if(ghostVector){ ghostVector.remove(); }
  if(ghostStart){ ghostStart.remove(); }
  if(ghostEnd){ ghostEnd.remove(); }
  if(pathMarker){ pathMarker.remove(); }

  // Create new ghost objects.
  ghostPath = new Path(lane.lastSegment.point);
  ghostStart = new Path.Circle(ghostPath.firstSegment.point, radius);
  if(toggleSmoothing){
    // Create Arc.
    var toPoint = snapPoint(lane, event, 0);
    var throughPoint = calculateArc(lane, toPoint);
    ghostEnd = new Path.Circle(toPoint, radius);
    ghostVector = new Path.Circle(throughPoint, radius);
    ghostVector.strokeColor = 'red';
    ghostVector.strokeWidth = 2;
    ghostPath.arcTo(throughPoint, toPoint);
  }else{
    // Create Line.
    var toPoint = snapPoint(lane, event, snap);
    ghostEnd = new Path.Circle(toPoint, radius);
    ghostPath.add(toPoint);
  }

  ghostPath.strokeCap = 'round';
  ghostPath.strokeJoin = 'round';
  ghostPath.strokeWidth = 10;

  ghostPath.strokeColor = 'lightgrey';
  ghostStart.strokeColor = 'red';
  ghostEnd.strokeColor = 'blue';
  ghostStart.strokeWidth = 2;
  ghostEnd.strokeWidth = 2;

}

function snapPoint(lane, event, min){
  var snapVector = event.point - lane.lastSegment.point;

  // Snap to length
  var r = snapVector.length % 100;
  if(r < 10){
    console.log(Math.round(snapVector.length/100)*100)
    snapVector.length = Math.round(snapVector.length/100)*100;
  }

  // Snap to angle
  var refAngle = new Path();
  if(lane.lastSegment.index == 0){
    refAngle.angle = 0;
  }else{
    refAngle = lane.getTangentAt(lane.length) * 1;
  }
  var vector = event.point - lane.lastSegment.point;
  var snap = snapAngle(vector, refAngle);
  if(snap != null){
    snapVector.angle = snap.angle;
  }

  // Sharp angle line snap
  if(lane.lastSegment.index > 0){
    var nearestPoint = lane.getNearestPoint(event.point);
    var distance = event.point - nearestPoint;
    if(Math.abs(distance.length) < 10){
      snapVector.length = (nearestPoint - lane.lastSegment.point).length;
    }
  }

  // Shallow angle line snap
  if(lane.lastSegment.index > 0){
    var nearestPoint = lane.getNearestPoint(event.point);
    var offsetNearestPoint = lane.getOffsetOf(nearestPoint);
    var nearestTangent = lane.getTangentAt(offsetNearestPoint) * 1;
    var relAngle = relativeAngle(snapVector, nearestTangent);
    var distance = event.point - nearestPoint;
    var normal = lane.getNormalAt(offsetNearestPoint) * 11;
    var distanceToNormal = (nearestPoint + normal) - event.point;
    if(distance.length < distanceToNormal.length){
      normal.angle += 180;
    }
    distanceToNormal = (nearestPoint + normal) - event.point;
    var hyp = (nearestPoint + normal) - lane.lastSegment.point;
    //console.log(distanceToNormal.length);
    if(distanceToNormal.length < 10){
      if(Math.abs(relAngle) >= 150 || Math.abs(relAngle) <= 30){
        snapVector.angle = hyp.angle;
      }
    }
  }

  // Snap to tangent
  var tangent = lane.getTangentAt(lane.length) * 1;
  var vector = event.point - lane.lastSegment.point;
  var relAngle = relativeAngle(vector, tangent);
  //var l = vector.length * Math.cos(Math.abs(relAngle) * (Math.PI/180));
  if(Math.abs(relAngle) <= min){
    if(lane.lastSegment.index > 0){
      snapVector.angle = tangent.angle;
    }
  }

  // Produce final snap point.
  snapVector = lane.lastSegment.point + snapVector;
  var snapPoint = new Point(snapVector.x, snapVector.y);
  return snapPoint;
}

function magnet(){

}

function snapAngle(vector, refAngle){
  var relAngle = relativeAngle(vector, refAngle);
  for (var i = 0; i <= 180; i = i + 45) {
    if((Math.abs(relAngle) > (i - 5)) && (Math.abs(relAngle) < (i + 5))){
      if(relAngle < 0){ vector.angle = refAngle.angle - i; }
      if(relAngle > 0){ vector.angle = refAngle.angle + i; }
      var snapVector = lane.lastSegment.point + vector;
      return vector;
    }
  }
  return null;
}

function relativeAngle(angle1, angle2){
  var rel = angle1.angle - angle2.angle;
  if(Math.abs(rel) > 180){
    if(rel > 0){
      rel -= 360;
    }else{
      rel += 360;
    }
  }
  return rel;
}

function calculateArc(lane, to){
  var Tv = lane.getTangentAt(lane.length) * 100;
  var cv = to - lane.lastSegment.point;
  var v1 = cv / 2;
  var Ta = Tv.angle - cv.angle;
  var Aa = Ta * 2;
  var R = (cv.length / 2) / Math.abs(Math.sin((Ta) * (Math.PI/180)));
  var s = R * (1 - Math.cos(Ta * (Math.PI / 180)));
  var point = lane.lastSegment.point;
  var v2 = cv - v1;
  v2.length = s;
  var relcv = relativeAngle(cv, Tv);
  if(relcv >= 0){
    v2.angle -= 90;
  }else{
    v2.angle += 90;
  }
  var vector = v1 + v2 + point;
  var throughPoint = new Point(vector.x, vector.y);
  return throughPoint;
}
