---
title: "Lights Out: every light can be flipped"
description: "Play on a grid or a graph, reveal a solution, and discover why every pattern can be complemented—and why successful routes agree on parity."
date: 2026-10-01 19:33:06 -0600
format: exploration
image: /assets/images/exploration-thumbnails/lights-out.svg
image_alt: Pressing the two endpoints changes four connected amber lights into four unlit lights.
tags: [combinatorics, graph theory, parity, puzzles]
math: true
widgets: [lights-out]
---

A light has two states: on and off. Press it, and it changes state—but so do its neighbors. A move that fixes one part of the board can spoil another.

The exploration uses the same lights and networks as the [standalone graph game]({{ '/puzzles/lights-out/' | relative_url }}), which offers 1,000 numbered puzzles at each difficulty.

Start with the usual goal: **turn every light off**. You can play first, reveal a solution, or follow it one press at a time. The small numbers on a revealed solution give a press order; the larger numbers name the lights.

{% include widgets/lights-out-game.html %}

**Try three experiments.**

1. Press the same light twice. The board returns to where it was.
2. Press two different lights, restart, and press them in the opposite order. You get the same result.
3. Choose the **4 × 4 grid**, reveal a solution, and choose **Another solution**. The press sets can differ, but their sizes are always either all even or all odd.

The first two observations mean that a press sequence can be simplified to a **set**: keep only the lights pressed an odd number of times. Reordering presses changes nothing; removing a repeated pair changes the length by two, so it also preserves parity.

The graph boards use exactly the same rule. A light is a vertex, and two lights are neighbors when an edge joins them. There are no loops or directed edges; pressing a vertex always flips the vertex itself as well as its neighbors.

## A goal that is always possible

Choose **Try an impossible board**. There are just two joined lights, with one on and the other off. Either button flips both, so the two lights remain different forever. You cannot turn both off.

Now change the goal to **Complement the start**. The target reverses every starting light: on becomes off, and off becomes on. One press reaches it.

This works far beyond that tiny example:

> **On every finite simple graph, every starting configuration can be changed into its complement.**

Try different boards, or use **Edit starting lights** to make your own pattern. The target thumbnail shows the complement of the saved starting pattern. It stays fixed while you play.

Here “invertible” refers to complementing the configuration. It does not promise that every starting pattern can reach the all-off board.

