// This model is shared by the explorer, prepared figure, and mathematical checks.
export const TAU = 2 * Math.PI;
export const DEFAULT_STATE = Object.freeze({ theta: 90, phi: 0, azimuth: 45, elevation: 35 });
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const objective = (x, y) => (x - 2) ** 2 + (x - 2) * (y - 1) + 3 * (y - 1) ** 2;
export const constraint = (x, y) => x * x + 2 * y * y + (x - y) ** 4 / 4;
export const objectiveGradient = (x, y) => [2 * x + y - 5, x + 6 * y - 8];
export const constraintGradient = (x, y) => [2 * x + (x - y) ** 3, 4 * y - (x - y) ** 3];
export const objectiveHessian = () => [[2,1],[1,6]];
export const constraintHessian = (x,y) => { const s=3*(x-y)**2; return [[2+s,-s],[-s,4+s]]; };

export function normalizeAngle(degrees) { const angle = degrees % 360; return angle < 0 ? angle + 360 : angle; }

// Intersect a ray with g=level by solving b r^4 + a r^2 = level.
export function constraintPoint(degrees, level = 1) {
  const theta=normalizeAngle(degrees), angle=theta*Math.PI/180;
  const cardinal=[[1,0],[0,1],[-1,0],[0,-1]];
  const [c,s]=theta%90===0 ? cardinal[theta/90] : [Math.cos(angle),Math.sin(angle)];
  const a=c*c+2*s*s, b=(c-s)**4/4;
  const r=Math.sqrt(2*level/(a+Math.sqrt(a*a+4*b*level)));
  return [r*c,r*s];
}

export function objectiveContour(degrees, level) {
  const angle=degrees*Math.PI/180, b=2*Math.sqrt(level/11)*Math.sin(angle);
  return [2+Math.sqrt(level)*Math.cos(angle)-b/2,1+b];
}

function geometry(theta) {
  const point=constraintPoint(theta), gradF=objectiveGradient(...point), gradG=constraintGradient(...point);
  const normF=Math.hypot(...gradF), normG=Math.hypot(...gradG);
  const normal=gradG.map(value=>value/normG), tangent=[-normal[1],normal[0]];
  return {point,gradF,gradG,normF,normG,normal,tangent};
}

export function stationaryAngle(low,high) {
  const slope=theta=>{const a=geometry(theta);return dot(a.gradF,a.tangent);};
  if (slope(low)*slope(high)>=0) throw new RangeError('The bracket must contain a sign change.');
  for(let i=0;i<64;i++) {const middle=(low+high)/2; if(slope(low)*slope(middle)<=0) high=middle;else low=middle;}
  return (low+high)/2;
}
export const MINIMUM_ANGLE=stationaryAngle(35,36);
export const MAXIMUM_ANGLE=stationaryAngle(221,222);

export function ascentAngle(state, kind) {
  const gradient=kind==='f'?state.gradF:state.gradG;
  return Math.atan2(dot(gradient,state.normal),dot(gradient,state.tangent))*180/Math.PI;
}

export function sectionState(theta = DEFAULT_STATE.theta, phi = DEFAULT_STATE.phi) {
  if (!Number.isFinite(theta) || !Number.isFinite(phi)) throw new TypeError('Angles must be finite.');
  const normalized = normalizeAngle(theta), rotation = phi * Math.PI / 180;
  // Native range controls can serialize a preset with a few last-bit changes.
  // Recognize only machine-precision equivalents, never a displayed approximation.
  const preset = target => Math.abs(normalized - target) <= 8 * Number.EPSILON * Math.max(1, Math.abs(target));
  const stationary = preset(MINIMUM_ANGLE) ? 'minimum' : preset(MAXIMUM_ANGLE) ? 'maximum' : null;
  const data=geometry(stationary==='minimum'?MINIMUM_ANGLE:stationary==='maximum'?MAXIMUM_ANGLE:theta);
  const {point,tangent,normal,gradF,gradG,normF,normG}=data;
  const cos = Math.abs(phi) === 90 ? 0 : Math.cos(rotation), sin = phi%180 === 0 ? 0 : Math.sin(rotation);
  const direction = tangent.map((value, i) => cos * value + sin * normal[i]);
  const tangentSlope = stationary ? 0 : dot(gradF, tangent);
  const slopeF = cos * tangentSlope + sin * dot(gradF, normal), slopeG = normG * sin;
  const value = objective(...point);
  return { theta, phi, ...data, direction, value, tangentSlope, slopeF, slopeG, stationary,
    multiplier: dot(gradF, gradG) / dot(gradG, gradG) };
}

export function sectionValue(state, which, t) {
  const [x, y] = state.point.map((value, i) => value + t * state.direction[i]);
  return which === 'f' ? objective(x, y) : constraint(x, y);
}

export function feasibleValue(theta) { return sectionState(theta).value; }

export function crossEntropy(q, p) {
  if (q.length !== p.length || q.length < 2 || q.some(x => !Number.isFinite(x) || !(x > 0)) || p.some(x => !Number.isFinite(x) || x < 0)
    || Math.abs(q.reduce((a,b) => a+b, 0) - 1) > 1e-12 || Math.abs(p.reduce((a,b) => a+b, 0) - 1) > 1e-12) {
    throw new RangeError('Use probability laws of the same length, with q strictly positive.');
  }
  return q.reduce((sum, weight, i) => sum - weight * Math.log(p[i]), 0);
}
