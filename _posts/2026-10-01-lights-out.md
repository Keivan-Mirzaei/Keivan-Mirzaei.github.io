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

Press a light and it flips between on and off, together with all its neighbors. The lights form a finite simple graph: vertices are lights, edges specify neighbors, and there are no loops or directed edges.

**Can a sequence of presses flip every light, whatever the starting pattern?** This asks for the complement of the starting configuration. It differs from the familiar goal of turning every light off.

## Two goals, different answers

Explore **Can you turn them all off?** below, including its Settings and Info panels. Compare turning everything off with complementing the start. The boards use the same lights and networks as the [standalone graph game]({{ '/puzzles/lights-out/' | relative_url }}), which offers 1,000 numbered puzzles at each difficulty.

{% include widgets/lights-out-game.html %}

Two joined lights, one on and one off, expose the distinction. Either press flips both, so they remain different forever: the all-off goal is impossible. Their complement, however, is reached in one press.

Two other observations simplify the search. Pressing the same light twice does nothing, and changing the order of presses does not change the result. We can therefore reduce a sequence to a **press set**, keeping exactly the vertices pressed an odd number of times. Canceling repeated pairs also preserves the parity of its length.

The complement appears to be attainable even on boards where all-off is not. We will prove that **every finite simple graph has a press set that flips every light**.

## Why pressing everything almost works

The degree $$\deg(v)$$ is a vertex’s number of neighbors. Pressing every vertex once toggles $$v$$ exactly $$1+\deg(v)$$ times. This flips the even-degree vertices and leaves the odd-degree vertices unchanged.

So a solution would follow if we could first flip **only the odd-degree vertices**. There is a useful fact about how many we must correct:

<div id="degree-sum" markdown="1">

$$
\sum_{v\in V(G)}\deg(v)=2\lvert E(G)\rvert.
\tag{1}
$$

</div>

Each edge contributes one at either end. The sum is even, so an even number of vertices have odd degree. This **handshaking lemma** suggests pairing them. What remains is to find a way to flip any chosen pair without changing other lights.

## Borrow solutions from smaller graphs

We use induction on the number of vertices. The empty graph needs no presses; with one light, press it. Assume that every smaller graph can be complemented, and consider $$G$$.

For each vertex $$v_i$$, remove it and its incident edges. A press set $$P_i$$ complements the remaining graph by induction. Restore $$v_i$$ and make those same presses. Every other light still flips: the restored vertex is not pressed, so its presence adds no toggles to its neighbors.

If some $$P_i$$ also flips $$v_i$$, we already have a solution for all of $$G$$. Otherwise, each $$P_i$$ flips every vertex **except** $$v_i$$.

In this second case, apply $$P_i$$ followed by $$P_j$$. Every other light flips twice; $$v_i$$ and $$v_j$$ each flip once. We have the required operation on **any pair**.

Pair the odd-degree vertices using the [handshaking lemma (1)](#degree-sum), flip those pairs, then press every vertex once. The correction flips precisely the lights missed by the final pass. Every light is toggled an odd number of times, proving the induction.

{% include widgets/lights-out-proof.html %}

The [induction walkthrough](#lo-proof-title) shows the two cases. On the four-vertex path, neither endpoint has even degree; after cancellations, pressing the two endpoints complements the whole path. On the triangle, a press that complements two vertices also flips the third when it is restored.

The construction never uses which lights were initially on. The same press set therefore complements **every starting pattern** on its graph.

## Different solutions, the same parity

The [game](#lo-game-title) can reveal several solutions for one start and target. Their press sets and sizes may differ. Is anything forced to agree?

Consider two joined lights with both on. Either light alone solves the all-off puzzle: two different press sets, both of odd size. Pressing both lights changes nothing and has even length. This suggests examining the difference between solutions.

Call a press set $$S$$ **quiet** if it leaves every light unchanged. In the graph induced by $$S$$, each pressed vertex receives one toggle from itself and one from each pressed neighbor. Thus, for every $$v\in S$$,

$$
1+\deg_{G[S]}(v)\quad\text{is even}.
$$

Every vertex of $$G[S]$$ has odd degree. By the [handshaking lemma (1)](#degree-sum), that graph has an even number of vertices: **every quiet set has even size**. Canceling repeated pairs shows the same for any quiet sequence.

Now perform one solution followed by another for the **same start and target**. Their identical net changes cancel, making a quiet sequence. Its total length is even, so the two solution lengths have the same parity.

The parity belongs to the chosen start and target; it need not agree across different puzzles.

Both elementary arguments appear in my paper, [*An Inductive Proof that Lights Out Configurations are Invertible, and a Parity-Invariance Result*](https://arxiv.org/abs/2509.18223). Its [research entry]({{ '/research/lights-out-invertibility-parity/' | relative_url }}) gives the publication details.
