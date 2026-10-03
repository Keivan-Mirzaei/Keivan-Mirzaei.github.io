---
title: About Almost Obvious
section: about
eyebrow: Mathematics & curiosity
permalink: /about/
description: A diary of questions, ideas, and whatever catches my curiosity.
search: true
widgets: [three-cups]
---
I use this website as a diary: a place to share whatever passes through my mind or catches my interest. Often that means a mathematical question, a proof, or an experiment; sometimes it is simply an idea I want to spend a little more time with.

The name Almost Obvious is a nod to those moments when a result seems clear, but the proof takes a little more thought. Start anywhere that catches your curiosity.

## A small question to start

Three cups sit in a row, all facing down. On each move, turn over **exactly two** cups. Can you get all three facing up?

{% include widgets/three-cups.html %}

<details markdown="1">
<summary>A hint</summary>

Count the cups facing up. What can a move do to that number?

</details>

<details class="problem-solution" markdown="1">
<summary>The one-line solution</summary>

Each move changes the number of upward-facing cups by −2, 0, or 2, so it stays even; three is odd, making the goal impossible.

</details>

That is the kind of moment this notebook is about: a little experimentation, then a reason that explains every possible attempt.

## Find your way around

[Posts]({{ '/notes/' | relative_url }}) come in two forms: [Problems]({{ '/problems/' | relative_url }}) offer a question and a solution to uncover when you are ready; [Explorations]({{ '/explorations/' | relative_url }}) follow an idea through examples, diagrams, code, and experiments.

[Learning modules]({{ '/learning/' | relative_url }}) have their own space for courses and topics, with explanations and interactive activities that build understanding step by step.

You can also [play a puzzle]({{ '/puzzles/' | relative_url }}) or [read about my research]({{ '/research/' | relative_url }}).

## About me

I’m a PhD candidate in Mathematical Finance at the University of Calgary. My research is in stochastic analysis and partial differential equations, and I teach mathematics. Alongside that work, I keep this diary to collect ideas, follow questions, and share things I find interesting.

For my education, teaching, and professional experience, see my [LinkedIn profile]({{ site.linkedin_url }}).

## Get in touch

Have an interesting problem, a different proof, or a correction to suggest? [Send a note](mailto:{{ site.email }}).
