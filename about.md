---
title: About Almost Obvious
section: about
eyebrow: Mathematics & curiosity
permalink: /about/
description: A diary of mathematical questions, experiments, and ideas worth following.
search: true
widgets: [three-cups]
problem_disclosures: true
---
I use this website as a diary: a place to collect questions, follow ideas, and share things that catch my curiosity. Often that means a mathematical problem, a proof, or an experiment; sometimes it is simply an idea I want to spend a little more time with.

The name *Almost Obvious* is a nod to those moments when a result seems clear, but the proof takes a little more thought. The small question below is a good place to begin.

## A small question to start

Three cups sit in a row, all facing down. On each move, turn over **exactly two** cups. Can you get all three facing up?

{% include widgets/three-cups.html %}

{% capture cup_support %}
<!-- hint -->

Count the cups facing up. What can a move do to that number?

<!-- solution -->

Each move changes the number of upward-facing cups by −2, 0, or 2, so it stays even; three is odd, making the goal impossible.
{% endcapture %}
{% assign cup_support = cup_support | markdownify %}
{% include problem-content.html content=cup_support %}

That is the kind of moment this notebook is about: a little experimentation, then a reason that explains every possible attempt.

## Find your way around

- [Posts]({{ '/notes/' | relative_url }}) come in two forms:
  - [Problems]({{ '/problems/' | relative_url }}) begin with a question. When hints or solutions are included, they stay tucked away until you choose to open them.
  - [Explorations]({{ '/explorations/' | relative_url }}) follow an idea through examples, diagrams, code, and experiments.
- [Learning modules]({{ '/learning/' | relative_url }}) cover courses and topics in greater depth, with structured lessons, explanations, exercises, and interactive activities.
- [Puzzles]({{ '/puzzles/' | relative_url }}) give you something to play with, from tiling a floor to finding a winning path in Hex.
- [Research]({{ '/research/' | relative_url }}) collects my work in stochastic analysis and mathematical finance.

## Reading the problem thumbnails

The thumbnails beside problems give a rough sense of difficulty. A simple circle suggests a more approachable question; increasingly woven loops suggest more demanding reasoning or a less familiar insight.

<div class="problem-difficulty-guide" aria-hidden="true">
{% for entry in site.data.problem_logos %}
  {% assign problem_mark = entry[1] %}
  <img src="{{ problem_mark.image | relative_url }}" alt="" aria-hidden="true" width="440" height="410" loading="lazy" decoding="async">
{% endfor %}
</div>

Difficulty depends on your background and the insight you happen to spot. A short solution can still take a long time to find, so take these marks as an invitation to explore at your own pace.

## About me

I’m a PhD candidate in Mathematical Finance at the University of Calgary. My research is in stochastic analysis and partial differential equations, and I teach mathematics. This notebook gives me a place to share the questions and ideas I encounter along the way.

For my education, teaching, and professional experience, see my [LinkedIn profile]({{ site.linkedin_url }}).

## Get in touch

Have an interesting problem, a different proof, or a correction to suggest? [Send a note](mailto:{{ site.email }}).
