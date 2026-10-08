// Original short signals: no sound downloads or continuous alarm.
export const chimeOptions = [
  { id: 'soft', label: 'Soft chime' },
  { id: 'two-tone', label: 'Clear two-tone' },
  { id: 'bell', label: 'Low bell' }
];
const patterns = {
  soft: [
    { frequency: 660, delay: 0, duration: 1.4, level: .2, hold: .1 },
    { frequency: 990, delay: .025, duration: 1, level: .065 },
    { frequency: 1320, delay: 0, duration: .75, level: .035 }
  ],
  'two-tone': [
    { frequency: 523.25, delay: 0, duration: .42, level: .28, hold: .23, waveform: 'triangle' },
    { frequency: 783.99, delay: .48, duration: .5, level: .28, hold: .28, waveform: 'triangle' },
    { frequency: 523.25, delay: 1.25, duration: .42, level: .28, hold: .23, waveform: 'triangle' },
    { frequency: 783.99, delay: 1.73, duration: .5, level: .28, hold: .28, waveform: 'triangle' }
  ],
  bell: [
    { frequency: 392, delay: 0, duration: 2, level: .24, hold: .08 },
    { frequency: 784, delay: 0, duration: 1.35, level: .08 },
    { frequency: 1177, delay: 0, duration: .9, level: .04 }
  ]
};
export function chimeNotes(choice) { return Object.hasOwn(patterns, choice) ? patterns[choice] : patterns.soft; }
