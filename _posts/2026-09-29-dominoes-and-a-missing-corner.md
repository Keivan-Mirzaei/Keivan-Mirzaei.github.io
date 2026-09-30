---
title: Dominoes and two missing corners
description: A board has 62 squares left. Is having an even number of squares enough to tile it?
format: problem
category: math
tags: [invariants, geometry, proof]
sample: true
---

Remove the top-left and bottom-right squares from an 8 × 8 chessboard. Can you cover the remaining 62 squares with 31 dominoes, each covering two squares that share an edge?

Dominoes may be rotated, but they must stay inside the board, cannot overlap, and cannot cover either missing square.

![An eight-by-eight checkerboard with the top-left and bottom-right dark squares crossed out.]({{ '/assets/figures/missing-corners.svg' | relative_url }})

Before trying arrangements, write down what every single domino has in common.

<details markdown="1">
<summary>A small hint</summary>

Color the board like a chessboard. How many squares of each color does one domino cover?

</details>

<!-- solution -->

Every domino covers one light square and one dark square. Therefore any region tiled by dominoes must contain the same number of squares of each color.

Opposite corners of this board have the same color. Removing them leaves 30 dark squares and 32 light squares. No collection of dominoes can cover that imbalance, so the requested tiling is impossible.

The even area was necessary, but insufficient. The coloring reveals a second necessary condition.

**A follow-up:** removing two opposite-colored squares repairs the color count. Does an equal color count guarantee a tiling for *every* shape made of grid squares? Try drawing a disconnected counterexample first, then a connected one.
