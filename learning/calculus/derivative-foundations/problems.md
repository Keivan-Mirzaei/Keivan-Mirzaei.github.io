---
layout: learning-topic
problem_set: true
title: "Problems"
permalink: /learning/calculus/derivative-foundations/problems/
course_key: calculus
module_key: derivative-foundations
position: "2.5"
description: Connect derivative definitions, geometry, differentiation rules, compositions, and higher derivatives through problems and applications.
math: true
sitemap: false
---

<section class="worked" data-problem-id="read-a-function-and-its-slopes" markdown="1">
<p class="element-label">Problem 1</p>

The graph consists of the line segment from $$(-2,-1)$$ to $$(0,1)$$, followed by the parabola $$y=1+x^2$$ for $$0\le x\le2$$.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/derivative-problems-graph.svg' | relative_url }}" alt="A line of slope one joins a rising parabola at zero, one. The line and parabola meet continuously, with different slopes." width="640" height="360"><figcaption>Sketch the derivative on the interior of the displayed interval.</figcaption></figure>

1. Sketch $$f^{\prime}$$ on $$(-2,2)$$, showing any excluded input with an open circle.
2. Where does $$f^{\prime\prime}$$ exist, and what are its values?
3. Could changing only $$f(0)$$ make $$f$$ differentiable at zero?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

A height on the derivative graph represents a slope on this graph. Check the two limiting slopes at the join.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The line has slope $$1$$, while the parabola has derivative $$2x$$. Hence

$$f^{\prime}(x)=\begin{cases}1,&-2<x<0,\\2x,&0<x<2.\end{cases}$$

Sketch a horizontal segment at height $$1$$ to the left, with an open endpoint at $$(0,1)$$; to the right sketch $$y=2x$$, with an open endpoint at $$(0,0)$$. No value is assigned at zero.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/derivative-problems-slope-graph.svg' | relative_url }}" alt="The derivative is one for negative inputs and twice x for positive inputs. Open circles at zero, one and zero, zero show that the derivative is undefined at zero." width="640" height="360"><figcaption>The two open circles record different limiting slopes. Neither is a value of \(f^{\prime}(0)\).</figcaption></figure>

Differentiating these branches gives

$$f^{\prime\prime}(x)=\begin{cases}0,&-2<x<0,\\2,&0<x<2.\end{cases}$$

The left and right slopes of $$f$$ at zero are $$1$$ and $$0$$. Changing the value at the join cannot reconcile them. In fact, differentiability would require continuity, which already forces $$f(0)=1$$.

</details>
</section>

<section class="worked" data-problem-id="a-derivative-through-a-conjugate" markdown="1">
<p class="element-label">Problem 2</p>

Use the limit definition, rather than a differentiation rule, to find the tangent to $$f(x)=\sqrt{4+x}$$ at $$x=0$$. Then use that tangent to estimate $$\sqrt{4.08}$$. Is the estimate exact?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Rationalise the difference quotient before taking its limit.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$h\ne0$$ near zero,

$$\frac{\sqrt{4+h}-2}{h}=\frac{(4+h)-4}{h(\sqrt{4+h}+2)}=\frac1{\sqrt{4+h}+2}.$$

Thus

$$f^{\prime}(0)=\lim_{h\to0}\frac{\sqrt{4+h}-2}{h}=\frac14.$$

The tangent is $$y=2+x/4$$, giving $$\sqrt{4.08}\approx2.02$$. This is not exact: $$2.02^2=4.0804$$, rather than $$4.08$$.

</details>
</section>

<section class="worked" data-problem-id="recognise-the-definition-in-disguise" markdown="1">
<p class="element-label">Problem 3</p>

Suppose $$f$$ is differentiable at $$2$$, with $$f^{\prime}(2)=-3$$. Find

$$\lim_{h\to0}\frac{f(2+3h)-f(2)}h,
\qquad
\lim_{h\to0}\frac{f(2+h)-f(2-h)}h.$$

Explain why the second denominator is not the horizontal distance between the two sampled inputs.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

