---
title: "The average distance across a circle"
description: "Choose two points uniformly on a unit circle. What is their expected straight-line distance?"
format: problem
difficulty: 2
tags: [probability, geometry, expectation]
math: true
---

Choose two points independently and uniformly on a circle of radius $$1$$. What is their expected straight-line distance?

<figure class="problem-figure">
  <img src="{{ '/assets/figures/unit-circle-chord.svg' | relative_url }}" alt="Points A and B on a unit circle, joined by their straight-line chord. The radius OA has length 1." width="340" height="330">
</figure>

<!-- hint -->

Fix one point by rotational symmetry and average over the angle of the other.

<!-- solution -->

By rotational symmetry, fix the first point. The angle $$\theta$$ of the second point relative to it is uniform on $$[0,2\pi)$$. The cosine rule gives the chord length

$$
D=\sqrt{2-2\cos\theta}=2\sin\frac{\theta}{2},
$$

where the sine is nonnegative on this interval. Therefore,

$$
\begin{aligned}
\mathbb E[D]
&=\frac{1}{2\pi}\int_0^{2\pi}2\sin\frac{\theta}{2}\,d\theta\\
&=\frac{4}{\pi}.
\end{aligned}
$$
