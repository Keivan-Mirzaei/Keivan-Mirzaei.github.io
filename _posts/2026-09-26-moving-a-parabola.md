---
title: Move a parabola, one parameter at a time
description: Predict a graph’s movement, test it with sliders, and learn to read its vertex directly from an equation.
format: module
category: math
tags: [algebra, functions, graphing]
duration: 15 minutes
level: Introductory
prerequisites: [Coordinates, Squaring a number]
objectives:
  - Locate the vertex from an equation in vertex form.
  - Distinguish changes in position from changes in shape.
  - Explain why a zero leading coefficient is a special case.
widgets: [quadratic]
math: true
sample: true
---

## 1. Start with a prediction

The basic parabola is $$y=x^2$$. Its lowest point is the origin. Squaring numbers on either side of zero gives the same height, so the curve is symmetric about the vertical axis.

We will change it to

$$
y=a(x-h)^2+k.
$$

Before moving the controls, predict what happens when $$h=2$$ and $$k=1$$, with $$a=1$$. Which point becomes the lowest point?

## 2. Change just one thing

{% include widgets/quadratic.html id='parabola-lesson' %}

1. Set **h to 2**. Compare your curve with the dashed original.
2. Set **k to 1**. Read the new vertex in the description under the sliders.
3. Keep h and k fixed. Change **a to −1**. What stays in the same place?
4. Open the values table. Check the equation at x = 0 by hand.

<details markdown="1">
<summary>Check your prediction</summary>

For a = 1, h = 2, and k = 1, the lowest point is (2, 1). The squared expression becomes zero at x = 2. Changing a to −1 keeps that vertex but makes it the highest point instead.

</details>

## 3. Read the equation as instructions

- **h** places the vertex horizontally. The minus sign in `(x − h)` is why positive h moves the curve to the right.
- **k** places it vertically.
- **a** stretches or compresses heights relative to the vertex. Its sign tells you whether the curve opens up or down.

At $$a=0$$ the squared term disappears. You get the horizontal line $$y=k$$, with no unique vertex. Try it: the activity treats this case separately.

## 4. Solve the reverse problem

Construct a parabola with vertex (−2, 1) that opens downward and passes through (0, −3). First reason on paper, then use the sliders to check.

<details markdown="1">
<summary>Compare with a worked answer</summary>

The vertex gives h = −2 and k = 1. Substituting (0, −3) gives −3 = 4a + 1, so a = −1. The equation is $$y=-(x+2)^2+1$$.

</details>

Next, explore what a graph can tell us about a rate of change in [From a secant to a tangent]({{ '/notes/secant-to-tangent/' | relative_url }}).
