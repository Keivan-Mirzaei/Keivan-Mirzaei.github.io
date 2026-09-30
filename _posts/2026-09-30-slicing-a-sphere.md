---
title: What shape does a plane cut from a sphere?
description: Move a plane through a sphere, predict the cross-section, and connect a 3D picture to a simple equation.
format: module
category: math
tags: [geometry, 3D, multivariable calculus]
duration: 15 minutes
level: Introductory
prerequisites: [Coordinates in three dimensions, The equation of a circle]
objectives:
  - Find the radius of a horizontal cross-section of a unit sphere.
  - Distinguish a circle, a tangent point, and an empty intersection.
  - Explain why changing the viewpoint does not change the geometry.
widgets: [sphere-slice]
math: true
sample: true
---

## 1. Predict the cross-section

The unit sphere satisfies $$x^2+y^2+z^2=1$$. A horizontal plane has equation $$z=h$$.

What shape is their intersection at h = 0? What happens as the plane moves upward? Predict the result at h = 1 and at h = 1.2 before opening the activity.

## 2. Move the plane

{% include widgets/sphere-slice.html id='sphere-lesson' %}

Try h = 0, 0.6, 1, and 1.2. Rotate the view to separate the plane from the sphere visually. Then move the plane below the center: do equal positive and negative heights give equal circles?

## 3. Explain what you see

Substitute z = h into the sphere’s equation:

$$
x^2+y^2=1-h^2.
$$

When $$\lvert h\rvert<1$$, this is a circle of radius $$\sqrt{1-h^2}$$. When $$\lvert h\rvert=1$$, only x = y = 0 remains: the plane touches at a single point. When $$\lvert h\rvert>1$$, the right side is negative, so there is no real intersection.

| Plane height | Cross-section |
| --- | --- |
| 0 | Circle of radius 1 |
| ±0.6 | Circle of radius 0.8 |
| ±1 | A single point |
| ±1.2 | No intersection |

## 4. Work backward

At which heights does the cross-section have **half the area** of the equatorial circle?

<details markdown="1">
<summary>Compare your reasoning</summary>

The area is $$\pi(1-h^2)$$, and the equatorial area is π. Solving $$1-h^2=1/2$$ gives $$h=\pm1/\sqrt2$$, approximately ±0.707. The slider uses steps of 0.02, so nearby settings give an approximation rather than this exact height.

</details>

The camera changes what you see on the screen. The height changes the mathematical object being studied. Keep those two actions distinct when explaining your observations.
