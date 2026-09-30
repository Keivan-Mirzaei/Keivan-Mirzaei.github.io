---
title: Random paths, reproducible experiments
description: An example project page connecting a mathematical question, an interactive experiment, and downloadable code and data.
kind: Demonstration project
status: Sample content
sample: true
order: 20
tags: [probability, simulation, reproducibility]
cover: /assets/figures/random-walk.svg
cover_alt: A fixed random walk with 256 scaled steps over the time interval from zero to one.
links:
  - label: Interactive exploration
    url: /notes/random-walks-at-two-scales/
  - label: Python code
    url: /assets/code/random_walk.py
  - label: Example data (CSV)
    url: /assets/data/random-walk.csv
---

## The question

How should the size of a random step change when we increase the number of steps but keep the total time fixed?

This demonstration treats a research page as a place to explain a question and let readers inspect the experiment. It connects a plain-language overview to code, data, and an interactive notebook entry.

## Experiment design

Start with independent fair steps, each equal to −1 or +1. Scale their sum by the square root of the total number of steps. Compare repeated paths on the same time interval, rather than selecting one especially striking path.

The downloadable Python program accepts a step count and a seed. The CSV contains one 256-step sample generated with seed 42 by that Python program. The browser uses a different generator, documented in the exploration, so its numbered paths differ.

## What this demonstration establishes

The variance calculation explains the scale: summing n independent unit-variance increments produces variance n, and division by the square root of n restores variance one.

A single plotted trajectory illustrates the construction. It does not establish convergence in distribution or verify a scientific hypothesis. A fuller investigation would compare endpoint distributions, path statistics, and approximation errors across many independent runs.

## Reproduce it

Download the Python file and run:

```sh
python3 random_walk.py --steps 256 --seed 42 > random-walk.csv
```

Change the seed to generate another path. Change the step count to examine a different resolution. The first column is time and the second is position; the initial row is (0, 0).
