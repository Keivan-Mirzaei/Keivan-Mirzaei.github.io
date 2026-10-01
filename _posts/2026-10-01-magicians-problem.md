---
title: "The magician’s problem"
description: "A coin, an audience, and a probability that seems to settle—until you magnify a ripple that never disappears."
format: exploration
tags: ["probability", "oscillations", "limits"]
math: false
widgets: [magicians-problem]
---

A magician hands over a written prediction. The audience stands up. Everyone guesses heads or tails, a coin is tossed, and the people who guessed incorrectly sit down. Repeat. The crowd dwindles, one person remains, and the prediction describes that person.

Wes Iseli performed this routine on *Penn & Teller: Fool Us*. Watch the audience shrink—and pay attention to what happens when only two people remain.

{% include embed.html src="https://www.youtube-nocookie.com/embed/rQ0YN7RpvFQ" title="Wes Iseli’s audience coin routine on Penn and Teller: Fool Us" caption="The original performance, shared on Wes Iseli’s own YouTube channel." %}

[Watch on YouTube ↗](https://www.youtube.com/watch?v=rQ0YN7RpvFQ)

## Let chance finish the game

In the performance, the final two people are told to choose **different sides**. The next toss must leave exactly one standing.

Now remove that instruction. Let everyone make a fresh, independent, fair guess in every round—even the last two. Each person has a half chance of staying. Sometimes the game reaches one person; sometimes the last few people all sit down together.

**How does the chance of ever reaching exactly one person depend on the size of the audience?**

Try a small version. Each dot is a person, and each click runs one round. This is one simulated performance, not an estimate of the overall probability.

{% include widgets/magician-game.html %}

With just two people, independent play reaches one survivor with probability **2/3**. Telling them to choose opposite sides raises that chance to **1**. That small change matters.

## A very convincing flat line

As the audience grows, the probability seems to settle near **72.13%**. The early wiggles shrink so quickly that an ordinary graph appears to have answered the question.

The graph below uses calculated finite-audience probabilities, rather than simulated frequencies. Press **Magnify the ripple** to look more closely at the almost flat part.

{% include widgets/magician-probability.html %}

The late ripple has a peak-to-peak height of only about **0.001426 percentage points**. Its highest and lowest probabilities differ by roughly **14 in a million**.

The early oscillations damp dramatically. But the remaining ripple does **not** keep shrinking to zero. It repeats at that tiny scale, however far out we go.

## Why doubling brings the wiggle back

While the crowd is large, each round removes roughly half of it. Start with twice as many people and, after one extra round, you are roughly back where you started.

So doubling the audience brings the probability back to almost the same place in its cycle. Moving **between** one power of two and the next takes us through the whole wiggle.

The last few people are where randomness matters most. At that point, “roughly half” can mean two survivors, one survivor, or none. Rounds happen in whole steps, and the game remembers where the starting audience sat between successive powers of two.

In the magnified graph, move along the ripple, then jump **20 more doublings** into the distance. The audience is now over a million times larger. The same pattern is still there. Jump again.

## Two roads toward infinity

A genuine limiting probability would be the same however we let the audience grow.

Take one route through powers of two: 256, 512, 1,024, and so on. Take another with audiences about **1.414… times as large**—the square root of two times those sizes, rounded down. Keep doubling on both routes.

{% include widgets/magician-routes.html %}

Both routes become enormous, yet they approach different probabilities:

- **Powers of two:** approximately **72.1352103%**.
- **Powers of two × √2, rounded down:** approximately **72.1342938%**.

The gap is tiny, but it stays. That is enough to rule out a single limit.

## Almost settled

On an ordinary scale, this probability looks constant. On a finer scale, it keeps moving through the same cycle. More people stretch the oscillation across larger audience sizes; they do not erase its final, very small height.

That is the surprise hiding behind the coin: **a probability can look settled to several decimal places and still never converge.**

For the exact formulas, proofs, and connections with random leader election, read the [full mathematical write-up]({{ '/assets/explorations/magicians-problem.pdf' | relative_url }}).
