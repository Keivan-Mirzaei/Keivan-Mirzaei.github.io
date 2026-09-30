---
title: Sampling Brownian Motion
description: From independent Gaussian increments to a sample path, with a small NumPy implementation.
format: exploration
category: code
tags: [probability, Python, simulation]
kind: Code note
math: true
archived: true
---

The following code shows how we can sample a Brownian motion. As a reminder, a stochastic process $$\{B(t), t \geq 0\}$$ is a standard Brownian motion if it satisfies the following properties:

1. $$B(0) = 0$$ almost surely.
2. The process has continuous sample paths.
3. The increments are stationary and independent on disjoint time intervals.
4. $$B(t) - B(s)$$ has a normal distribution with mean $$0$$ and variance $$t-s$$ for all $$0 \leq s < t$$.

## A discrete sample path

We sample independent normal increments with standard deviation $$\sqrt{\Delta t}$$, then take their cumulative sum. The class below also supports a drift $$\mu$$ and scale $$\sigma$$, giving $$X(t) = \mu t + \sigma B(t)$$. The defaults give standard Brownian motion.

```python
import numpy as np

class BrownianMotion:
    def __init__(self, mu=0.0, sigma=1.0, seed=None):
        if not np.isfinite(mu) or not np.isfinite(sigma) or sigma < 0:
            raise ValueError("Use a finite drift and a nonnegative finite scale.")
        self.mu = mu
        self.sigma = sigma
        self.rng = np.random.default_rng(seed)

    def sample(self, time_vector):
        times = np.asarray(time_vector, dtype=float)
        if times.ndim != 1 or times.size == 0:
            raise ValueError("Provide a nonempty, one-dimensional time vector.")
        if (not np.all(np.isfinite(times)) or times[0] < 0
                or np.any(np.diff(times) <= 0)):
            raise ValueError("Times must be finite, nonnegative, and increasing.")

        # Include the first interval from 0, even when sampling starts later.
        dt = np.diff(np.concatenate(([0.0], times)))
        increments = self.rng.normal(size=times.size) * np.sqrt(dt)
        return self.mu * times + self.sigma * np.cumsum(increments)

    def sample_path(self, t_0=0.0, t_1=1.0, nofpoints=1000):
        if nofpoints < 2 or t_1 <= t_0:
            raise ValueError("Use at least two points and t_1 > t_0.")
        times = np.linspace(t_0, t_1, nofpoints)
        return times, self.sample(times)

motion = BrownianMotion(seed=42)
times, values = motion.sample_path()
```

This samples the process at finitely many times; joining the points in a plot gives an approximation of a continuous path.

![A sample path of standard Brownian motion fluctuating above and below zero.]({{ '/Figures/1002.png' | relative_url }})

*A standard Brownian-motion plot from the original notebook.*
