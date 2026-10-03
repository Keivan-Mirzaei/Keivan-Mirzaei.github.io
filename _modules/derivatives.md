---
title: "Derivatives: from rates to local linearity"
description: "Understand derivatives as rates and tangent slopes, learn differentiation rules, and use local linear approximations, with optional proof extensions."
format: module
date: 2026-10-02
level: "Introductory university calculus"
tags: [calculus, derivatives, real analysis]
duration: "five lessons of 60–90 minutes, plus problem work"
prerequisites: [Function notation and graphs, Algebra and trigonometry, Limits and continuity]
objectives:
  - Explain how average rates lead to a two-sided limit defining instantaneous rate.
  - Compute derivatives from the definition and diagnose failures of differentiability.
  - Apply the elementary differentiation rules, including the chain rule, and compute higher derivatives.
  - Use implicit, logarithmic, and inverse differentiation with their hypotheses.
  - Find a tangent line and explain differentiability through a local linear approximation.
layout: module
module_id: derivatives
course_id: calculus-i
module_step: 0
permalink: /notes/derivatives/
---

## Why study derivatives?

An average rate compares two points. An instantaneous rate asks what happens at one point. How can we make that question precise without dividing by zero?

A derivative answers a deceptively simple question: **what constant rate best describes a function near one point?** We will begin with slopes that can be measured between two points, develop tools for calculating derivatives, and then test how far the geometric intuition can be trusted.

The goal is to understand what a derivative means and to calculate it confidently. This is the differentiation module of Calculus I. Rates, definitions, elementary rules, implicit and inverse differentiation, and tangent approximations form the core. Optional extensions explore why some highly irregular functions still admit a local linear approximation.

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

Each lesson has its own page. Work through its guiding question, explanations, and any graph activities, and attempt problems before opening the hints or solutions. The current problem sets are challenging; the course plan calls for routine practice and applications alongside them as the lessons are developed further.

Allow 60–90 minutes per lesson, plus independent problem work. Lessons 1–3 develop the meaning of a derivative and the elementary rules. In Lesson 4, implicit, logarithmic, and inverse differentiation belong to the core; parametric differentiation can be revisited with the parametric-curves module. In Lesson 5, the tangent approximation and the ordinary parabola and corner examples belong to the core. Its oscillatory and rational/irrational examples, associated proofs, and advanced synthesis tasks are optional enrichment.

Graph analysis, theorem applications, routine approximation problems, optimization, and related rates follow in the next two modules of the course roadmap.

<details markdown="1">
<summary>Reference and teaching notes</summary>

Selected proof extensions come from Teodora-Liliana Rădulescu, Vicențiu D. Rădulescu, and Titu Andreescu, *Problems in Real Analysis: Advanced Calculus on the Real Axis* (Springer, 2009), Chapter 5, “Differentiability.” The main links are Section 5.1 (printed pp. 183–187, including the dense-branch example on p. 186), Problem 5.2.1 (pp. 198–199), and the oscillatory-family idea in Problem 5.6.18 (pp. 254–255). Those correspond to PDF pages 196–200, 211–212, and 267–268 in the supplied copy. Explanations, activities, and most problems here are newly written; adaptations are identified where they occur. The overall course scope is set by the introductory university objectives linked from the course overview.

For teaching, assign one lesson at a time. Use the opening question and activity before the formal explanation, and select practice appropriate to students' preparation. The final lesson's dense-set proofs can serve as an extension for students with a stronger analysis background. Assess the core with explanation, routine calculation, and interpretation of rates and tangent lines; advanced examples should not be required for introductory mastery.

</details>
