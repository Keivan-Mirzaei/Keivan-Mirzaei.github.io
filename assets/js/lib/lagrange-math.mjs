export const DEFAULT_STATE = Object.freeze({ theta: 90, phi: 0, azimuth: 45, elevation: 35 });
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const objective = (x, y) => (x - 2) ** 2 + 4 * y * y;
export const constraint = (x, y) => x * x + 2 * y * y;
export const objectiveGradient = (x, y) => [2 * (x - 2), 8 * y];
export const constraintGradient = (x, y) => [2 * x, 4 * y];

export function normalizeAngle(degrees) { const angle = degrees % 360; return angle < 0 ? angle + 360 : angle; }

export function constraintPoint(degrees, level = 1) {
  const theta=normalizeAngle(degrees), angle=theta*Math.PI/180;
  const cardinal=[[1,0],[0,1],[-1,0],[0,-1]];
  const [c,s]=theta%90===0 ? cardinal[theta/90] : [Math.cos(angle),Math.sin(angle)];
  const r=Math.sqrt(level/(c*c+2*s*s));
  return [r*c,r*s];
}

export function objectiveContour(degrees, level) {
  const angle=degrees*Math.PI/180, radius=Math.sqrt(level);
  return [2+radius*Math.cos(angle),radius*Math.sin(angle)/2];
}

function geometry(theta) {
  const point=constraintPoint(theta), gradF=objectiveGradient(...point), gradG=constraintGradient(...point);
  const normF=Math.hypot(...gradF), normG=Math.hypot(...gradG);
  const normal=gradG.map(value=>value/normG), tangent=[-normal[1],normal[0]];
  return {point,gradF,gradG,normF,normG,normal,tangent};
}

export const MINIMUM_ANGLE=0;
export const MAXIMUM_ANGLE=180;

export function ascentAngle(state, kind) {
  const gradient=kind==='f'?state.gradF:state.gradG;
  return Math.atan2(dot(gradient,state.normal),dot(gradient,state.tangent))*180/Math.PI;
}

export function sectionState(theta = DEFAULT_STATE.theta, phi = DEFAULT_STATE.phi) {
  if (!Number.isFinite(theta) || !Number.isFinite(phi)) throw new TypeError('Angles must be finite.');
  const normalized = normalizeAngle(theta), rotation = phi * Math.PI / 180;
  const stationary = normalized === MINIMUM_ANGLE ? 'minimum' : normalized === MAXIMUM_ANGLE ? 'maximum' : null;
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

export function crossEntropy(q, p) {
  if (q.length !== p.length || q.length < 2 || q.some(x => !Number.isFinite(x) || !(x > 0)) || p.some(x => !Number.isFinite(x) || x < 0)
    || Math.abs(q.reduce((a,b) => a+b, 0) - 1) > 1e-12 || Math.abs(p.reduce((a,b) => a+b, 0) - 1) > 1e-12) {
    throw new RangeError('Use probability laws of the same length, with q strictly positive.');
  }
  return q.reduce((sum, weight, i) => sum - weight * Math.log(p[i]), 0);
}
