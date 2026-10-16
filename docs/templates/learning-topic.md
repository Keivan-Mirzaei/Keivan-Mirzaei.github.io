---
layout: learning-topic
title: Topic title
permalink: /learning/course/topic/
course_key: calculus
module_key: limits-and-continuity
# Use the existing submodule's permalink and position when filling it in.
position: '1.1'
description: A compact introduction to the idea.
math: true
# Correct is a zero-based option index: 0 is the first option.
exercises:
  - text: A line rises 4 units over a run of 2. What is its slope?
    options: ['1', '2', '4']
    correct: 1
    why: 'Divide rise by run: 4 ÷ 2 = 2.'
---

## The idea

Write a compact explanation. Use <mark>yellow emphasis sparingly</mark>.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>

### Name of the concept

State the definition precisely.

</aside>

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>

### A useful result

State the assumptions and conclusion.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

Give the proof here.

</details>
</section>

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3 class="worked-title">Optional short name</h3>

Keep the example and its solution visible. Omit the name if it adds nothing.

</section>

<aside class="attention" markdown="1">
<p class="element-label">Attention</p>

A useful point to notice.

</aside>

<aside class="caution" markdown="1">
<p class="element-label">Warning</p>

An important limitation or common mistake.

</aside>

## Figures and interactive widgets

Use `class="topic-figure"` on a figure and `class="topic-widget"` for an interactive figure. Both stay transparent. Add a descriptive caption or accessible label. A topic-specific script can be configured with `topic_script: /assets/js/your-widget.js` when a widget is implemented.

## Highlighting mathematics

Inline math with a full-height yellow marker:

<mark class="math-marker" markdown="span">$$m = \frac{2}{3}$$</mark>

A centered expression, including tall fractions:

<div class="highlight-equation" markdown="0">
<mark class="math-marker">\(\displaystyle m = \frac{y_2-y_1}{x_2-x_1}\)</mark>
</div>
