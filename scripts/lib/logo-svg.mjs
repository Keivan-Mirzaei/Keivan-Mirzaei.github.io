// Shared document format for self-contained content logos.
export const LOGO_STYLE = Object.freeze({
  width: 440, height: 410, paper: '#fcfcf9', green: '#285b46',
});

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

export function logoSvg(slug, title, description, artwork) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use a stable, hyphenated logo slug.');
  const { width, height, paper } = LOGO_STYLE;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${slug}-title ${slug}-description">
  <title id="${slug}-title">${escape(title)}</title>
  <desc id="${slug}-description">${escape(description)}</desc>
  <rect width="${width}" height="${height}" fill="${paper}"/>
  ${artwork}
</svg>\n`;
}
