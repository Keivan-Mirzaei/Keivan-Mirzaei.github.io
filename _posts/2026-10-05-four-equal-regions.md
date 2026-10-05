---
title: "Four equal regions: two bisections and a turn"
description: "Two easy bisections leave one imbalance. A quarter-turn suggests how to remove it—but we must account for the jumps in a point count."
date: 2026-10-05
format: exploration
image: /assets/images/exploration-thumbnails/four-equal-regions.svg
image_alt: Two perpendicular cuts divide twelve points into four coloured groups of three.
tags: [geometry, counting, puzzles]
math: true
widgets: [four-equal-regions]
---

For a positive integer $$n$$, take $$4n$$ points in the plane with no three on one line. Can two perpendicular lines avoid every point and divide them into four regions with exactly $$n$$ points each?

## The point-splitting experiment
{: #point-splitting-experiment }

Explore the widget below, including its Settings and Info panels.

{% include widgets/four-equal-regions.html %}

The same widget is available as a [standalone puzzle]({{ '/puzzles/four-equal-regions/' | relative_url }}). Let us look for an argument that works for every placement satisfying the stated assumption.

## Two halves are not four quarters

An obvious first attempt is to halve the points twice. Pick a direction, order the points across it, and put a line in the gap between the middle two. There are $$2n$$ points on either side. Do the same in the perpendicular direction.

Both lines now halve the collection, but the quarters need not agree. With twelve points, the four counts could be $$4,2,4,2$$ around the crossing: each half contains six.

The two bisections do give us something useful. View the cross as a pair of rotated coordinate axes, and let $$k$$ count the points in its upper-right region. The upper half contains $$2n$$ points, so the upper-left contains $$2n-k$$. Balancing the right and left halves determines the bottom counts too:

<div id="balance-pattern" markdown="1">

$$
\begin{array}{c|c}
2n-k & k\\ \hline
k & 2n-k
\end{array}
\tag{1}
$$

</div>

Opposite regions already agree. **Only one imbalance remains: we need $$k=n$$.** Changing the direction of the cuts is the freedom we have left.

## Turn, while keeping the halves equal

For each orientation $$\theta$$, put both lines halfway across their middle gaps. As the orientation turns, the crossing can move; each line remains a bisector, preserving the [balance pattern (1)](#balance-pattern).

Follow the upper-right count $$k$$ in these moving axes. After a quarter-turn, the two dividing lines have exchanged roles. The new upper-right region is the old upper-left region, so

<div id="quarter-turn-count" markdown="1">

$$
k(\theta+\pi/2)=2n-k(\theta).
\tag{2}
$$

</div>

If we began above $$n$$, we end below it; if we began below, we end above. This suggests an equal split somewhere in between. But the count jumps rather than changing continuously, so a sign change alone is not enough: we must show that it cannot skip $$n$$.

## Why the count cannot skip the target

Start and finish at orientations where no two points have the same projection on either axis. There are only finitely many exceptional orientations: an equality occurs when a cut is parallel to a segment joining two points.

Between those orientations, the projection orders stay fixed, so $$k$$ stays fixed. At a change in a middle gap, its two endpoints exchange places. Because no three points are collinear, a changing bisector exchanges just one point from each side. If only one bisector changes, $$k$$ therefore changes by at most one.

We also need to consider two exchanges at once. In the rotating axes, a counterclockwise turn makes the vertical bisector trade its lower point for its upper point. This can only increase the upper-right count. The horizontal bisector trades its right point for its left point, which can only decrease that count. With four distinct points, each effect is zero or one, so even simultaneous exchanges change $$k$$ by at most one.

If the exchanges share a point, it lies at the crossing. It switches between opposite regions while its two partners compensate: when it enters or leaves the upper-right region, one partner leaves or enters; otherwise their contributions cancel or are both zero. The upper-right count is unchanged.

Thus **no jump can skip an integer**. By the [quarter-turn relation (2)](#quarter-turn-count), $$k$$ starts and ends on opposite sides of $$n$$, unless it already equals $$n$$. Somewhere between the exceptional orientations it must equal $$n$$. At that orientation the middle gaps are open, so neither cut contains a point. The [balance pattern (1)](#balance-pattern) then gives $$n$$ points in every region.

A version of this question, attributed to Loren C. Larson, appears as Problem 1E on page 500 of [*Crux Mathematicorum*, volume 24, number 8](https://cms.math.ca/wp-content/uploads/crux-pdfs/CRUXv24n8.pdf#page=52).
