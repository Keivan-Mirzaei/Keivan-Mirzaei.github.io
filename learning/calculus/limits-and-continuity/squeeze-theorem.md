---
layout: learning-topic
title: "Squeeze theorem and trigonometric limits"
permalink: /learning/calculus/limits-and-continuity/squeeze-theorem/
course_key: calculus
module_key: limits-and-continuity
position: "1.3"
description: Find a limit by trapping a function between simpler ones, then apply the idea to small angles.
math: true
topic_script: /assets/js/learning-squeeze.js
sitemap: false
exercises:
  - text: 'A sensor’s error satisfies \(\lvert E(h)\rvert\le 3h^2\) near \(h=0\). What follows as \(h\to0\)?'
    options: ['\(E(h)\) must equal \(3h^2\)', '\(E(h)\to0\)', '\(E(h)\) must be positive', 'Nothing, unless a formula for \(E\) is known']
    correct: 1
    why: 'The bound gives \(-3h^2\le E(h)\le3h^2\). Both bounds tend to zero, so the squeeze theorem determines the limit without an exact error formula.'
  - text: 'Near \(x=0\), you know only that \(-1\le F(x)\le1\). What can you conclude about \(\lim_{x\to0}F(x)\)?'
    options: ['It equals \(0\)', 'It does not exist', 'These bounds do not determine it', 'It equals \(1\)']
    correct: 2
    why: 'The bounding limits differ. The constant function \(F(x)=0\) and the oscillating function \(F(x)=\sin(1/x)\) both obey the bounds, but only the first has a limit at zero.'
  - text: 'For a positive constant \(k\), \(\displaystyle\lim_{x\to0}\frac{\sin(kx)}{3x}=6\). What is \(k\)?'
    options: ['\(2\)', '\(6\)', '\(9\)', '\(18\)']
    correct: 3
    why: 'Write the quotient as \((k/3)\sin(kx)/(kx)\). The trigonometric ratio tends to one, so \(k/3=6\), giving \(k=18\).'
  - text: 'What is \(\displaystyle\lim_{x\to0}\frac{\sin(x^2)}{x}\)?'
    options: ['\(0\)', '\(1\)', 'The limit does not exist', '\(2\)']
    correct: 0
    why: 'For \(x\ne0\), rewrite as \(x\,\sin(x^2)/x^2\). Since \(x^2\to0\), the ratio tends to one and the product tends to zero. Alternatively, \(\lvert\sin(x^2)/x\rvert\le\lvert x\rvert\).'
  - text: 'A student rewrites \(\frac{1-\cos(3x)}{x^2}\) as \(\frac{1-\cos(3x)}{(3x)^2}\) and reports a limit of \(1/2\). Which factor is missing?'
    options: ['\(3\)', '\(1/3\)', '\(9\)', '\(1/9\)']
    correct: 2
    why: 'Since \((3x)^2=9x^2\), the original expression equals \(9(1-\cos(3x))/(3x)^2\). Its limit is \(9/2\); the angle scaling is squared in the denominator.'
  - text: 'On a circle of radius \(R>0\), an angle \(\theta\) cuts off arc length \(R\theta\) and chord length \(2R\sin(\theta/2)\). As \(\theta\to0^+\), what does chord length divided by arc length approach?'
    options: ['\(0\)', '\(1\)', '\(R\)', '\(2\)']
    correct: 1
    why: 'The ratio is \(\sin(\theta/2)/(\theta/2)\), so its limit is one. For small angles the arc and chord lengths become close in relative terms; the radius cancels.'
---

## The idea

An exact formula is not always the easiest route to a limit. The **squeeze theorem** determines what a function approaches by trapping its values between two simpler functions with the *same* limit.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Squeeze theorem</h3>

Suppose, for all inputs sufficiently close to $$a$$ with possibly $$x\ne a$$,

$$\ell(x)\le f(x)\le u(x).$$

If $$\lim_{x\to a}\ell(x)=\lim_{x\to a}u(x)=L$$, then

$$\lim_{x\to a}f(x)=L.$$

The same statement holds for a one-sided approach.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

Choose any small interval around $$L$$. Since both bounding functions approach $$L$$, they both stay inside that interval once $$x$$ is sufficiently close to $$a$$, with $$x\ne a$$. The value $$f(x)$$ lies between them, so it must stay inside the same interval. This is exactly what it means for $$f(x)$$ to approach $$L$$.

