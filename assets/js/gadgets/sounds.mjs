export const sounds = Object.freeze({
  jungle: { label: 'Jungle', description: 'Birds and insects in the canopy.', file: 'jungle.mp3' },
  rain: { label: 'Rain', description: 'Steady rainfall.', file: 'rain.mp3' },
  river: { label: 'River', description: 'Flowing water over stones.', file: 'river.mp3' },
  wind: { label: 'Wind', description: 'A slow, airy swell.', file: 'wind.mp3' },
  brown: { label: 'Brown noise', description: 'A low, soft rumble.' },
  soft: { label: 'Soft noise', description: 'A gentle, even hush.' }
});
export const validSound = value => Object.hasOwn(sounds, value);
export const soundChoice = value => validSound(value) ? value : 'brown';

// Overlap the actual ending and opening audio, then omit the reused opening.
// Equal-power mixing avoids the quiet dip of a fade out followed by a fade in.
export function seamlessLoop(audio, input, overlapSeconds = 4) {
  const overlap = Math.min(Math.floor(input.sampleRate * overlapSeconds), Math.floor(input.length / 4));
  if (overlap < 2) return input;
  const length = input.length - overlap, result = audio.createBuffer(input.numberOfChannels, length, input.sampleRate);
  for (let channel = 0; channel < input.numberOfChannels; channel++) {
    const original = input.getChannelData(channel), data = result.getChannelData(channel);
    data.set(original.subarray(overlap, length));
    for (let i = 0; i < overlap; i++) {
      const angle = i / (overlap - 1) * Math.PI / 2;
      data[length - overlap + i] = original[length + i] * Math.cos(angle) + original[i] * Math.sin(angle);
    }
  }
  return result;
}

export function noiseBuffer(audio, kind, random = Math.random) {
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 60), audio.sampleRate), data = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < data.length; i++) {
    const white = random() * 2 - 1;
    previous = (previous + .02 * white) / 1.02;
    data[i] = kind === 'brown' ? previous * 3.5 : white * .45;
  }
  return seamlessLoop(audio, buffer, 2);
}
