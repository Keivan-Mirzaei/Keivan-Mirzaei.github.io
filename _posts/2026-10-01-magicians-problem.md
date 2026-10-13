---
title: "The magician’s problem"
description: "A coin, an audience, and a probability that seems to settle—until you magnify a ripple that never disappears."
format: exploration
image: /assets/images/exploration-thumbnails/magicians-problem.svg
image_alt: A magnifying glass reveals a repeating ripple in an apparently settling probability curve.
tags: ["probability", "oscillations", "limits"]
math: true
widgets: [magicians-problem]
---

A magician hands over a written prediction. The audience stands up. Everyone guesses heads or tails, a coin is tossed, and those who guessed incorrectly sit down. Repeat until one person remains; the prediction describes that person.

Wes Iseli performed this routine on *Penn & Teller: Fool Us*. Watch what happens when only two people remain.

{% include embed.html src="https://www.youtube-nocookie.com/embed/rQ0YN7RpvFQ" title="Wes Iseli’s audience coin routine on Penn and Teller: Fool Us" caption="The original performance, shared on Wes Iseli’s own YouTube channel." %}

[Watch on YouTube ↗](https://www.youtube.com/watch?v=rQ0YN7RpvFQ)

## Let chance finish the game

The final two participants are told to choose **different sides**. The next toss must leave exactly one standing.

Remove that instruction. Let everyone make a fresh, independent, fair guess in every round, including the last two. Now the game can jump from several survivors to none.

**How does the chance of ever reaching exactly one person depend on the initial audience size?**

Explore the audience simulation below and its Info panel. One run can suggest what happens; it does not estimate the overall probability.

<div id="audience-simulation" markdown="1">

{% include widgets/magician-game.html %}

</div>

Two people already reveal the difference. A round leaves one survivor with probability $$1/2$$, none with probability $$1/4$$, and both with probability $$1/4$$. In the last case we try again. Conditional on eventually leaving the two-person state, the chance of success is $$(1/2)/(3/4)=2/3$$. Coordinating the final guesses raises it to $$1$$.

## The probability microscope
{: #probability-microscope }

For a larger audience, write $$P_n$$ for the chance of reaching one survivor from $$n$$ people. The calculated values appear to settle near **72.13%**. It is tempting to guess that $$P_n$$ has a limit.

{% include widgets/magician-probability.html %}

The overview calculates finite-audience probabilities. The magnified view shows the **limiting profile** derived in the [mathematical write-up]({{ '/assets/explorations/magicians-problem.pdf' | relative_url }}). Its peak-to-peak height is about **0.001426 percentage points**: the highest and lowest probabilities differ by roughly **14 in a million**.

That distinction matters. The early oscillations shrink rapidly; the question is whether the remaining ripple eventually disappears. Drawing the limiting profile makes the proposed answer visible, but we still need to understand why that profile governs large audiences.

## Why doubling brings the wiggle back

While many people remain, each round roughly halves the crowd. Starting with twice as many people should therefore resemble starting with the original audience after one extra round. This suggests that doubling brings the probability back to nearly the same point in a cycle.

The decisive rounds occur when only a few people remain. Write the starting size as $$n=2^{m+\theta}$$, where $$m$$ is an integer and $$0\leq\theta<1$$. After $$m+j$$ rounds, the expected number standing is $$2^{\theta-j}$$. The large factor $$2^m$$ has disappeared, but the position $$\theta$$ between successive powers of two remains.

At this scale, the survivor count still fluctuates: an expectation near one does not guarantee one survivor. Because rounds occur in whole steps, changing $$\theta$$ changes the sequence of small populations the game passes through.

The write-up makes this reasoning precise. It establishes a continuous, nonconstant function $$F$$ such that

<div id="limiting-profile" markdown="1">

$$
\begin{gathered}
P_n=F(\log_2 n)+o(1),\\
F(t+1)=F(t).
\end{gathered}
\tag{1}
$$

</div>

Here $$o(1)$$ is an error tending to zero as $$n$$ grows. The probability approaches a repeating profile in logarithmic audience size, rather than one constant. The [probability microscope](#probability-microscope) displays that profile; its jumps to larger audience windows illustrate the period in [equation (1)](#limiting-profile).

## Two routes toward infinity
{: #two-routes }

A single limit would have to agree along every route to larger audiences. Compare powers of two with $$\lfloor\sqrt{2}\,2^m\rfloor$$: audiences about $$1.414\ldots$$ times as large, rounded down. Their logarithmic positions approach $$0$$ and $$1/2$$, respectively.

{% include widgets/magician-routes.html %}

Applying [equation (1)](#limiting-profile), the two routes approach different values:

- **Powers of two:** approximately **72.1352103%**.
- **Powers of two × √2, rounded down:** approximately **72.1342938%**.

The extra decimal places expose the tiny difference. These are distinct limiting values, not just two unequal probabilities at finite audience sizes. They rule out a single limit for $$P_n$$.

More people stretch the ripple across larger audience sizes without erasing its final height. A probability can look settled to several decimal places and still never converge. The [full write-up]({{ '/assets/explorations/magicians-problem.pdf' | relative_url }}) derives the exact probabilities, proves the profile and its nonconstancy, and connects the question with random leader election.
