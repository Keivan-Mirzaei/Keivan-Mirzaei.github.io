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

**The minimum is 16 detectors.** We first construct an arrangement, then prove that fewer detectors cannot work.

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

## A first lower bound

There are $$6\times6=36$$ possible spaceship positions. For each position, record the set of detectors it triggers. These 36 sets must be nonempty and distinct.

Suppose there are $$k$$ detectors, of which $$b$$ are on the board's boundary: row 1, row 7, column 1, or column 7. At most $$k$$ positions can trigger just one detector, because a particular one-detector report can occur only once. Every other position triggers at least two. Thus the total number of detector-position incidences is at least

$$
72-k.
$$

An interior detector belongs to four possible spaceship positions; a boundary detector belongs to at most two. Counting the same incidences by detectors gives at most $$4k-2b$$. Therefore

$$
72-k\leq4k-2b,
\qquad\text{or}\qquad
72\leq5k-2b.
$$

Consequently, $$k\geq15$$. If $$k=15$$, then $$b\leq1$$. We only need to rule out an arrangement with 15 detectors and at most one on the boundary.

## A fact about a two-row strip

Consider the seven columns in any pair of consecutive rows. Call a column *sensed* if it contains a detector in that strip. The six possible spaceship positions within the strip must give different nonempty reports.

Two unsensed columns cannot be adjacent: a spaceship occupying those columns would trigger nothing. Nor can they be two columns apart: the two positions spanning the column between them would trigger exactly the same detectors in that middle column.

Unsensed columns must therefore be at least three columns apart. There are at most three of them among seven columns. If there are exactly three, they must be 1, 4, and 7. We have proved:

**Every two-row strip has at least four sensed columns. If it has exactly four, they are 2, 3, 5, and 6.**

Interchanging rows and columns gives the same fact for every two-column strip.

## No boundary detector

Assume first that the board's boundary has no detectors. Applying the strip fact at the top, bottom, left, and right shows that each of row 2, row 6, column 2, and column 6 contains at least four detectors.

These four lines form the outer ring of the interior 5 × 5 square. Their four corner squares are each counted twice, so the ring contains at least

$$
4+4+4+4-4=12
$$

detectors.

Now consider the central 3 × 3 square, consisting of rows and columns 3 through 5. Compare a spaceship on rows 1–2, columns 3–4, with one on rows 2–3, columns 3–4. The occupied cells in row 2 are identical, and row 1 has no detectors. To distinguish these two positions, at least one of the cells in row 3, columns 3–4, must contain a detector.

The same comparison along each side gives **eight requirements** inside the central square: each of the two neighboring pairs on its top side, bottom side, left side, and right side must contain a detector.

A detector in that central square can satisfy at most two of these requirements. A corner cell lies in one horizontal pair and one vertical pair; a middle cell on a side lies in the two pairs on that side; the center cell satisfies none. Hence the central square needs at least $$8/2=4$$ detectors.

The outer ring and central square are disjoint. Together they need at least $$12+4=16$$ detectors, contradicting $$k=15$$.

## One boundary detector

Rotate the board, if necessary, so that its only boundary detector is in row 1, column $$c$$.

Row 6 still needs at least four detectors. Columns 2 and 6 also each need at least four interior detectors. To see this for column 2, use the strip formed by columns 1 and 2. If the boundary detector lies outside that strip, all its required sensed rows come from column 2. If it lies inside, row 1 is sensed; the strip cannot have exactly four sensed rows, since those would have to be 2, 3, 5, and 6. It therefore has at least five, leaving at least four interior detectors in column 2. The argument for column 6 is identical.

The top strip needs at least four sensed columns, so row 2 contains at least three detectors. More precisely:

- If $$c\in\{2,3,5,6\}$$, the outer ring needs at least $$3+4+4+4-4=11$$ detectors. The boundary detector can replace at most one of the eight central requirements: only the top pair in columns 3–4 or the top pair in columns 4–5 can be affected. At least seven requirements remain, so the central square still needs at least four detectors. Including the boundary detector gives at least $$11+4+1=16$$.
- If $$c\in\{1,4,7\}$$, the top strip cannot have exactly four sensed columns, because it contains $$c$$. It needs at least five, so row 2 contains at least four detectors and the outer ring needs at least 12. At most two central requirements can be replaced by the boundary detector, leaving at least six; the central square therefore needs at least three detectors. The total is at least $$12+3+1=16$$.

Both cases contradict $$k=15$$. Fewer than 16 detectors are impossible, and the arrangement above uses exactly 16, completing the proof.
