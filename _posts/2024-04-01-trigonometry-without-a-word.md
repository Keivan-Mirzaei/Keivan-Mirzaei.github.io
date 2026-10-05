---
title: "Trigonometry without a word"
description: "Two arctangent identities, seen through a geometric proof without words."
format: problem
category: math
tags: ["geometry", "trigonometry"]
kind: Problem & proof
math: true
archived: true
---

Prove the identities:

$$
\begin{gathered}
\arctan\frac12+\arctan\frac13=\frac\pi4,\\
\arctan1+\arctan2+\arctan3=\pi
\end{gathered}
$$

<!-- solution -->

<figure class="problem-figure">
  <img src="{{ '/assets/figures/trigonometry-without-a-word.svg' | relative_url }}" alt="Two geometric proofs on a unit grid. The small right triangle has equal legs, and its 45-degree angle splits into angles with tangents 1/2 and 1/3. In the larger triangle, a perpendicular segment is one third of the upper side. The three angles beside the straight diagonal have tangents 1, 2, and 3. Matching ticks mark equal lengths." width="540" height="420" loading="lazy">
  <figcaption>A proof without words, on a unit grid.</figcaption>
</figure>

<!-- alternative -->

Let $$\alpha=\arctan(1/2)$$ and $$\beta=\arctan(1/3)$$. Both lie in $$(0,\pi/4)$$, and

$$
\tan(\alpha+\beta)
=\frac{\frac12+\frac13}{1-\frac16}=1.
$$

Since $$0<\alpha+\beta<\pi/2$$, this gives $$\alpha+\beta=\pi/4$$.

For $$t>0$$, $$\arctan t+\arctan(1/t)=\pi/2$$. Consequently, the second sum equals

$$
\frac\pi4+\pi-(\alpha+\beta)=\pi.
$$
