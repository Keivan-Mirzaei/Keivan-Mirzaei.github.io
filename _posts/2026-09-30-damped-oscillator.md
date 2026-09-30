---
title: Watching an oscillator lose energy
description: Follow several trajectories through a phase plane and compare position with velocity.
format: exploration
category: code
tags: [differential equations, scientific computing, phase portraits]
widgets: [scientific-plot]
math: true
sample: true
---

A graph of position against time tells one story. A **phase portrait** plots velocity against position and shows how a system moves through its possible states.

Consider the damped oscillator

$$
x''+0.4x'+x=0.
$$

Four different starting states produce the paths below. Each path spirals toward the equilibrium at (0, 0). Open the graph to zoom into the center, pan, and inspect points.

{% include widgets/scientific-plot.html id='oscillator' title='Position versus velocity' description='Each colored curve starts from a different initial state and runs for 24 time units.' figure='/assets/plots/damped-oscillator.json' preview='/assets/figures/damped-oscillator.svg' alt='Four damped-oscillator trajectories spiraling inward toward zero position and zero velocity. Their initial states are marked with dots.' %}

## Which direction does the motion follow?

On the horizontal axis, velocity is zero. To the right of the origin, acceleration is negative, so a trajectory turns downward. Above the horizontal axis, velocity is positive, so position increases. Together these observations give clockwise motion.

## Why does the spiral shrink?

Write v = x′ and define the energy-like quantity $$E=(x^2+v^2)/2$$. Along a solution,

$$
\frac{dE}{dt}=xx'+vv'=xv+v(-x-0.4v)=-0.4v^2\leq0.
$$

The system loses energy whenever it is moving. The numerical curves illustrate this statement; the derivative calculation explains it.

## Reproduce the curves

The data is sampled from the exact solution, with $$\omega=\sqrt{0.96}$$:

$$
x(t)=e^{-0.2t}\left[x_0\cos(\omega t)+\frac{v_0+0.2x_0}{\omega}\sin(\omega t)\right].
$$

| Initial position | Initial velocity | Initial energy |
| --- | --- | --- |
| 2 | 0 | 2 |
| 0 | 2 | 2 |
| −1.5 | 0.5 | 1.25 |
| 0.5 | −1.5 | 1.25 |

[Download the Python generator]({{ '/assets/code/advanced_graph_data.py' | relative_url }}). It creates the plot data using only Python’s standard library. This is also an example of keeping the calculation outside the browser while retaining interactive exploration on the website.