For the first limit introduce the increment $$k=3h$$. For the second, add and subtract $$f(2)$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The first quotient is three times a derivative quotient with increment $$3h$$:

$$\lim_{h\to0}3\frac{f(2+3h)-f(2)}{3h}=3f^{\prime}(2)=-9.$$

For the second,

$$\begin{aligned}
\lim_{h\to0}\frac{f(2+h)-f(2-h)}h
&=\lim_{h\to0}\left[\frac{f(2+h)-f(2)}h+\frac{f(2)-f(2-h)}h\right]\\
&=f^{\prime}(2)+f^{\prime}(2)=-6.
\end{aligned}$$

The two inputs differ by $$2h$$, not $$h$$. Dividing by $$2h$$ instead would give a limit of $$-3$$.

</details>
</section>

<section class="worked" data-problem-id="a-tangent-through-a-prescribed-point" markdown="1">
<p class="element-label">Problem 4</p>

Find every tangent to $$y=x^3+2$$ that passes through the origin. Give both the point of tangency and the line.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Write the tangent at an unknown input $$a$$, then impose the condition that $$(0,0)$$ lies on it.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

At $$a$$, the slope is $$3a^2$$. The tangent is

$$y=a^3+2+3a^2(x-a)=3a^2x+2-2a^3.$$

Passing through the origin requires $$2-2a^3=0$$, so $$a=1$$. The only such tangent is $$y=3x$$, touching at $$(1,3)$$. Its passage through another point does not make that point the point of tangency.

</details>
</section>

<section class="worked" data-problem-id="join-value-slope-and-second-derivative" markdown="1">
<p class="element-label">Problem 5</p>

Choose $$a,b$$ so that

$$f(x)=\begin{cases}2x^2+ax+b,&x\le0,\\\dfrac1{1+x},&x>0\end{cases}$$

is differentiable at zero. For your choice, does $$f^{\prime\prime}(0)$$ exist? Justify your answer using one-sided limits.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

First match the heights. Then match the slopes. Finally apply the derivative definition to the resulting first derivative at zero.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Continuity requires $$b=1$$. With this value, the left difference quotient is $$2h+a$$, whose limit is $$a$$. On the right,

$$\frac{1/(1+h)-1}{h}=-\frac1{1+h}\longrightarrow-1.$$

Thus $$a=-1$$. The first derivative is

$$f^{\prime}(x)=\begin{cases}4x-1,&x<0,\\-1,&x=0,\\-(1+x)^{-2},&x>0.\end{cases}$$

The left quotient for the second derivative is $$4$$. The right quotient is

$$\frac{-(1+h)^{-2}+1}{h}=\frac{2+h}{(1+h)^2}\longrightarrow2.$$

These limits disagree, so the second derivative at zero does not exist.

</details>
</section>

<section class="worked" data-problem-id="simplify-without-losing-the-domain" markdown="1">
<p class="element-label">Problem 6</p>

For $$Q(x)=(x^2-1)^2/(x-1)$$, find $$Q^{\prime}(x)$$ efficiently and state its domain. Can $$Q$$ be extended to a differentiable function at $$1$$? If so, give the added value and the new tangent slope there.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Factor before differentiating. Distinguish the original function from its extension.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x\ne1$$,

$$Q(x)=(x-1)(x+1)^2,$$

so the product rule gives

$$Q^{\prime}(x)=(x+1)^2+2(x-1)(x+1)=(x+1)(3x-1),\qquad x\ne1.$$

The polynomial extension $$\widetilde Q(x)=(x-1)(x+1)^2$$ is differentiable everywhere. Set $$\widetilde Q(1)=0$$; its slope there is $$\widetilde Q^{\prime}(1)=4$$. The original $$Q$$ still has no value or derivative at $$1$$.

</details>
</section>

<section class="worked" data-problem-id="combine-rules-without-formulas" markdown="1">
<p class="element-label">Problem 7</p>

Let $$R(x)=f(g(x))/g(x)$$. Both functions are differentiable at the inputs needed, and

