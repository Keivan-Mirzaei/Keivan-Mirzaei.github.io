---
title: "Finding an invisible spaceship"
description: "Can a fixed collection of detectors distinguish every possible 2 × 2 spaceship position on a 7 × 7 board?"
format: problem
tags: [combinatorics, puzzles]
math: true
---

A 7 × 7 board is either empty or contains one invisible 2 × 2 spaceship aligned with the grid.

A detector reports whether its square is occupied. All detector positions must be chosen before any results are known.

What is the smallest number of detectors needed to determine whether a spaceship is present and, if so, its exact position?

<!-- hint -->

Look for disjoint rectangles that each contain two possible spaceship positions.

<!-- solution -->

**The minimum is 16 detectors.**

**Lower bound.** The eight disjoint rectangles in [Figure 1](#spaceship-regions) are each 2 × 3 or 3 × 2. Inside any one rectangle, two spaceship positions and the empty board give three cases to distinguish. Detectors outside it report “off” in all three cases; one detector inside gives only two possible reports. Each rectangle therefore needs at least two detectors, giving $$8\cdot2=16$$.

<figure id="spaceship-regions" class="problem-figure">
  <img src="{{ '/assets/figures/invisible-spaceship-regions.svg' | relative_url }}" alt="A seven-by-seven board partitioned into eight disjoint rectangles of six squares each, leaving only the central square uncovered." width="440" height="400" loading="lazy">
  <figcaption>Figure 1. Eight disjoint regions.</figcaption>
</figure>

**Construction.** Number rows and columns 1 through 7. Put detectors at all 16 intersections of the rows and columns in

$$
S=\{2,3,5,6\}.
$$

as in [Figure 2](#spaceship-detectors).

<figure id="spaceship-detectors" class="problem-figure">
  <img src="{{ '/assets/figures/invisible-spaceship-detectors.svg' | relative_url }}" alt="Detectors at every intersection of rows 2, 3, 5, and 6 with columns 2, 3, 5, and 6." width="380" height="380" loading="lazy">
  <figcaption>Figure 2. A matching arrangement of 16 detectors.</figcaption>
</figure>

The six consecutive row pairs meet $$S$$ in the distinct, nonempty sets $$\{2\}$$, $$\{2,3\}$$, $$\{3\}$$, $$\{5\}$$, $$\{5,6\}$$, and $$\{6\}$$. The same holds for columns.

Because every crossing in $$S\times S$$ has a detector, the triggered row and column numbers recover both pairs uniquely. Every spaceship triggers a detector; no triggered detector means the board is empty.
