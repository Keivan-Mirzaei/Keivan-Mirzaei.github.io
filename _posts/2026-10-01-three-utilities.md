---
title: "Three utilities: from the plane to a mug"
description: "Connect three houses to gas, water, and electricity. The plane refuses—but a mug, a donut, and a square with joined edges reveal a way through."
date: 2026-10-01 22:17:46 -0600
format: problem
tags: [topology, graph theory, puzzles]
math: true
widgets: [three-utilities]
---

Three houses each need **gas, water, and electricity**. Draw a separate pipe from every house to every utility: nine pipes in all.

Can you do it **on the plane without any pipes crossing**?

Pipes can bend as much as you like. They may meet at a shared house or utility, but cannot cross, overlap, or pass through another house or utility as a junction. No tunnels, bridges, or trips above the surface are allowed.

{% include widgets/three-utilities-plane.html %}

If you get stuck, choose **Try eight connections**. Only one pipe remains. Is there somewhere else it could go—or is the surface itself the problem?

<!-- solution -->

## Why the plane refuses

Replace each house and utility by a dot, and each pipe by a curve. This gives the graph $$K_{3,3}$$: two groups of three vertices, with every vertex in one group joined to every vertex in the other. It has **six vertices and nine edges**.

Suppose a drawing with no crossings existed. Euler’s formula for a connected graph on the plane says

$$V-E+F=2,$$

where $$F$$ counts the regions, **including the unbounded outside region**. Our drawing would therefore have

$$F=2-6+9=5.$$

Every region must have at least **four edge-sides** around its boundary. There are no loops or parallel edges, and no triangles: every step alternates between a house and a utility, so every cycle has even length. There are also no bridges—each pipe lies on a four-edge cycle—so a two-sided region cannot arise by going out and back along a bridge.

Each edge contributes two sides to region boundaries. Nine edges supply **18 sides**, but five regions would need at least **20**:

$$2E\geq 4F\qquad\Longrightarrow\qquad18\geq20.$$

That is impossible. Curvier pipes, moving the houses, or using more of the plane cannot fix it. The obstruction applies to every planar drawing, not just the routes in the activity.

## The same question, on a mug

Now put the houses and utilities **on the surface of a mug**. Can all nine pipes stay on that surface without crossing?

Imagine a thick ceramic mug with one ordinary handle. Use its **whole boundary surface**: outside, inside, rim, underside, and handle. The bowl has a bottom; its opening is an indentation, not a second hole all the way through. The handle contributes the one through-hole.

Topology lets us stretch and reshape a surface while preserving which points are connected. Round the mug’s body, shrink its bowl-shaped indentation, and enlarge the handle opening. The surface can become a **donut**, or **torus**, without cutting or gluing it.

Move the slider slowly, or play the transformation. Keep your eye on the purple opening.

{% include widgets/three-utilities-surface.html %}

The first step changes only the shape. The next two steps **cut the torus open to draw it flat**. First cut around the tube and straighten the ring into an open tube. Then slit the tube along its length and flatten it. Stretch the resulting rectangle into a square.

The cuts create pairs of edges that belonged together. To recover the torus, identify

$$ (x,0)\sim(x,1),\qquad (0,y)\sim(1,y). $$

In ordinary words: **top matches bottom at the same horizontal position; left matches right at the same vertical position**. The arrows on each pair point the same way. No edge is flipped.

## Solve it on the square

Start with seven pipes. Then add the last two, one at a time.

{% include widgets/three-utilities-square.html %}

The **House 1 → Water** pipe leaves through the top and continues from the matching point on the bottom. The **House 3 → Gas** pipe leaves through the right and continues from the matching point on the left. The paired dots are not gaps in the pipes: each pair represents **one point of the torus**.

All nine pipes now connect their required endpoints. None crosses another pipe in the square, and the two seam continuations occur at distinct points. Gluing the edges therefore gives a valid drawing on the donut. Reshaping the donut back into a mug carries the drawing with it and preserves the absence of crossings.

Return to the transformation and select **Carry the nine pipes**. Move from the square back to the donut to watch the split routes join. Some pipes move behind the surface and disappear from view; that is occlusion, not a crossing. The flat square is where you can inspect every route at once.

**The answer changes because the surface changes.** On the plane there is no way to fit the ninth pipe. On the mug, its handle gives the routes room to go around the obstruction.

For more about deforming a coffee cup into a torus, see the opening chapter of John M. Lee’s [*Introduction to Topological Manifolds*](https://sites.math.washington.edu/~lee/Books/ITM/c01.pdf).
