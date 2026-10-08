// Original short tones: no sound downloads and no repeating alarm.
export const chimeOptions = [
  { id: 'soft', label: 'Soft chime' },
  { id: 'two-tone', label: 'Clear two-tone' },
  { id: 'bell', label: 'Low bell' }
];
const patterns = {
  soft: [
    { frequency: 660, delay: 0, duration: 1.25, level: .075 },
    { frequency: 990, delay: .025, duration: .9, level: .025 },
    { frequency: 1320, delay: 0, duration: .65, level: .012 }
  ],
  'two-tone': [
    { frequency: 523.25, delay: 0, duration: .4, level: .11 },
    { frequency: 783.99, delay: .45, duration: .65, level: .11 }
  ],
  bell: [
    { frequency: 392, delay: 0, duration: 1.65, level: .085 },
    { frequency: 784, delay: 0, duration: 1.1, level: .035 },
    { frequency: 1177, delay: 0, duration: .75, level: .015 }
  ]
};
export function chimeNotes(choice) { return patterns[choice] || patterns.soft; }