</details>
</section>

<mark>The bounds must close in on the same value; the trapped function can keep changing direction or oscillating.</mark>

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Unit-circle identities</h3>

Angles are in *radians*. Recall $$\lvert\sin t\rvert\le1$$, $$\sin^2t+\cos^2t=1$$, and $$\tan t=\sin t/\cos t$$ where defined.

</aside>

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Oscillation inside a shrinking envelope</h3>

For $$x\ne0$$, the sine bound gives

$$-x^2\le x^2\sin(1/x)\le x^2.$$

Since $$\lim_{x\to0}(-x^2)=\lim_{x\to0}x^2=0$$, the squeeze theorem gives

$$\lim_{x\to0}x^2\sin(1/x)=0.$$

We do not use a product law with $$\sin(1/x)$$: that factor has no limit at zero.

</section>

<div class="topic-widget squeeze-widget" id="squeeze-explorer">
<div class="squeeze-legend"><span>\(f(x)=x^2\sin(1/x)\)</span><span>\(y=\pm x^2\)</span></div>
<svg viewBox="0 0 640 380" role="img" aria-labelledby="squeeze-title squeeze-desc">
<title id="squeeze-title">Zoom toward the squeezing point</title>
<desc id="squeeze-desc">The green oscillating function stays between amber square-function bounds. Zooming narrows the input range; the vertical scale adjusts to keep the oscillations visible as the output bounds shrink.</desc>
<defs><clipPath id="squeeze-clip"><rect x="60" y="35" width="520" height="300"/></clipPath></defs>
<path d="M60 185H590M320 335V25" fill="none" stroke="#c9d1c6"/>
<g clip-path="url(#squeeze-clip)"><path id="squeeze-upper" fill="none" stroke="#a67936" stroke-width="1.7"/><path id="squeeze-lower" fill="none" stroke="#a67936" stroke-width="1.7"/><path id="squeeze-middle" fill="none" stroke="#285b46" stroke-width="2.4" stroke-linejoin="round"/></g>
<path class="axis-ticks" d="M70 182V188M570 182V188M317 55H323M317 315H323" fill="none" stroke="#9eac96" stroke-width="1"/>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text id="squeeze-left" x="70" y="208" text-anchor="middle">−1</text><text id="squeeze-right" x="570" y="208" text-anchor="middle">1</text><text id="squeeze-top" x="305" y="60" text-anchor="end">1</text><text id="squeeze-bottom" x="305" y="320" text-anchor="end">−1</text><text x="306" y="207" text-anchor="end">0</text></g>
<g fill="#282e29" font-family="Georgia,serif" font-style="italic" font-size="17"><text x="603" y="190">x</text><text x="331" y="25">y</text></g>
</svg>
<div class="squeeze-readouts"><span>\(\lvert x\rvert\le\) <output id="squeeze-radius">1</output></span><span>\(\lvert f(x)\rvert\le\) <output id="squeeze-bound">1</output></span></div>
<div class="widget-controls"><label for="squeeze-zoom">Zoom<input id="squeeze-zoom" type="range" min="0" max="100" value="0" aria-label="Zoom toward zero"></label></div>
<p class="widget-instruction">Zoom toward \(0\). Read the shrinking axis values: the vertical scale adjusts to keep the oscillations visible.</p>
<noscript><figure class="topic-figure"><img src="{{ '/assets/figures/learning/squeeze-envelope.svg' | relative_url }}" alt="The green oscillating curve stays between the amber bounds y equals plus or minus x squared, which approach zero." width="640" height="340"></figure></noscript>
</div>

## Two useful trigonometric limits

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Basic trigonometric limits</h3>

$$\begin{aligned}
\lim_{t\to0}\frac{\sin t}{t}&=1,\\
\lim_{t\to0}\frac{1-\cos t}{t^2}&=\frac12.
\end{aligned}$$

<details class="disclosure" markdown="1">
<summary>Proof of the sine limit (optional)</summary>

<figure class="topic-figure">
<img src="{{ '/assets/figures/learning/squeeze-unit-circle.svg' | relative_url }}" alt="O is the unit-circle centre, A is (1,0), B lies on the circle at angle t, and D is directly below B on the horizontal axis. Chord AB is the hypotenuse of right triangle ADB. C is where ray OB meets the tangent through A." width="640" height="360">
<figcaption>The chord \(AB\) is shorter than the arc, while \(BD\le AB\).</figcaption>
</figure>