$$g(1)=2,\quad g^{\prime}(1)=-3,\quad f(2)=5,\quad f^{\prime}(2)=4.$$

Find $$R^{\prime}(1)$$ without finding formulas for $$f$$ or $$g$$.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

The numerator is a composition. Differentiate it before applying the quotient rule.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The chain and quotient rules give

$$R^{\prime}(x)=\frac{f^{\prime}(g(x))g^{\prime}(x)g(x)-f(g(x))g^{\prime}(x)}{g(x)^2}.$$

Therefore,

$$R^{\prime}(1)=\frac{4(-3)(2)-5(-3)}{2^2}=-\frac94.$$

The denominator is nonzero at the input, so the quotient rule applies there.

</details>
</section>

<section class="worked" data-problem-id="a-light-moving-away" markdown="1">
<p class="element-label">Problem 8</p>

A small light source moves away from a sensor. Its distance is $$r(t)=2+t^2$$ metres, for $$t\ge0$$. The sensor model is $$I=120/r^2$$, with $$I$$ in sensor units.

1. Find $$dI/dt$$ at $$t=1$$, including units.
2. A student uses only $$dI/dr=-240/r^3$$. What rate has the student actually calculated?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Distance is the intermediate variable. Keep the units of each derivative visible.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Since $$dr/dt=2t$$,

$$\frac{dI}{dt}=\frac{dI}{dr}\frac{dr}{dt}=-\frac{240}{r^3}(2t)=-\frac{480t}{(2+t^2)^3}.$$

At $$t=1$$, this is $$-480/27=-160/9$$ sensor units per second. The reading is decreasing.

The student has calculated the change in the reading *per metre of distance*, not per second. Multiplying by the distance rate converts between the two.

</details>
</section>

<section class="worked" data-problem-id="second-derivative-of-a-composition" markdown="1">
<p class="element-label">Problem 9</p>

Let $$H(x)=f(g(x))$$. Derive a formula for $$H^{\prime\prime}(x)$$ using only the product and chain rules. Then evaluate it at $$a$$ given

$$g(a)=1,\quad g^{\prime}(a)=2,\quad g^{\prime\prime}(a)=-1,\quad f^{\prime}(1)=3,\quad f^{\prime\prime}(1)=-2.$$

Assume both functions have the second derivatives needed.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Start with $$H^{\prime}(x)=f^{\prime}(g(x))g^{\prime}(x)$$. Both factors now depend on $$x$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Differentiating the product,

$$H^{\prime\prime}(x)=f^{\prime\prime}(g(x))\bigl(g^{\prime}(x)\bigr)^2+f^{\prime}(g(x))g^{\prime\prime}(x).$$

The first term differentiates the outer derivative through its inner input. The second term accounts for the changing inner rate. Thus

$$H^{\prime\prime}(a)=(-2)(2^2)+3(-1)=-11.$$

Squaring only the first-derivative formula would miss this structure.

</details>
</section>

<section class="worked" data-problem-id="a-round-trip-without-integrals" markdown="1">
<p class="element-label">Problem 10</p>

A robot moves along a straight line with position $$s(t)=t^3-3t^2$$ metres for $$0\le t\le3$$ seconds.

1. When is it at rest, and when does it reverse direction within the time interval?
2. Find its displacement and total distance travelled.
3. At $$t=1$$, is it stopped? What is its acceleration then?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Find the sign of velocity on either side of each zero. Total distance adds the lengths of the separate parts of the trip; it is not just the final position minus the initial position.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The velocity and acceleration are

$$v(t)=3t(t-2),\qquad a(t)=6t-6.$$

It is at rest at $$t=0$$ and $$t=2$$. Velocity is negative for $$0<t<2$$ and positive for $$2<t\le3$$, so it reverses direction at $$2$$. There is no earlier motion in this model from which to infer a reversal at the initial time.

The positions are $$s(0)=0$$, $$s(2)=-4$$, and $$s(3)=0$$. Displacement is $$0\,\mathrm{m}$$; distance is $$4+4=8\,\mathrm{m}$$.

