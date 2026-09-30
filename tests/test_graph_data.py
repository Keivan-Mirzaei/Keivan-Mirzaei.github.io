"""Check scientific data against properties independent of the plotting code."""

import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('graph_data', ROOT / 'scripts/graph_data.py')
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)


class GraphData(unittest.TestCase):
    def test_wave_known_values(self):
        surface = data.wave_surface()['data'][0]
        self.assertEqual(len(surface['z']), 41)
        self.assertEqual(surface['z'][20][30], 1)
        self.assertEqual(surface['z'][20][10], -1)
        self.assertTrue(all(row[20] == 0 for row in surface['z']))
        self.assertTrue(all(-1 <= value <= 1 for row in surface['z'] for value in row))

    def test_oscillator_energy_decreases_and_initial_conditions_match(self):
        traces = data.oscillator()['data']
        for curve, start in zip(traces[::2], traces[1::2]):
            self.assertEqual([curve['x'][0], curve['y'][0]], [start['x'][0], start['y'][0]])
            energies = [(x*x + y*y)/2 for x, y in zip(curve['x'], curve['y'])]
            self.assertTrue(all(after <= before + 2e-6 for before, after in zip(energies, energies[1:])))
            self.assertLess(energies[-1], energies[0] / 1000)


if __name__ == '__main__':
    unittest.main()
