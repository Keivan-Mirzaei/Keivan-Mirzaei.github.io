---
title: "An Inductive Proof that Lights Out Configurations are Invertible, and a Parity-Invariance Result"
description: "Elementary graph arguments for complementing every Lights Out configuration and proving that the parity of successful move sequences is fixed."
kind: Paper
authors: [Keivan Mirzaei]
status: Preprint
year: 2025
tags: [combinatorics, graph theory, Lights Out, parity]
featured: false
order: 2
arxiv_id: "2509.18223"
links:
  - label: "arXiv:2509.18223"
    url: https://arxiv.org/abs/2509.18223
  - label: PDF
    url: https://arxiv.org/pdf/2509.18223
---

## The Lights Out problem

Each vertex of a finite simple graph carries a light. Pressing a vertex toggles that vertex and each of its neighbors.

[Play the interactive Lights Out exploration]({{ '/notes/lights-out/' | relative_url }}): try grid and graph puzzles, reveal solutions, and follow the complement construction.

The paper gives an elementary inductive proof that any starting configuration can be turned into its complement: every light changes state.

## Parity invariance

For a fixed starting configuration and any attainable target configuration, all sequences of presses reaching that target have the same parity. Equivalently, two solutions to the same target differ by an even number of presses.

Both results are established through elementary arguments about the graph.

## Preprint history

First submitted to [arXiv](https://arxiv.org/abs/2509.18223) on September 22, 2025; revised on March 20, 2026.
