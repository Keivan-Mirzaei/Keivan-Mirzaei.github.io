// Display rounding never feeds back into evaluation or geometric state.
export function numberParts(value, digits = 3) {
  if (!Number.isFinite(value)) return { text: 'Undefined', coefficient: null, exponent: null };
  if (value === 0) return { text: '0', coefficient: '0', exponent: null };
  const rounded = Number(value.toPrecision(digits));
  if (Math.abs(rounded) >= .001 && Math.abs(rounded) < 10000) {
    const text = rounded.toString().replace('-', '−');
    return { text, coefficient: text, exponent: null };
  }
  const [coefficient, exponent] = (Number.isFinite(rounded) ? rounded : value).toExponential(digits - 1).split('e');
  return { text: `${coefficient.replace('-', '−')} × 10`, coefficient: coefficient.replace('-', '−'), exponent: Number(exponent) };
}
const superscripts = { '-':'⁻', '0':'⁰', '1':'¹', '2':'²', '3':'³', '4':'⁴', '5':'⁵', '6':'⁶', '7':'⁷', '8':'⁸', '9':'⁹' };
export function formatNumber(value, digits = 3) {
  const parts = numberParts(value, digits);
  return parts.exponent === null ? parts.text : parts.text + String(parts.exponent).split('').map(char => superscripts[char]).join('');
}
export function numberMarkup(value, approximate = false, digits = 3) {
  const parts = numberParts(value, digits);
  if (parts.coefficient === null) return 'Undefined';
  const body = parts.exponent === null ? `<mn>${parts.text}</mn>` : `<mn>${parts.coefficient}</mn><mo>×</mo><msup><mn>10</mn><mn>${String(parts.exponent).replace('-', '−')}</mn></msup>`;
  return `<math xmlns="http://www.w3.org/1998/Math/MathML">${approximate && value !== 0 ? '<mo>≈</mo>' : ''}${body}</math>`;
}