At $$t=1$$, velocity is $$-3\,\mathrm{m/s}$$ while acceleration is zero. Zero acceleration at an instant does not mean the robot is stopped.

</details>
</section>

<section class="worked" data-problem-id="concentration-while-material-is-lost" markdown="1">
<p class="element-label">Problem 11</p>

A solution has dissolved mass $$M(t)$$ grams and volume $$V(t)$$ litres. Its concentration is $$C=M/V$$. At one instant,

$$M=10,\quad M^{\prime}=-0.2,\quad V=2,\quad V^{\prime}=-0.1,$$

with time in minutes. Is the concentration rising or falling, and how fast? Explain how your answer is compatible with dissolved mass being lost.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Differentiate the ratio. Losing some dissolved material and losing some liquid have competing effects on concentration.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The quotient rule gives

$$C^{\prime}=\frac{M^{\prime}V-MV^{\prime}}{V^2}
=\frac{(-0.2)(2)-10(-0.1)}{2^2}=0.15\,\mathrm{g/(L\cdot min)}.$$

The concentration is rising. The loss of volume concentrates what remains strongly enough to outweigh the loss of dissolved mass. The mass rate alone cannot determine the concentration rate.

</details>
</section>

<section class="worked" data-problem-id="sampled-values-do-not-fix-a-slope" markdown="1">
<p class="element-label">Problem 12</p>

A sensor reports $$F(-1)=F(0)=F(1)=0$$. Someone concludes that $$F^{\prime}(0)=0$$.

Construct a polynomial satisfying all three measurements but with $$F^{\prime}(0)=5$$. Then construct one with any prescribed slope $$m$$ at zero. What do these examples say about recovering an exact instantaneous rate from finitely many values?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

A multiple of $$x(x-1)(x+1)$$ preserves all three measured zeros. Choose the multiplier to set the derivative.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Take $$F(x)=-5x(x^2-1)=5x-5x^3$$. It vanishes at all three measured inputs, but

$$F^{\prime}(x)=5-15x^2,\qquad F^{\prime}(0)=5.$$

For any real $$m$$, use $$F_m(x)=mx-mx^3$$. Then $$F_m^{\prime}(0)=m$$ while the three sampled values remain zero.

These measurements alone do not fix the exact derivative, even among polynomials. Estimating a derivative from samples needs additional assumptions about behavior between measurements.

</details>
</section>

<section class="worked" data-problem-id="challenge-all-common-tangents" markdown="1">
{% include learning/problem-label.html number=13 difficulty=4 %}

Find every line tangent to the graph of $$f(x)=x^4-2x^2$$ at two distinct points. Give the line and both points of tangency, and prove that your list is complete.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Let the two inputs be $$a\ne b$$. The tangents need the same slope *and* the same vertical intercept. Factor the differences of these two conditions before making any assumptions about symmetry.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The tangent at $$a$$ has slope $$4a^3-4a$$ and intercept

$$f(a)-af^{\prime}(a)=-3a^4+2a^2.$$

Equal slopes at distinct inputs give

$$4(a-b)(a^2+ab+b^2-1)=0,
\qquad a^2+ab+b^2=1.$$

Equal intercepts give

$$(a^2-b^2)\bigl[2-3(a^2+b^2)\bigr]=0.$$

There are two cases.

If $$a^2=b^2$$, distinctness forces $$b=-a$$. The slope condition becomes $$a^2=1$$, giving the pair $$-1,1$$. Both slopes are zero and both heights are $$-1$$, so the common tangent is

$$y=-1,$$

at $$(-1,-1)$$ and $$(1,-1)$$.

Otherwise, the intercept condition forces $$a^2+b^2=2/3$$. The slope condition then gives $$ab=1/3$$, so

$$(a-b)^2=a^2+b^2-2ab=\frac23-\frac23=0.$$

This contradicts distinctness. Hence there are no other common tangents. Symmetry suggests the answer, but the two conditions are what establish completeness.

</details>
</section>

<section class="worked" data-problem-id="challenge-minimum-degree-camera-motion" markdown="1">
{% include learning/problem-label.html number=14 difficulty=4 %}

