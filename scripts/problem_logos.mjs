// Regenerate the four reusable marks from the same registry the site reads.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { logoSvg } from './lib/logo-svg.mjs';
import { problemLogoArtwork } from './lib/problem-logo.mjs';

const registry = JSON.parse(readFileSync(new URL('../_data/problem_logos.json', import.meta.url), 'utf8'));
const root = new URL('../', import.meta.url);
for (const logo of Object.values(registry)) {
  if (!/^\/assets\/images\/problem-logos\/[a-z0-9-]+\.svg$/.test(logo.image)) throw new Error('Problem logos must use the shared asset directory.');
  const target = new URL(logo.image.slice(1), root);
  const slug = logo.image.split('/').at(-1).replace(/\.svg$/, '');
  mkdirSync(new URL('.', target), { recursive: true });
  writeFileSync(target, logoSvg(`problem-${slug}`, 'Woven loop', logo.image_alt, problemLogoArtwork(logo.crossings)));
}
