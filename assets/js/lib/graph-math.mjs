/* Pure geometry, shared by both renderers and independently testable. */
export function sphereSlice(height) {
  if (Math.abs(height) > 1) return { kind: 'empty', radius: 0 };
  if (Math.abs(height) === 1) return { kind: 'point', radius: 0 };
  return { kind: 'circle', radius: Math.sqrt(1 - height * height) };
}

// z is vertical. Keep the eye away from the origin and the poles.
export function moveCamera(eye, action, minDistance = 0.4, maxDistance = 12) {
  let distance = Math.hypot(eye.x, eye.y, eye.z);
  let azimuth = Math.atan2(eye.y, eye.x);
  let elevation = Math.asin(eye.z / distance);
  const step = Math.PI / 12;
  if (action === 'left') azimuth += step;
  if (action === 'right') azimuth -= step;
  if (action === 'up') elevation += step;
  if (action === 'down') elevation -= step;
  if (action === 'in') distance *= 0.8;
  if (action === 'out') distance /= 0.8;
  distance = Math.max(minDistance, Math.min(maxDistance, distance));
  elevation = Math.max(-1.35, Math.min(1.35, elevation));
  return {
    x: distance * Math.cos(elevation) * Math.cos(azimuth),
    y: distance * Math.cos(elevation) * Math.sin(azimuth),
    z: distance * Math.sin(elevation)
  };
}
