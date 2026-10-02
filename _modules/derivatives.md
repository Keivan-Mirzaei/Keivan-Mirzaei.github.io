---
title: "Derivatives: from rates to local linearity"
description: "Build the derivative from secant slopes, derive the rules, master demanding computations, and discover what differentiability really requires."
format: module
date: 2026-10-02
level: "Calculus with proofs"
tags: [calculus, derivatives, real analysis]
duration: "five lessons of 60–90 minutes, plus problem work"
prerequisites: [Function notation and graphs, Algebra and trigonometry, Limits and continuity]
objectives:
  - Explain how average rates lead to a two-sided limit defining instantaneous rate.
  - Compute derivatives from the definition and diagnose failures of differentiability.
  - Derive differentiation rules and combine them in demanding calculations.
  - Use implicit, logarithmic, inverse, and parametric differentiation with their hypotheses.
  - Recognize differentiability as a local linear approximation, even for surprising functions.
layout: module
module_id: derivatives
module_step: 0
permalink: /notes/derivatives/
---

## Why study derivatives?

An average rate compares two points. An instantaneous rate asks what happens at one point. How can we make that question precise without dividing by zero?

A derivative answers a deceptively simple question: **what constant rate best describes a function near one point?** We will begin with slopes that can be measured between two points, develop tools for calculating derivatives, and then test how far the geometric intuition can be trusted.

The goal is to understand what a derivative means and to calculate it confidently. By the final lesson, you will be able to explain why some highly irregular functions still admit an accurate local linear approximation.

## Objectives

By the end of the module, you will be able to:

<ul>
{% for objective in page.objectives %}
  <li>{{ objective }}</li>
{% endfor %}
</ul>

## Before you start

You will need {{ page.prerequisites | join: ', ' | downcase }}. The lessons also use the standard trigonometric and exponential limits, which are identified when they first appear.

{% include module-contents.html %}

## How to use the module

Each lesson has its own page. Work through its guiding question, explanations, and any graph activities, then attempt its four challenging problems before opening the hints or solutions. Finish with the checkpoint. Lesson 5 closes with three synthesis tasks that combine the ideas from across the module.

Allow 60–90 minutes per lesson, plus independent problem work. The first four lessons develop understanding and computational fluency; the fifth challenges our geometric intuition. Applications of derivatives will follow in a separate module.

<details markdown="1">
<summary>Reference and teaching notes</summary>

The roadmap and selected ideas come from Teodora-Liliana Rădulescu, Vicențiu D. Rădulescu, and Titu Andreescu, *Problems in Real Analysis: Advanced Calculus on the Real Axis* (Springer, 2009), Chapter 5, “Differentiability.” The main links are Section 5.1 (printed pp. 183–187, including the dense-branch example on p. 186), Problem 5.2.1 (pp. 198–199), and the oscillatory-family idea in Problem 5.6.18 (pp. 254–255). Those correspond to PDF pages 196–200, 211–212, and 267–268 in the supplied copy. Explanations, activities, and most problems here are newly written; adaptations are identified where they occur.

For teaching, assign one lesson at a time. Use the opening question and activity before the formal explanation, select two problems for discussion, and leave two for independent work. The final lesson's dense-set proofs can serve as an extension for students with a stronger analysis background. The next module can begin from the derivative as a local model and develop its applications.

</details>
