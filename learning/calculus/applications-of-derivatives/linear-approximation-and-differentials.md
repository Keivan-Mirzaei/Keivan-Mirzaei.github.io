---
layout: learning-topic
title: "Linear approximation and differentials"
permalink: /learning/calculus/applications-of-derivatives/linear-approximation-and-differentials/
course_key: calculus
module_key: applications-of-derivatives
position: "4.1"
description: "Predict a nearby value from a known value and slope, and distinguish the prediction from the actual change."
epigraph:
  text: "All models are wrong but some are useful."
  author: "George E. P. Box"
  source: "Robustness in the Strategy of Scientific Model Building (1979), section heading, p. 202"
  source_url: "https://gwern.net/doc/statistics/decision/1979-box.pdf"
math: true
sitemap: false
topic_script: /assets/js/learning-applications.js
exercises:
  - text: "For \\(f(5)=12\\) and \\(f^{\\prime}(5)=-3\\), estimate \\(f(4.98)\\)."
    options: ["\\(11.94\\)", "\\(12.06\\)", "\\(-0.06\\)", "\\(12.6\\)"]
    correct: 1
    why: "The input step is \\(-0.02\\). The predicted change is \\((-3)(-0.02)=0.06\\), which must be added to \\(12\\)."
  - text: "Which base input is most useful for estimating \\(\\ln(1.03)\\) by a tangent?"
    options: ["\\(0\\)", "\\(1\\)", "\\(1.03\\)", "\\(3\\)"]
    correct: 1
    why: "At \\(1\\), \\(\\ln1=0\\) and the derivative is \\(1\\). Hence the estimate is \\(0.03\\). Choosing the desired input itself would require the value we are trying to estimate."
  - text: "If \\(f(a)=0\\) but \\(f^{\\prime}(a)\\) exists, which statement is correct?"
    options: ["Linearization is impossible", "The relative change is zero", "Linearization is available, but relative change measured against \\(f(a)\\) is undefined"]
    correct: 2
    why: "The tangent formula does not divide by \\(f(a)\\). A relative change does, so that particular measure is unavailable at a zero baseline."
  - text: "For \\(P(r)=r^{-2}\\), a small \\(1\\%\\) increase in positive \\(r\\) predicts what change in \\(P\\)?"
    options: ["About a \\(2\\%\\) decrease", "About a \\(2\\%\\) increase", "Exactly a \\(2\\%\\) decrease", "About a \\(1\\%\\) decrease"]
    correct: 0
    why: "\\(dP/P=-2\\,dr/r\\). This predicts a decrease of about \\(2\\%\\); the differential is an approximation for a finite step."
  - text: "A tangent estimate gives \\(dy=0.4\\). What does this number describe?"
    options: ["The new output value", "The exact output change", "The predicted output change"]
    correct: 2
    why: "The estimate for the new output is the old value plus \\(0.4\\). The actual change may differ from \\(0.4\\)."
  - text: "Why does a differentiable curve admit a useful tangent approximation near \\(a\\)?"
    options: ["The tangent meets the curve only once", "The error divided by the input step tends to zero", "Every derivative is constant nearby"]
    correct: 1
    why: "The derivative limit controls the difference between the actual secant slope and the tangent slope. A tangent may cross or meet the graph again."
---

<!-- Prerequisites: Derivative definition, tangent-line equation, power and chain rules. Established here: Linearization; differential and relative differential; error divided by the step tends to zero. -->

## A known value and a small step

We know that $$\sqrt{4}=2$$, but what about $$\sqrt{4.1}$$? The input has increased by just $$0.1$$. The derivative tells us how quickly the square root changes near $$4$$, so we can use it to estimate the increase in the output.

At $$x=4$$, the graph of $$f(x)=\sqrt{x}$$ passes through $$(4,2)$$ with slope $$1/4$$. Multiplying the input step by this slope predicts an output increase of $$\frac14(0.1)=0.025$$. Adding that increase to the known value gives $$\sqrt{4.1}\approx2.025$$.

Why should a straight line work for a curve? Differentiability says that the secant slope approaches the tangent slope as the step shrinks.

<section class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Linearization</h3>

If $$f$$ is differentiable at $$a$$, its **linearization** at $$a$$ is the tangent-line function

$$L(x)=f(a)+f^{\prime}(a)(x-a).$$

The **linear approximation** is $$f(x)\approx L(x)$$ for inputs near $$a$$. The base input $$a$$ stays fixed; the input $$x$$ varies.

</section>
<div class="topic-widget applications-widget" data-applications="linear">
<figure class="applications-plot">
<svg viewBox="0 0 640 360" role="group" aria-label="A square-root curve and its tangent at four"><title>A square-root curve and its tangent at four</title><desc>The square-root curve and its tangent agree at input four. Their vertical separation increases as the input moves away from four.</desc><image data-applications-fallback href="{{ '/assets/figures/learning/applications-linear.svg' | relative_url }}" width="640" height="360"/></svg>
</figure>
<div class="applications-controls" hidden></div>
<div class="widget-readouts applications-values" hidden></div>
<p class="widget-instruction" markdown="span">Drag the green point. Use the arrow keys when the point is focused; hold Shift for finer steps. Compare the curve with the amber tangent prediction. Return toward $$4$$: the error shrinks faster than the input step.</p>
</div>

