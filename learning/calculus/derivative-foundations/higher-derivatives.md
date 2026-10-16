---
layout: learning-topic
title: "Derivatives as functions and higher derivatives"
permalink: /learning/calculus/derivative-foundations/higher-derivatives/
course_key: calculus
module_key: derivative-foundations
position: "2.4"
description: Read a whole function of slopes, then differentiate the rate itself.
math: true
topic_script: /assets/js/learning-higher-derivatives.js
sitemap: false
exercises:
  - text: 'A temperature model has \(T^{\prime}(10)=-2\,\mathrm{°C/min}\) and \(T^{\prime\prime}(10)=0.3\,\mathrm{°C/min^2}\). What do these values say at that instant?'
    options: ['Temperature is rising faster', 'Temperature is falling, and its rate is becoming less negative', 'Temperature is falling faster', 'Temperature is positive']
    correct: 1
    why: 'The negative first derivative means temperature is falling. The positive second derivative means that rate is increasing toward less negative values: the cooling is easing at that instant. Neither value determines the temperature itself.'
  - text: 'For \(p(x)=x^5-3x^2\), find \(p^{(3)}(x)\).'
    options: ['\(20x^3-6\)', '\(60x^2\)', '\(60x^2-6\)', '\(120x\)']
    correct: 1
    why: 'Successive differentiation gives \(p^{\prime}=5x^4-6x\), \(p^{\prime\prime}=20x^3-6\), then \(p^{(3)}=60x^2\). The constant disappears in the third derivative.'
  - text: 'Two differentiable functions satisfy \(F(x)=G(x)+7\) throughout an interval. Which statement must hold there?'
    options: ['\(F^{\prime}=G^{\prime}+7\)', '\(F^{\prime}=7G^{\prime}\)', '\(F^{\prime}=G^{\prime}\)', '\(F=G\)']
    correct: 2
    why: 'A vertical shift does not change any tangent slope. Differentiating the constant gives zero, so the derivative functions agree even though the original functions differ.'
  - text: 'A moving cart has velocity \(v=-4\,\mathrm{m/s}\) and acceleration \(a=-1\,\mathrm{m/s^2}\). What is happening to its speed at that instant?'
    options: ['It is decreasing', 'It is increasing', 'It is zero', 'Acceleration alone cannot affect speed']
    correct: 1
    why: 'The cart moves in the negative direction and its velocity is becoming more negative. Its speed, the magnitude of velocity, is therefore increasing. Negative acceleration does not always mean slowing down.'
  - text: 'Let \(q(x)=1/(x-2)\). What is the domain of its second derivative?'
    options: ['All real numbers', '\(x>2\)', '\(x\ne2\)', '\(x\ne0\)']
    correct: 2
    why: 'Writing \(q=(x-2)^{-1}\) gives \(q^{\prime}=-(x-2)^{-2}\) and \(q^{\prime\prime}=2(x-2)^{-3}\). Both derivatives exist for every \(x\ne2\); differentiation does not fill the original hole.'
  - text: 'Suppose \(f^{\prime}(x)=x^2+1\). At \(x=-1\), which pair is correct?'
    options: ['\(f^{\prime}(-1)=2,\ f^{\prime\prime}(-1)=-2\)', '\(f^{\prime}(-1)=-2,\ f^{\prime\prime}(-1)=2\)', '\(f(-1)=2,\ f^{\prime\prime}(-1)=0\)', '\(f^{\prime}(-1)=2,\ f^{\prime\prime}(-1)=2\)']
    correct: 0
    why: 'Evaluate the given derivative function to get \(2\). Differentiate it to obtain \(f^{\prime\prime}(x)=2x\), which is \(-2\) at \(-1\). The original function is rising while its slope is decreasing.'
  - text: 'For \(f(x)=x|x|\), one finds \(f^{\prime}(x)=2|x|\), including \(f^{\prime}(0)=0\). Does \(f^{\prime\prime}(0)\) exist?'
    options: ['Yes, it is \(0\)', 'Yes, it is \(2\)', 'No: the derivative function has a corner at zero', 'No: the original function is discontinuous']
    correct: 2
    why: 'The difference quotient for the derivative function is \(2|h|/h\). Its left and right limits are \(-2\) and \(2\), so no second derivative exists at zero. A first derivative can exist without a second derivative.'
---

## A function of slopes

The number $$f^{\prime}(a)$$ is the tangent slope at one input. Letting the input vary gives the **derivative function**:

$$f^{\prime}(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}h.$$

Its domain contains exactly the inputs where this limit exists as a finite number. A point on the graph of $$f^{\prime}$$ records a *slope* of $$f$$, rather than a height of $$f$$.

For example, $$f(x)=x^2$$ gives $$f^{\prime}(x)=2x$$: negative inputs have negative slopes, zero has a horizontal tangent, and positive inputs have positive slopes. The graph of the derivative is a line even though the original graph is a parabola.

## Differentiating a rate

<section class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Higher derivatives</h3>

The **second derivative** is the derivative of the first derivative:

$$f^{\prime\prime}(x)=\lim_{h\to0}\frac{f^{\prime}(x+h)-f^{\prime}(x)}h.$$

It measures how the slope of $$f$$ changes. Repeating the process gives the **third derivative** $$f^{(3)}$$ and, more generally, the **nth derivative** $$f^{(n)}$$, wherever each successive derivative exists.

For $$y=f(x)$$, the notations $$y^{\prime\prime}$$ and $$d^2y/dx^2$$ also mean the second derivative. Here $$d^2y/dx^2=d(dy/dx)/dx$$; it is *not* the square of $$dy/dx$$.

</section>

