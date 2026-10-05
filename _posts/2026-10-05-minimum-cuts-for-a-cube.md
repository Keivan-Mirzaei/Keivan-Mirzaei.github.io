---
title: "Cutting a cube"
description: "How many straight cuts does it take to separate a cube into 27 unit cubes, even if you can rearrange the pieces?"
date: 2026-10-05
permalink: /notes/minimum-cuts-for-a-cube/
format: problem
difficulty: 2
tags: [geometry, puzzles]
math: true
widgets: [cube-cuts]
---

A solid $$3\times3\times3$$ cube consists of 27 unit cubes joined together, like an idealized Rubik’s Cube. What is the **minimum number of straight planar cuts** needed to separate all 27 cubes?

You may rearrange and stack the pieces between cuts, but each unit cube must remain intact.

<figure class="cube-cuts-problem-figure">
  <img src="{{ '/assets/figures/cube-cuts-whole.svg' | relative_url }}" alt="A cube with each visible face divided into a three-by-three grid, representing 27 joined unit cubes." width="640" height="460">
</figure>

<!-- hint -->

Which unit cube is hardest to free?

<!-- solution -->

Look at the **middle cube**. It has six neighbours, one sharing each of its six faces. To free it, all six shared faces must be cut.

A straight planar cut can run along **at most one** of these faces, since no two lie in the same plane. Rearranging or stacking the pieces does not change this: the middle cube still needs a separate cut along each face. Thus, at least **six cuts** are necessary.

Six cuts also suffice: make two parallel cuts in each of the three directions, along the unit-cube boundaries. This separates the original cube into all 27 unit cubes.

The minimum is therefore $$\boxed{6}$$.

{% include widgets/cube-cuts.html id='cube-cuts-proof' %}