This is the first result explored in my paper, [*An Inductive Proof that Lights Out Configurations are Invertible, and a Parity-Invariance Result*](https://arxiv.org/abs/2509.18223). The proof uses smaller graphs, cancellation, and one fact about degrees.

## Why pressing every light almost works

The **degree** of a vertex is its number of neighbors. If we press every vertex once, a vertex of degree $$d$$ is toggled $$d+1$$ times: once by itself and once by each neighbor.

- If $$d$$ is even, $$d+1$$ is odd, so its light flips.
- If $$d$$ is odd, $$d+1$$ is even, so its light stays unchanged.

So pressing everything flips exactly the vertices of **even degree**. To flip every light, we need a way to correct the odd-degree vertices first.

The **handshaking lemma** says

$$
\sum_{v\in V(G)}\deg(v)=2\lvert E(G)\rvert.
$$

Each edge contributes one to the degree at each end. The sum is even; therefore the number of odd-degree vertices is even. We can arrange them in pairs.

## The complete solution: build it from smaller graphs

We prove the complementation claim by induction on the number of vertices. With one light, press it. Assume that every smaller graph can be complemented, and consider a graph $$G$$ with $$n$$ vertices.

**Leave out one vertex.** For each vertex $$v_i$$, remove it and all its incident edges. By induction, the remaining graph has a press set $$P_i$$ that flips every remaining light.

Restore $$v_i$$ and use those same presses in the full graph. Every other light still flips: we did not press the restored vertex, so restoring it changes no other vertex’s toggles.

There are now two possibilities:

- If some $$P_i$$ also flips the restored light $$v_i$$, it already flips every light. We are done.
- Otherwise, each $$P_i$$ flips every light **except** $$v_i$$.

**Flip any pair.** In the second case, apply $$P_i$$ followed by $$P_j$$. Every vertex other than $$v_i,v_j$$ is flipped twice and returns to its previous state. Each of $$v_i,v_j$$ flips once. This produces a sequence that flips just that pair.

**Correct the odd-degree vertices.** Pair them up, and use those pair sequences. This flips exactly the odd-degree vertices. Then press every vertex once.

At an even-degree vertex, the correction does nothing and the final pass contributes an odd number of toggles. At an odd-degree vertex, the correction contributes an odd number and the final pass contributes an even number. **The total is odd at every vertex**, so every light flips.

Both cases complete the induction. Notice that the argument never used which lights were initially on: the constructed press set works for **every** starting pattern on that graph.

{% include widgets/lights-out-proof.html %}

On the path of four, the construction takes the second route. The odd-degree vertices are the endpoints. After cancellation, pressing just those two endpoints flips all four lights. On the triangle, it takes the first route: a solution on two vertices already complements the full graph when the third vertex is restored.

## Different solutions, the same parity

Return to the game and choose **4 × 4 grid → New puzzle → Show solution**. There are **16 reduced press sets** for this reachable target. The first displayed plan uses the fewest presses; **Another solution** cycles through the others.

They need not have the same size, but they have the same parity. Compare solutions before stepping through a plan, so that every comparison uses the same starting board. A manual move recalculates the remaining solution; the total parity required from the original start stays fixed.

The paper’s second result explains this:

> **Fix a starting configuration and a reachable target. Every sequence reaching that target has the same parity of length.**

There is no universal “even” or “odd” answer across different puzzles. The parity is determined by this start and this target.

### The complete parity proof

Call a press set **quiet** if it returns every light to its starting state. Let $$S$$ be a quiet set, after repeated presses have been canceled.

Consider the graph induced by $$S$$: keep the pressed vertices and the edges between them. A pressed vertex $$v$$ is toggled by its own press and by each neighbor in $$S$$. To return unchanged, it must receive an even number of toggles:

$$
1+\deg_{G[S]}(v)\quad\text{is even}.
$$

Thus **every vertex of $$G[S]$$ has odd degree**. The handshaking lemma says there are an even number of such vertices, so $$\lvert S\rvert$$ is even. Every quiet sequence therefore has even length, including sequences with repeated presses.

Now suppose two solutions reach the same target from the same start. Perform the first, then the second. The two identical net changes cancel, so their combined sequence is quiet. Its length is even. Consequently the two solution lengths are either both even or both odd. This proves parity invariance.

On the two-light board with both lights on, either button alone solves the puzzle. The two solutions have different press sets but both have length one. Press both buttons and you get a quiet sequence of length two.

## How the displayed solution is found

The game’s solver uses binary linear algebra to find press sets. This is separate from the elementary proofs above.

Write a configuration as a vector of zeros and ones. Let $$M$$ have a $$1$$ on its diagonal and a $$1$$ wherever two vertices are neighbors. A press set $$x$$ takes a starting pattern $$b$$ to a target $$t$$ precisely when

$$
Mx=b+t\qquad\text{over }\mathbb F_2.
$$

Addition here means toggling: $$1+1=0$$. The solver reduces this system, enumerates its solutions on these small boards, and displays a solution with the **fewest presses** first. Other reduced solutions differ by quiet sets. If no solution exists, it identifies a set of lights whose on/off parity every move preserves.

For complementation, $$b+t$$ is the all-ones vector, whatever $$b$$ is. The inductive proof guarantees that this system always has a solution. It does not require $$M$$ to be invertible as a matrix.

For the original arguments and related literature, read the [paper on arXiv](https://arxiv.org/abs/2509.18223) or visit its [research entry]({{ '/research/lights-out-invertibility-parity/' | relative_url }}).