<mark>The height of the derivative graph tells you the slope of the original graph. Its slope tells you the second derivative.</mark>

If $$f^{\prime\prime}>0$$ on an interval, $$f^{\prime}$$ is increasing there; if $$f^{\prime\prime}<0$$, it is decreasing. The sign of $$f^{\prime\prime}$$ alone does not tell you whether $$f$$ is rising or falling.

## Position, velocity, acceleration

For motion along a straight track, **position** $$s(t)$$ records location relative to an origin. **Velocity** $$v(t)=s^{\prime}(t)$$ is its rate of change, and **acceleration** $$a(t)=v^{\prime}(t)=s^{\prime\prime}(t)$$ is the rate of change of velocity. **Speed** is $$\lvert v(t)\rvert$$: it has no direction.

Consider a cart with position, in metres,

$$s(t)=t^3-6t^2+9t,\qquad 0\le t\le4.$$

The rules already introduced give

$$v(t)=3t^2-12t+9,\qquad a(t)=6t-12.$$

<div class="topic-widget higher-widget" id="higher-explorer">
<div class="higher-playback"><button type="button" id="higher-play" aria-label="Play motion">Play</button></div>
<svg class="higher-track" viewBox="0 0 640 110" role="img" aria-labelledby="higher-track-title higher-track-desc">
<title id="higher-track-title">Cart on a straight track</title>
<desc id="higher-track-desc">The cart’s location matches the position graph at the selected time. Track marks show position in metres.</desc>
<path d="M60 63H490" stroke="#c9d1c6" fill="none"/>
<path d="M60 60V67M167.5 60V67M275 60V67M382.5 60V67M490 60V67" stroke="#9eac96" fill="none"/>
<g fill="#686e66" font-size="12" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" text-anchor="middle"><text x="60" y="86">0</text><text x="167.5" y="86">1</text><text x="275" y="86">2</text><text x="382.5" y="86">3</text><text x="490" y="86">4</text><text x="564" y="68">Position (m)</text></g>
<g id="higher-cart" transform="translate(422.8125 0)">
<rect x="-17" y="37" width="34" height="18" rx="3" fill="#dce8df" stroke="#285b46" stroke-width="1.5"/>
<circle cx="-10" cy="58" r="5" fill="#285b46"/><circle cx="10" cy="58" r="5" fill="#285b46"/>
</g>
</svg>
<svg id="higher-position" viewBox="0 0 640 180" role="group" aria-label="Position graph with draggable time"></svg>
<svg id="higher-velocity" viewBox="0 0 640 180" role="group" aria-label="Velocity graph with draggable time"></svg>
<svg id="higher-acceleration" viewBox="0 0 640 180" role="group" aria-label="Acceleration graph with draggable time"></svg>
<div class="widget-readouts higher-values"><span>\(t=\) <output id="higher-time">1.50</output> \(\mathrm{s}\)</span><span>\(s=\) <output id="higher-s">3.38</output> \(\mathrm{m}\)</span><span>\(v=\) <output id="higher-v">−2.25</output> \(\mathrm{m/s}\)</span><span>\(a=\) <output id="higher-a">−3.00</output> \(\mathrm{m/s^2}\)</span></div>
<p class="widget-instruction">Play the motion, or drag a point to choose a time. Compare each amber tangent with the height of the graph below it. At \(t=2\), velocity is most negative, but its slope—and hence acceleration—is zero.</p>
</div>

At $$t=1.5$$, both velocity and acceleration are negative: the cart moves in the negative direction and speeds up. At $$t=2.5$$, velocity is still negative but acceleration is positive: it moves in the same direction while slowing down. Acceleration describes the change in *velocity*, not the direction of motion.

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Differentiate the function, then evaluate</h3>

Let $$f(x)=x^4-2x^3+x$$. Successive differentiation gives

$$\begin{aligned}
f^{\prime}(x)&=4x^3-6x^2+1,\\
f^{\prime\prime}(x)&=12x^2-12x,\\
f^{(3)}(x)&=24x-12,\\
f^{(4)}(x)&=24,\qquad f^{(5)}(x)=0.
\end{aligned}$$

At $$x=1$$, $$f^{\prime}(1)=-1$$ and $$f^{\prime\prime}(1)=0$$. The original graph has slope $$-1$$ there; the derivative graph has a horizontal tangent. These are different statements.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Use the chain rule again</h3>

For $$y=(1+x^2)^3$$, first differentiate the composition:

$$y^{\prime}=6x(1+x^2)^2.$$

Now differentiate this *new function*, using the product and chain rules:

$$\begin{aligned}
y^{\prime\prime}&=6(1+x^2)^2+6x\bigl[2(1+x^2)\cdot2x\bigr]\\
&=6(1+x^2)(1+5x^2).
\end{aligned}$$

The second derivative is positive for every real input, so the first derivative is increasing—even where the first derivative itself is negative.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Keep track of domains</h3>

For $$r(x)=\sqrt{x}$$, the function is defined for $$x\ge0$$, but

$$r^{\prime}(x)=\frac12x^{-1/2},\qquad
r^{\prime\prime}(x)=-\frac14x^{-3/2},\qquad x>0.$$

There is no finite first derivative at zero, so there cannot be a second derivative there. For $$x>0$$, $$r^{\prime}>0$$ while $$r^{\prime\prime}<0$$: the graph rises, but its slopes become less steep.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Existence of $$f^{\prime}(a)$$ does not guarantee existence of $$f^{\prime\prime}(a)$$. Each new derivative needs its own finite limit. Also, $$f^{\prime\prime}(a)=0$$ does not mean $$f^{\prime}(a)=0$$ or that the function is locally constant.

</aside>
