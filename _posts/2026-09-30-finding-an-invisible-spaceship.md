---
title: "Finding an invisible spaceship"
description: "Can a fixed collection of detectors distinguish every possible 2 × 2 spaceship position on a 7 × 7 board?"
format: problem
tags: [combinatorics, puzzles]
math: true
---

A 7 × 7 board is either empty or contains one invisible 2 × 2 spaceship. The spaceship lies entirely within the board, with its edges along the grid lines.

A detector placed in a square reports whether that square is occupied. All detectors are switched on at the same time, so their positions must be chosen before any results are known.

What is the smallest number of detectors needed to determine both:

- whether a spaceship is present;
- its exact position, if it is present?

![A seven-by-seven grid with one possible two-by-two spaceship occupying four adjoining squares, outlined with a dashed border.]({{ '/assets/figures/invisible-spaceship.svg' | relative_url }})

*The shaded region illustrates one possible spaceship position. You choose the detector squares.*

<!-- solution -->

**The minimum is 16 detectors.** An eight-region partition gives a short lower bound, and a matching arrangement shows that 16 suffices.

## Why at least 16 detectors are needed

The eight outlined rectangles below are disjoint. Each is a 2 × 3 or 3 × 2 region; only the central square lies outside them.

![A seven-by-seven grid partitioned into eight disjoint six-square rectangles, labelled A through H, with the central square left over.]({{ '/assets/figures/invisible-spaceship-regions.svg' | relative_url }})

*Each of the eight regions needs at least two detectors.*

To see why, consider a single region. It contains exactly two possible 2 × 2 spaceship positions. We must distinguish those two positions from each other and from an empty board. Detectors outside the region stay off in all three cases. With at most one detector inside, there are only two possible reports: off or on. That cannot distinguish three cases, so the region needs at least two detectors.

Since the eight regions share no squares, their required detectors are all distinct. Therefore at least

$$
8\times2=16
$$

detectors are necessary.

## An arrangement with 16 detectors

Number the rows from top to bottom and the columns from left to right, using 1 through 7. Put a detector in every square whose row and column both belong to

$$
S=\{2,3,5,6\}.
$$

There are $$4\times4=16$$ such squares.

![A seven-by-seven board with detectors at all intersections of rows 2, 3, 5, and 6 with columns 2, 3, 5, and 6.]({{ '/assets/figures/invisible-spaceship-detectors.svg' | relative_url }})

The six possible pairs of consecutive rows intersect $$S$$ in the following six different, nonempty sets:

| Spaceship rows | Detector rows occupied |
| --- | --- |
| 1, 2 | 2 |
| 2, 3 | 2, 3 |
| 3, 4 | 3 |
| 4, 5 | 5 |
| 5, 6 | 5, 6 |
| 6, 7 | 6 |

The same table applies to columns. If the spaceship occupies a row pair $$R$$ and a column pair $$C$$, the triggered detectors are exactly

$$
(R\cap S)\times(C\cap S).
$$

At least one detector triggers. Read off the row numbers of the triggered detectors and use the table to recover the spaceship's two rows; do the same for its columns. This determines its exact position. If no detector triggers, the board is empty.

Thus 16 detectors are both necessary and sufficient.