For $$0<t<\pi/2$$, the unit-circle arc $$AB$$ has length $$t$$. The chord is shorter, and is the hypotenuse of triangle $$ADB$$, whose vertical side is $$BD=\sin t$$. Thus

$$0\le\sin t\le AB\le t.$$

Since $$\sin(-t)=-\sin t$$, we obtain $$\lvert\sin t\rvert\le\lvert t\rvert$$ near zero. Squeezing gives $$\lim_{t\to0}\sin t=0$$; since cosine is positive near zero,

$$\lim_{t\to0}\cos t=\lim_{t\to0}\sqrt{1-\sin^2t}=1.$$

For the other bound, triangle $$OAB$$ lies inside the sector, inside triangle $$OAC$$. Their areas give

$$\frac{\sin t}{2}\le\frac{t}{2}\le\frac{\tan t}{2}
\quad\Longrightarrow\quad
\cos t\le\frac{\sin t}{t}\le1.$$

Here the sector area is half its angle on a unit circle; each triangle area is half its base times height. Squeezing yields the right-hand limit $$1$$. The ratio is even, $$\sin(-t)/(-t)=\sin t/t$$, so the left-hand limit is also $$1$$.

</details>

<details class="disclosure" markdown="1">
<summary>Proof of the cosine limit (optional)</summary>

The preceding proof established $$\lim_{t\to0}\cos t=1$$ as well as the sine ratio limit. For nearby $$t\ne0$$, multiply by the conjugate:

$$\begin{aligned}
\frac{1-\cos t}{t^2}
&=\frac{1-\cos t}{t^2}\cdot\frac{1+\cos t}{1+\cos t}\\
&=\frac{1-\cos^2t}{t^2(1+\cos t)}\\
&=\frac{\sin^2t}{t^2(1+\cos t)}
=\left(\frac{\sin t}{t}\right)^2\frac1{1+\cos t}.
\end{aligned}$$

The denominator approaches $$2\ne0$$, so the limit laws give

$$\lim_{t\to0}\frac{1-\cos t}{t^2}
=\left(\lim_{t\to0}\frac{\sin t}{t}\right)^2
\frac1{1+\lim_{t\to0}\cos t}=1^2\cdot\frac12=\frac12.$$

</details>
</section>

The proofs also establish $$\lim_{t\to0}\sin t=0$$ and $$\lim_{t\to0}\cos t=1$$, which we can now use with the limit laws.

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Match the angle to the denominator</h3>

As $$x\to0$$, the angle $$5x\to0$$. For $$x\ne0$$,

$$\frac{\sin(5x)}{2x}=\frac52\frac{\sin(5x)}{5x}.$$

Therefore,

$$\lim_{x\to0}\frac{\sin(5x)}{2x}
=\frac52\lim_{x\to0}\frac{\sin(5x)}{5x}=\frac52.$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Tangent follows from sine and cosine</h3>

For nearby $$x\ne0$$,

$$\frac{\tan x}{x}=\frac{\sin x}{x}\cdot\frac1{\cos x}.$$

Using the two established limits and the quotient law,

$$\lim_{x\to0}\frac{\tan x}{x}
=\left(\lim_{x\to0}\frac{\sin x}{x}\right)\frac1{\lim_{x\to0}\cos x}=1.$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>A smaller denominator changes the limit</h3>

The cosine limit has a squared denominator. For nearby $$x\ne0$$,

$$\frac{1-\cos x}{x}=x\cdot\frac{1-\cos x}{x^2}.$$

Consequently,

$$\lim_{x\to0}\frac{1-\cos x}{x}
=\left(\lim_{x\to0}x\right)
\left(\lim_{x\to0}\frac{1-\cos x}{x^2}\right)=0\cdot\frac12=0.$$

The numerator is the same as in the featured limit, but the different denominator gives a different result.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

The bounds in the squeeze theorem must hold at all sufficiently nearby inputs other than the point itself, not just at a few plotted points. And $$\sin t/t$$ approaches $$1$$ only as the angle $$t$$ approaches $$0$$; it is not equal to $$1$$ at nearby nonzero angles, and the quotient itself is undefined at $$0$$.

</aside>