At the base point the curve and line agree in both value and slope. Away from it they usually differ. The approximation's usefulness depends on *how far we move* and *how quickly the slopes change*; “small” is relative to the problem.

<mark>Choose a nearby base input where both the value and derivative are easy to evaluate.</mark>

<details class="disclosure" markdown="1">
<summary>Why differentiability gives this approximation (optional)</summary>

For a step $$h\ne0$$, subtract the tangent prediction from the actual value and divide by the step:

$$\begin{gathered}
\frac{f(a+h)-L(a+h)}h\\
=\frac{f(a+h)-f(a)}h-f^{\prime}(a).
\end{gathered}$$

The derivative definition gives

$$\lim_{h\to0}\frac{f(a+h)-L(a+h)}h=0.$$

This is stronger than saying the error tends to zero: the error becomes small *relative to the input step*. It does not give a numerical error bound for a particular nonzero step.

</details>

## Actual change and predicted change

<section class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Differentials</h3>

For an input change $$\Delta x$$ from $$a$$, define

$$\Delta y=f(a+\Delta x)-f(a).$$

The **differentials** are $$dx=\Delta x$$ and $$dy=f^{\prime}(a)\,dx$$. Thus

$$\begin{aligned}
\Delta y&\approx dy,\\
f(a+\Delta x)&\approx f(a)+dy.
\end{aligned}$$

Here $$\Delta y$$ is the actual change along the curve; $$dy$$ is the change along the tangent. Neither is the new output value itself.

<figure class="topic-figure differentials-figure">
<img src="{{ '/assets/figures/learning/applications-differentials.svg' | relative_url }}" width="640" height="400" alt="A curve and its tangent share a base point. A horizontal step dx reaches a new input. From the original height, dy measures the rise to the tangent and Delta y measures the larger rise to the curve." loading="lazy">
<figcaption markdown="span">Both vertical changes start at $$f(a)$$ and use the same input step $$dx=\Delta x$$. The amber arrow measures $$dy$$; the green arrow measures $$\Delta y$$. For this upward-bending curve, $$dy\lt\Delta y$$.</figcaption>
</figure>

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>An estimate on the other side</h3>

Estimate $$\sqrt[3]{7.94}$$. Choose $$f(x)=x^{1/3}$$ and $$a=8$$, so $$f(8)=2$$ and $$f^{\prime}(8)=1/12$$. The step is negative:

$$\begin{aligned}
dx&=7.94-8=-0.06,\\
dy&=\frac1{12}(-0.06)=-0.005.
\end{aligned}$$

Therefore $$\sqrt[3]{7.94}\approx1.995$$. Subtracting the original input from the new input fixes the sign automatically.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A calibration model</h3>

A sensor produces $$R(T)$$ millivolts at temperature $$T$$ in degrees Celsius. At its calibration temperature,

$$\begin{aligned}
R(20)&=50\text{ mV},\\
R^{\prime}(20)&=0.8\text{ mV}/\mathrm{°C}.
\end{aligned}$$

At $$20.3\mathrm{°C}$$ the predicted change is $$0.8(0.3)=0.24\text{ mV}$$, so the estimated reading is $$50.24\text{ mV}$$. The units cancel as they should. These two calibration facts determine the tangent estimate; they do not determine the exact reading away from $$20$$.

</section>

## Relative change and measurement uncertainty

When $$f(a)\ne0$$, dividing the predicted change by the original value gives a **relative differential** $$dy/f(a)$$. Multiply its magnitude by $$100\%$$ for an estimated percentage change.

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>How a radius error affects volume</h3>

A sphere has volume $$V=\frac43\pi r^3$$. Differentiating with respect to radius gives

$$dV=4\pi r^2\,dr,\qquad \frac{dV}{V}=3\frac{dr}{r}.$$

For a measured radius $$10\text{ cm}$$ with possible error of magnitude $$0.02\text{ cm}$$, the predicted volume error has magnitude

$$\begin{aligned}
\lvert dV\rvert&=4\pi(10)^2(0.02)\\
&=8\pi\text{ cm}^3.
\end{aligned}$$

The relative estimate is $$3(0.02/10)=0.006$$, or $$0.6\%$$. The factor $$3$$ explains why a small relative radius error is amplified in the volume.

This is a first-order error estimate. The exact change also includes terms involving $$(dr)^2$$ and $$(dr)^3$$, which the differential discards.

</section>
<section class="warning" markdown="1">
<p class="element-label">Warning</p>

A tangent approximation does not by itself certify an error tolerance. In particular, “within $$0.6\%$$” is stronger than “an estimated error of $$0.6\%$$.” Later in this module, the mean value theorem will give bounds on actual changes.

</section>
