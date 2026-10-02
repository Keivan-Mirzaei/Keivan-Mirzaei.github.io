// Dense branches are represented explicitly. Floating-point coordinates are never
// classified as rational or irrational; each sample is assigned its intended branch.
export const MODELS = {
  square: { equation: 'f(x) = x², at a = 1', slope: 2 },
  absolute: { equation: 'f(x) = |x|, at a = 0', slope: 0 },
  oscillation: { equation: 'f(x) = x² sin(1/x), f(0) = 0, at a = 0', slope: 0 },
  'rational-square': { equation: 'f(x) = x² 1ℚ(x), at a = 0', slope: 0 },
  'rational-linear': { equation: 'f(x) = x 1ℚ(x), at a = 0', slope: 0 },
};

export function magnifiedValue(model, u, radius, branch = 'rational') {
  switch (model) {
    case 'square': return 2 * u + radius * u * u;
    case 'absolute': return Math.abs(u);
    case 'oscillation': return u === 0 ? 0 : radius * u * u * Math.sin(1 / (radius * u));
    case 'rational-square': return branch === 'rational' ? radius * u * u : 0;
    case 'rational-linear': return branch === 'rational' ? u : 0;
    default: throw new Error(`Unknown model: ${model}`);
  }
}

// An upper bound on sup |(f(a + ρu) - f(a))/ρ - Lu|, |u| ≤ 1.
// It is exact for all models except the oscillation example.
export function errorBound(model, radius, slope) {
  switch (model) {
    case 'square': return Math.abs(2 - slope) + radius;
    case 'absolute': return 1 + Math.abs(slope);
    case 'oscillation':
    case 'rational-square': return Math.abs(slope) + radius;
    case 'rational-linear': return Math.max(Math.abs(slope), Math.abs(1 - slope));
    default: throw new Error(`Unknown model: ${model}`);
  }
}