Design a polynomial position model $$p(t)$$ for a camera slider, measured in metres, during $$0\le t\le1$$ second. It must satisfy

$$\begin{aligned}
p(0)&=0,&p(1)&=1,\\
p^{\prime}(0)&=0,&p^{\prime}(1)&=0,\\
p^{\prime\prime}(0)&=0,&p^{\prime\prime}(1)&=0.
\end{aligned}$$

The camera must also be at position $$1/3$$ at $$t=1/2$$, and must never move backwards.

Find a polynomial of the **smallest possible degree** that meets *all* these conditions. Prove both that it works and that no lower degree can work. You may use the fact that a polynomial with a double zero at $$a$$ has a factor $$(t-a)^2$$.

<details class="disclosure" markdown="1">
<summary>Hint 1</summary>

Start without the midpoint condition. The endpoint velocity and acceleration conditions force $$p^{\prime}(t)$$ to have double zeros at both ends. Find the unique polynomial of degree at most five meeting the six endpoint conditions.

</details>
<details class="disclosure" markdown="1">
<summary>Hint 2</summary>

A correction preserving the value, first derivative, and second derivative at both ends has the factor $$t^3(1-t)^3$$. Try a constant multiplier first. If that forces backward motion, try a linear multiplier. Factor the velocity before choosing any remaining coefficient.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

**First establish a lower bound.** The velocity has double zeros at $$0$$ and $$1$$, so it contains $$t^2(1-t)^2$$ as a factor. It is not identically zero, since the endpoint positions differ. Its degree is at least four; therefore the position degree is at least five.

A polynomial of degree at most five with the initial three conditions has the form $$At^3+Bt^4+Ct^5$$. The final three conditions give

$$\begin{aligned}
A+B+C&=1,\\
3A+4B+5C&=0,\\
6A+12B+20C&=0.
\end{aligned}$$

Solving gives the unique candidate

$$p_5(t)=10t^3-15t^4+6t^5.$$

But $$p_5(1/2)=1/2$$, so degree five cannot meet the midpoint requirement.

**Rule out degree six.** The difference between any other candidate and $$p_5$$ must have its value and first two derivatives zero at each endpoint. For a polynomial, vanishing value and first two derivatives force the constant, linear, and quadratic coefficients in powers of the displacement from that endpoint to vanish. Each endpoint therefore contributes a triple factor, so the difference is divisible by $$t^3(1-t)^3$$. For degree at most six, every candidate has the form

$$p_6(t)=p_5(t)+c\,t^3(1-t)^3.$$

At the midpoint, $$1/2+c/64=1/3$$ forces $$c=-32/3$$. Its velocity is

$$p_6^{\prime}(t)=t^2(1-t)^2(64t-2),$$

which is negative for $$0<t<1/32$$. It initially moves backwards. Thus no polynomial of degree at most six can satisfy all the requirements.

**Construct a degree-seven solution.** Write

$$p(t)=p_5(t)+t^3(1-t)^3(a+bt).$$

The midpoint condition is $$a+b/2=-32/3$$. Differentiating and factoring gives

$$p^{\prime}(t)=t^2(1-t)^2\bigl[30+3a(1-2t)+b(4t-7t^2)\bigr].$$

Choose $$a=-10$$ so the bracket's constant term is zero. The midpoint condition then gives $$b=-4/3$$. This yields

$$\boxed{p(t)=10t^3-15t^4+6t^5-t^3(1-t)^3\left(10+\frac43t\right)}.$$

The correction preserves all six endpoint conditions, and at the midpoint it changes $$1/2$$ by $$-1/6$$, giving $$1/3$$. Its velocity simplifies to

$$p^{\prime}(t)=\frac43t^3(1-t)^2(41+7t)\ge0\qquad(0\le t\le1).$$

It therefore never moves backwards. The degree is seven, and the exclusions above prove that seven is the smallest possible degree. The solution need not be unique among degree-seven polynomials; one verified construction suffices.

</details>
</section>
