---
title: Walking over a wave surface
description: Turn a function of two variables into a landscape you can rotate, inspect, and view from above.
format: exploration
category: experiments
tags: [multivariable calculus, 3D, visualization]
widgets: [scientific-plot]
math: true
sample: true
---

A function of one variable can be drawn as a curve. With two inputs, the output becomes a height above a plane. Here, the landscape is

$$
z=\sin(x)\cos(y),\qquad -\pi\leq x,y\leq\pi.
$$

The picture below is a static preview. Open the interactive version to turn it around, zoom, and inspect coordinates on the surface. Closing the view returns to the picture.

{% include widgets/scientific-plot.html id='wave-surface' title='A wave in two directions' description='Drag to rotate the surface, or use the view buttons below it.' figure='/assets/plots/wave-surface.json' dimensions=3 preview='/assets/figures/wave-surface.svg' alt='A wave surface with alternating peaks and valleys. Heights range from minus one to one over the square from minus pi to pi in x and y.' %}

## Follow a straight path

Keep y = 0 and walk in the x direction. You are following $$z=\sin(x)$$. Now keep y = π/2: your entire path has height zero, because $$\cos(\pi/2)=0$$.

The surface holds both curves at once. Rotating the picture changes your viewpoint, but not the function.

| x | y | Height z |
| --- | --- | --- |
| 0 | 0 | 0 |
| π/2 | 0 | 1 |
| −π/2 | 0 | −1 |
| π/2 | π/2 | 0 |
| π/2 | π | −1 |

## Make a prediction

What happens to the height if you replace x by −x? What if you replace y by −y? Use symmetry to predict the answer, then inspect opposite points on the graph.

<details markdown="1">
<summary>Check the symmetries</summary>

Sine is odd, so replacing x by −x reverses the height. Cosine is even, so replacing y by −y leaves it unchanged.

</details>

## A sampled picture

The graph uses 41 samples in each direction. Between samples, the renderer joins nearby points into a surface. Hovered values describe this numerical representation; the formula is the exact definition.

The downloadable plot data contains the coordinates and display settings. The calculation can be performed before publishing; the browser handles the exploration. For a different kind of graph, try [the phase portrait of a damped oscillator]({{ '/notes/damped-oscillator/' | relative_url }}).
