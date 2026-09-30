---
title: "The average distance across a circle"
description: "Choose two points uniformly on a unit circle. What is their expected straight-line distance?"
format: problem
tags: [probability, geometry, expectation]
math: true
---

Choose two points independently and uniformly on the circumference of a circle of radius $$1$$.

What is the expected value—the average—of the straight-line distance between the two points?

![Two points A and B on a unit circle, joined by a chord. A dashed radius from the center O to A is labeled 1.]({{ '/assets/figures/unit-circle-chord.svg' | relative_url }})

The distance is measured along the chord joining the points, rather than along the circumference.

<!-- solution -->

**The expected distance is $$4/\pi\approx1.273$$.**

Let $$\theta\in[0,\pi]$$ be the smaller central angle between the two points. After fixing the first point, the second point's angle relative to it is uniform on $$[0,2\pi)$$. Folding the two halves of this interval onto $$[0,\pi]$$ shows that $$\theta$$ is uniform there, with density $$1/\pi$$. The answer is the same whichever first point we fix, by rotational symmetry.

The two radii and the chord form an isosceles triangle. Bisecting it gives a right triangle with hypotenuse 1 and angle $$\theta/2$$, so the chord length is

$$
D=2\sin\!\left(\frac{\theta}{2}\right).
$$

Averaging this length over the uniform angle gives

$$
\begin{aligned}
\mathbb E[D]
&=\frac{1}{\pi}\int_0^\pi2\sin\!\left(\frac{\theta}{2}\right)\,d\theta\\
&=\frac{1}{\pi}\left[-4\cos\!\left(\frac{\theta}{2}\right)\right]_0^\pi\\
&=\boxed{\frac{4}{\pi}}.
\end{aligned}
$$

For a circle of radius $$R$$, all distances scale by $$R$$, and the same calculation gives $$4R/\pi$$.
