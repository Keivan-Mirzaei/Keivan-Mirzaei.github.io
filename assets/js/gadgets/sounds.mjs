export const sounds = Object.freeze({
  jungle: { label: 'Jungle', description: 'Birds and insects in the canopy.', file: 'jungle.mp3' },
  rain: { label: 'Rain', description: 'Steady rainfall.', file: 'rain.mp3' },
  river: { label: 'River', description: 'Flowing water over stones.', file: 'river.mp3' },
  wind: { label: 'Wind', description: 'A slow, airy swell.', file: 'wind.mp3' },
  brown: { label: 'Brown noise', description: 'A low, soft rumble.', file: 'brown.wav' },
  soft: { label: 'Soft noise', description: 'A gentle, even hush.', file: 'soft.wav' }
});
export const validSound = value => Object.hasOwn(sounds, value);
export const soundChoice = value => validSound(value) ? value : 'brown';
