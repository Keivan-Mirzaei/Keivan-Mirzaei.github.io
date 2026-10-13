---
title: "Three utilities: from the plane to a mug"
description: "Connect three houses to gas, water, and electricity. The plane refuses—but a mug, a donut, and a square with joined edges reveal a way through."
date: 2026-10-01 22:17:46 -0600
format: exploration
image: /assets/images/exploration-thumbnails/three-utilities.svg
image_alt: Nine pipes connect three houses to three utilities on a square with matching opposite sides representing a torus.
tags: [topology, graph theory, puzzles]
math: true
widgets: [three-utilities]
---

Three houses each need **gas, water, and electricity**. Can we draw all nine pipes **on the plane without crossings**?

Pipes may bend and meet at a shared endpoint. They cannot overlap, cross, or pass through another house or utility. No tunnels or bridges are allowed.

Explore **Try it on the plane** below and its Info panel. The eight-connection example leaves one pipe missing: does rerouting seem to make room for it?

{% include widgets/three-utilities-plane.html %}

A failed drawing does not settle the question. Perhaps a different arrangement would work. We need an obstruction that applies to every arrangement.

## Count regions instead of trying more routes

Replace the houses and utilities by vertices, and the pipes by edges. The graph is $$K_{3,3}$$: two groups of three vertices, with every vertex in one group connected to every vertex in the other. It has $$V=6$$ vertices and $$E=9$$ edges.

A crossing-free drawing of a connected graph in the plane satisfies Euler’s formula

$$
V-E+F=2,
$$

where $$F$$ includes the unbounded outside region. Our drawing would therefore have five regions.

Every region needs at least four edge-sides around its boundary. There are no loops or parallel edges. Every cycle alternates between houses and utilities, so it has even length and cannot be a triangle. Nor is any edge a bridge: each belongs to a four-edge cycle. A two-sided boundary from retracing a bridge is therefore impossible too.

Each edge supplies two sides to region boundaries. Nine edges supply eighteen sides, while five regions require at least twenty:

$$
2E\geq4F\qquad\Longrightarrow\qquad18\geq20.
$$

**No planar drawing exists.** Moving the endpoints or making the pipes curvier cannot change this count. The difficulty in the [plane experiment](#tu-plane-title) comes from the surface itself.

## What changes on a mug?

Put the same houses and utilities on the **whole boundary surface of a thick mug with one handle**: outside, inside, rim, underside, and handle. Its bowl has a bottom; the opening is an indentation, while the handle supplies one through-hole.

That surface can be continuously reshaped into a donut, or **torus**, without cutting or joining it. The [surface transformation](#tu-surface-title) follows the hole through the change.

{% include widgets/three-utilities-surface.html %}

The first stage only deforms the surface. The later stages **cut it open** so we can work with a flat picture: open the ring into a tube, slit the tube lengthwise, and flatten it into a rectangle, then a square.

The cut edges retain their original pairings. Recovering the torus means identifying

<div id="torus-identifications" markdown="1">

$$
\begin{gathered}
(x,0)\sim(x,1),\\
(0,y)\sim(1,y).
\end{gathered}
\tag{1}
$$

</div>

Top matches bottom at the same horizontal position; left matches right at the same vertical position. No edge is reversed. Leaving through one side and returning through its partner is a continuous journey on the torus.

## Use the joined edges for the missing pipes

Seven pipes stay inside the square. The remaining two use the [edge pairings (1)](#torus-identifications).

{% include widgets/three-utilities-square.html %}

In [the figure](#tu-square-title), **House 1 → Water** continues from the top to the matching point on the bottom. **House 3 → Gas** continues from the right to the matching point on the left. Each pair of seam dots represents one point of the torus, rather than a gap in a pipe.

All nine routes now join the required endpoints without crossings. Their seam continuations use distinct points, so joining the edges introduces no new intersection. Reshaping the torus back into the mug carries the pipes with it.

The handle has changed which routes are available. The planar counting obstruction still holds on the plane; the mug admits a drawing because its surface is different.

John M. Lee’s [*Introduction to Topological Manifolds*, opening chapter](https://sites.math.washington.edu/~lee/Books/ITM/c01.pdf), illustrates the coffee-cup–torus deformation and introduces the distinction between shape and topology.
