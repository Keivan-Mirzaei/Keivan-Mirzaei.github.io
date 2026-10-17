"""Generate the two original noise loops offline, rather than in each visitor's page."""
from array import array
from pathlib import Path
import math
import random
import sys
import wave


def build(folder):
    rate, seconds, overlap = 24000, 20, 48000
    for kind, cutoff in [('brown', 800), ('soft', 1800)]:
        rng = random.Random(20261016)
        previous = filtered = 0.0
        alpha = 1 - math.exp(-2 * math.pi * cutoff / rate)
        samples = []
        for _ in range(rate * seconds):
            white = rng.random() * 2 - 1
            previous = (previous + .02 * white) / 1.02
            value = previous * 3.5 if kind == 'brown' else white * .45
            filtered += alpha * (value - filtered)
            samples.append(filtered)
        length = len(samples) - overlap
        loop = samples[overlap:length]
        for i in range(overlap):
            angle = i / (overlap - 1) * math.pi / 2
            loop.append(samples[length + i] * math.cos(angle) + samples[i] * math.sin(angle))
        pcm = array('h', (round(max(-1, min(1, value)) * 32767) for value in loop))
        if sys.byteorder != 'little':
            pcm.byteswap()
        with wave.open(str(folder / f'{kind}.wav'), 'wb') as output:
            output.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
            output.writeframes(pcm.tobytes())


if __name__ == '__main__':
    build(Path(__file__).resolve().parents[1] / 'assets/audio/ambient')
