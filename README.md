# lanes
Road and traffic sim experiment based on paper.js, with a focus on lanes vice roads.

## Current Status
Building a basic parallel line drawing feature for all lane types that is persistent. This will be the basis for how lanes will interact in the future. Essentially, the lanes should interact in the following ways:
- Initial lane drawing will start with a straight portion. From there, the lane may be continued using straight or arcing segments.
- As the lane is drawn there are several helper tools that will be running:
  1. Snap to grid (on by default).
  2. Snap to existing lanes.
  3. Join to existing lane (will create composite lane consisting of the original two lanes).
  4. Snap to a parallel path along an existing lane (if certain distance and relative angle parameters are met).

If **snap to parallel path** is called, then the active lane should orient itself to the same angle and shape as the reference lane. As the active lane is continued by the user, it should continue to preference the reference line, creating a parallel lane. If the user moves the mouse far enough away, the lane should "pull off" and form an exit or "off-ramp" of sorts. Additionally, this "off-ramp" should appear to be a logic curve from the current mouse position to a specific logical point along the reference lane (rather than from the last built segment). Once the "off-ramp" is created, the lane should default back to the global snapping tools (rather than continuing to try to parallel the reference lane).

### What works
- All grid functions: panning and zooming.
- Basic lane drawing functions: straight, arc (default lane curvature), cubic (default lane joining method).
- Some snapping features: snap to lane, snap to end (for joining lanes), snap to grid
- Straight lane parallel reference lines

### What doesn't works
- Curved lane (arc) parallel reference lines
- Joined lanes parallel reference lines
- Snap to parallel lines
- Maintaining snapped to parallel line
