---
title: Conditioning changes the denominator
description: A reliable scanner can still produce many false alarms. Count a whole batch before reaching for a formula.
format: module
category: math
tags: [probability, Bayes, conditional probability]
duration: 15 minutes
level: Introductory
prerequisites: [Fractions, Percentages]
objectives:
  - Read conditional probabilities from a two-way table.
  - Distinguish a detection rate from the reliability of a positive flag.
  - Explain how the base rate changes the answer.
widgets: [bayes]
math: true
sample: true
---

## 1. Make a prediction

A factory’s scanner flags 90% of faulty items. It also flags 10% of good items by mistake. Suppose 10% of the items are faulty.

An item has been flagged. What is the probability it is faulty? Write down a guess before looking at the table.

## 2. Count a batch

{% include widgets/bayes.html %}

These are **expected counts**, not a randomly simulated batch. At a 10% fault rate, 100 of 1,000 items are faulty. The scanner flags 90 of them. It also flags 90 of the 900 good items.

There are therefore 180 flags, and only 90 belong to faulty items. The probability we want is **50%**, not 90%.

## 3. Change the background

1. Move the fault rate to **1%**. How many flags are true alarms?
2. Move it to **50%**. Compare with your first prediction.
3. Try the two endpoints, **0%** and **100%**. Explain each result in words.

<details markdown="1">
<summary>Compare your observations</summary>

At 1%, there are 9 true flags and 99 false flags: 9/108, about 8.3%, are faulty. At 50%, the fraction is 450/500 = 90%. At 0%, every flag is false; at 100%, every flagged item is faulty.

</details>

## 4. Now write the formula

Let D mean “faulty” and F mean “flagged.” Conditioning on F means restricting attention to the flagged column:

$$
P(D\mid F)=\frac{P(F\mid D)P(D)}{P(F\mid D)P(D)+P(F\mid D^c)P(D^c)}.
$$

If the fault rate is p, the activity calculates $$0.9p/(0.9p+0.1(1-p))$$. The scanner’s two rates stay fixed; the composition of the incoming batch changes.

## 5. Check your understanding

Someone claims: “The scanner catches 90% of faults, so 90% of its flags are faults.” Identify the two conditional probabilities they confused.

<details markdown="1">
<summary>Reveal an explanation</summary>

The first number is $$P(F\mid D)$$. The second is $$P(D\mid F)$$. They condition on different groups, so their denominators differ. The two-way table makes that change of denominator visible.

</details>
