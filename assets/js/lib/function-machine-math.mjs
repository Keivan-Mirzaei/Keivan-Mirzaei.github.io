import { formatNumber } from './widget-math.mjs';

// Exact arithmetic keeps a decimal close to 1 distinct from the excluded input.
function rational(numerator, denominator) {
  if (denominator === 0n) return null;
  if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
  let a = numerator < 0n ? -numerator : numerator;
  let b = denominator;
  while (b !== 0n) [a, b] = [b, a % b];
  return { numerator: numerator / a, denominator: denominator / a };
}

function decimal(text) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const negative = text.startsWith('-');
  const unsigned = text.replace(/^[+-]/, '');
  const [whole, fraction = ''] = unsigned.split('.');
  const numerator = BigInt((whole || '0') + fraction) * (negative ? -1n : 1n);
  return rational(numerator, 10n ** BigInt(fraction.length));
}

export function parseMachineInput(text) {
  const input = text.trim().replaceAll('−', '-');
  if (!input || input.length > 120) return null;
  const parts = input.split('/').map(part => part.trim());
  if (parts.length > 2) return null;
  const top = decimal(parts[0]);
  if (!top) return null;
  if (parts.length === 1) return top;
  const bottom = decimal(parts[1]);
  if (!bottom || bottom.numerator === 0n) return null;
  return rational(top.numerator * bottom.denominator, top.denominator * bottom.numerator);
}

export function evaluateMachine(text) {
  const value = parseMachineInput(text);
  if (!value) return { state: text.trim() ? 'invalid' : 'empty', output: text.trim() ? 'Enter a number' : '—' };
  const { numerator, denominator } = value;
  // The logarithm requires 1 - x² > 0, checked without rounding the input.
  if (numerator <= -denominator || numerator >= denominator) {
    return { state: 'undefined', output: 'Undefined' };
  }
  const argument = rational(denominator * denominator - numerator * numerator, denominator * denominator);
  if (numerator === 0n) return { state: 'defined', output: '0', value: 0 };
  const x = Number(numerator) / Number(denominator);
  // log1p preserves small nonzero results near x = 0. Near ±1, use the
  // positive argument computed above rather than subtracting rounded squares.
  const result = Math.abs(x) <= 0.5
    ? Math.log1p(-x * x)
    : Math.log(Number(argument.numerator) / Number(argument.denominator));
  return { state: 'defined', output: `≈ ${formatNumber(result)}`, value: result };
}
