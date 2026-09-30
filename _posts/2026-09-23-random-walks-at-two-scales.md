---
title: A random walk at two scales
description: Build a jagged path from coin flips, replay it, and discover why square-root scaling matters.
format: exploration
category: experiments
tags: [probability, simulation, Python, random walks]
widgets: [random-walk]
math: true
sample: true
---

Start at zero. Toss a fair coin: heads moves you up, tails moves you down. Repeat. A rule this small already produces paths that are hard to predict by eye.

The activity uses 256 steps. Each has size 1/16, and the whole path takes one unit of time. Its first numbered path is reproducible: reloading returns to path 42.

{% include widgets/random-walk.html %}

## The same path, held still

The static figure below shows path 42, so the article remains useful with scripting disabled. No trend has been fitted to the path.

![A scaled 256-step random walk starting at zero, plotted over times from zero to one.]({{ '/assets/figures/random-walk.svg' | relative_url }})

## Watch the path grow

This short, silent recording shows the same construction. Use the video controls to play, pause, or scrub; nothing plays automatically.

{% include video.html src='/assets/video/random-walk.mp4' poster='/assets/figures/random-walk.svg' title='A random walk growing one step at a time' caption='A 6.4-second recording of browser path 42. The vertical axis runs from −2 to 2.' transcript='/assets/video/random-walk-description.txt' %}

## Why not divide by the number of steps?

Write the independent, fair increments as $$X_i\in\{-1,1\}$$. After n steps their sum has mean zero and variance n:

$$
S_n=X_1+\cdots+X_n,\qquad \operatorname{Var}(S_n)=n.
$$

Dividing by n would make the variance $$1/n$$, which shrinks to zero. Dividing by $$\sqrt n$$ keeps the variance at one. That is why this 256-step experiment uses increments of size $$1/\sqrt{256}=1/16$$.

The endpoint of one path can still be large or small. A variance is a statement about the distribution across repeated experiments, not a target that each individual path must hit.

## A reproducible experiment in Python

This version uses Python’s standard random generator, so its seed 42 will not produce the browser’s path 42. A seed only identifies a sequence together with its generator.

```python
from math import sqrt
from random import Random

def walk(steps=256, seed=42):
    if steps < 1:
        raise ValueError("steps must be positive")
    rng = Random(seed)
    position = 0.0
    points = [(0.0, position)]
    for step in range(1, steps + 1):
        position += rng.choice((-1, 1)) / sqrt(steps)
        points.append((step / steps, position))
    return points
```

[Download the runnable example]({{ '/assets/code/random_walk.py' | relative_url }}). It prints a CSV table, which you can plot in your preferred tool.

## What to compare next

Generate several paths before forming an opinion about their shape. Then compare 64, 256, and 1,024 steps in Python. Keep the time interval at one and use the appropriate square-root step size each time.

The plots become more detailed without systematically collapsing toward zero. They offer a useful starting point for [sampling Brownian motion]({{ '/notes/sampling-brownian-motion/' | relative_url }}), where the increments are Gaussian instead of two-valued.
