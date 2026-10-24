---
layout: learning-topic
problem_set: true
title: "Problems"
permalink: /learning/calculus/applications-of-derivatives/problems/
course_key: calculus
module_key: applications-of-derivatives
position: "4.9"
description: Investigate estimates, motion, graphs, constrained design and consequences of the mean value theorem.
math: true
sitemap: false
---

<!-- Prerequisites: The eight teaching topics in this module. Established here: No new required calculus theory. -->

<section class="worked" data-problem-id="applications-calibration" markdown="1">
{% include learning/problem-label.html number=1 difficulty=1 %}
<h3>What can a calibration tell you?</h3>

A scale has reading $$R(m)$$ in grams when a mass $$m$$ grams is placed on it. At calibration, $$R(100)=100.4$$ and $$R^{\prime}(100)=0.98$$. Estimate its reading at $$m=100.5$$.

A technician calls your answer “the exact reading, to two decimal places.” Does the information support that claim? Explain what further kind of information would help certify accuracy.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Keep the original reading and the predicted change separate.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The step is $$0.5\text{ g}$$, giving predicted change $$0.98(0.5)=0.49\text{ g}$$. Thus $$R(100.5)\approx100.89\text{ g}$$.

This is a tangent estimate. We know only one value and slope, so the exact departure of the curve from that tangent is undetermined. Information controlling derivative variation throughout the interval could provide an error bound. Writing two decimal places is a display choice, not a certificate of accuracy.

</details>
</section>

<section class="worked" data-problem-id="applications-squared-error" markdown="1">
{% include learning/problem-label.html number=2 difficulty=1 %}
<h3>An error estimate is not always a bound</h3>

The side of a square is measured as $$10\text{ cm}$$, with possible error at most $$0.1\text{ cm}$$. Use a differential to estimate the area error. Then calculate the greatest actual area error over the allowed side lengths. Does the estimate bound that error?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Compare the areas at $$9.9$$ and $$10.1$$ with the nominal area $$100$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$A=s^2$$, $$dA=2s\,ds$$, so the predicted error magnitude is at most $$2(10)(0.1)=2\text{ cm}^2$$.

The actual area varies from $$9.9^2=98.01$$ to $$10.1^2=102.01\text{ cm}^2$$. The downward error is $$1.99$$ and the upward error is $$2.01\text{ cm}^2$$. Thus the greatest magnitude is $$2.01\text{ cm}^2$$: the differential estimate is not a strict bound. The missing term in $$\Delta A=20\,\Delta s+(\Delta s)^2$$ explains the difference.

</details>
</section>

<section class="worked" data-problem-id="applications-reading-slopes" markdown="1">
{% include learning/problem-label.html number=3 difficulty=1 %}
<h3>Read a function without seeing it</h3>

The figure gives $$f^{\prime}$$ for a differentiable function $$f$$ on $$[-3,3]$$. The indicated segments are straight.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/applications-problem-slopes.svg' | relative_url }}" alt="The derivative decreases linearly from minus three, one to minus one, minus one, then increases to one, one, then decreases to three, minus one." width="640"><figcaption>This is the derivative graph. Its height gives a slope of the unseen function.</figcaption></figure>

Find the intervals of increase and decrease of $$f$$, its interior local extrema, and its intervals of concavity. Locate its inflection inputs. Can the height $$f(0)$$ be recovered?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Use the height of this graph for increase and decrease; use its direction of travel for concavity.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The derivative is positive on $$(-3,-2)$$ and $$(0,2)$$, and negative on $$(-2,0)$$ and $$(2,3)$$. Hence $$f$$ has local maxima at $$-2$$ and $$2$$ and a local minimum at $$0$$.

The derivative decreases on $$(-3,-1)$$ and $$(1,3)$$, so $$f$$ is concave down there. It increases on $$(-1,1)$$, so $$f$$ is concave up there. Thus the inflection inputs are $$-1$$ and $$1$$. The second derivative need not exist at these inputs: the first derivative has corners there, but the concavity change is clear.

The height $$f(0)$$ is undetermined. Adding a constant to any compatible function preserves the entire derivative graph.

</details>
</section>

<section class="worked" data-problem-id="applications-cars" markdown="1">
{% include learning/problem-label.html number=4 difficulty=2 %}
<h3>Approaching an intersection, separating from a car</h3>

Two roads cross at right angles. At one instant, a car is $$3\text{ km}$$ east of the intersection and moving east at $$60\text{ km/h}$$. Another is $$4\text{ km}$$ north and moving south at $$40\text{ km/h}$$.

Is their separation increasing or decreasing at that instant, and at what rate? Explain why the direction of the second car alone cannot settle the question.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Use signed rates for the east and north distances, and differentiate the squared separation.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Let $$s^2=x^2+y^2$$, where $$x,y$$ are the positive distances east and north. At this instant $$s=5$$, $$dx/dt=60$$ and $$dy/dt=-40$$. Differentiation gives

$$\begin{aligned}
\frac{ds}{dt}&=\frac{x\,dx/dt+y\,dy/dt}{s}\\
&=\frac{3(60)+4(-40)}5\\
&=4\text{ km/h}.
\end{aligned}$$

Separation increases. One car's approach reduces one component of the distance, but the other car's outward motion more than offsets it in the instantaneous squared-distance calculation.

</details>
</section>

<section class="worked" data-problem-id="applications-viewing-balloon" markdown="1">
{% include learning/problem-label.html number=5 difficulty=2 %}
<h3>Track a rising balloon</h3>

An observer stands $$20\text{ m}$$ from the point directly below a vertically rising balloon. Its height increases at $$3\text{ m/s}$$. Let $$\theta$$ be the observer's angle above the horizontal, measured in radians.

Find $$d\theta/dt$$ when the balloon is $$15\text{ m}$$ high. If its rise continues at the same speed, does its angular rate increase or decrease as it rises?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Use $$\tan(\theta)=h/20$$, or write $$\theta=\arctan(h/20)$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

From $$\theta=\arctan(h/20)$$,

$$\begin{aligned}
\frac{d\theta}{dt}&=\frac{20}{400+h^2}\frac{dh}{dt}\\
&=\frac{60}{400+h^2}.
\end{aligned}$$

At $$h=15$$ this is $$60/625=0.096\text{ rad/s}$$. For positive rising height the denominator increases, so the angular rate decreases even though the vertical speed stays constant.

</details>
</section>

<section class="worked" data-problem-id="applications-bounded-design" markdown="1">
{% include learning/problem-label.html number=6 difficulty=2 %}
<h3>When the best stationary point is forbidden</h3>

A rectangular garden uses $$36\text{ m}$$ of fencing around all four sides. Its width must lie between $$3$$ and $$7\text{ m}$$, inclusive. Find the dimensions giving greatest area.

A solution proposes a $$9\text{ m}$$ square because it solves the derivative equation. Identify exactly what is wrong with that argument.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Write the length as $$18-x$$ and keep the width restriction in the domain.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For width $$x$$, the length is $$18-x$$ and $$A(x)=x(18-x)$$ on $$[3,7]$$. The derivative $$18-2x$$ is positive throughout this interval, so the area is maximized at $$x=7$$. The length is $$11\text{ m}$$ and area $$77\text{ m}^2$$.

The stationary input $$9$$ belongs to the larger unconstrained problem but violates the width requirement. Differentiation does not override feasibility.

</details>
</section>

<section class="worked" data-problem-id="applications-turns-and-bends" markdown="1">
{% include learning/problem-label.html number=7 difficulty=2 %}
<h3>Three kinds of special input</h3>

For $$f(x)=x^4-4x^3$$ on $$[-1,4]$$, find its absolute extrema and inflection points. Classify the input $$0$$ separately as a possible extremum and a possible inflection. Show enough sign information to justify both answers.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Factor both derivatives and keep their purposes separate.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

We have $$f^{\prime}=4x^2(x-3)$$ and $$f^{\prime\prime}=12x(x-2)$$. The critical numbers are $$0$$ and $$3$$. Candidate values are $$f(-1)=5$$, $$f(0)=0$$, $$f(3)=-27$$ and $$f(4)=0$$. The absolute maximum is $$5$$ at $$-1$$; the absolute minimum is $$-27$$ at $$3$$.

The first derivative is negative on either side of zero, so zero is not an extremum. The second derivative has signs $$+,-,+$$ on $$(-1,0),(0,2),(2,4)$$. Thus the inflections are $$(0,0)$$ and $$(2,-16)$$. A horizontal tangent can coincide with an inflection without creating a turn.

</details>
</section>

<section class="worked" data-problem-id="applications-logarithm-bound" markdown="1">
{% include learning/problem-label.html number=8 difficulty=2 %}
<h3>A useful inequality from a rate</h3>

Use the mean value theorem, rather than a tangent estimate, to prove

$$\frac{x}{1+x}\le\ln(1+x)\le x$$

for $$x\ge0$$.

For $$x>0$$, decide whether either inequality can be equality.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

On $$[0,x]$$, bound the derivative of $$\ln(1+t)$$ above and below.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

At $$x=0$$ all three values are zero. Fix $$x>0$$ and set $$F(t)=\ln(1+t)$$. It is continuous on $$[0,x]$$ and differentiable inside. The mean value theorem gives

$$\ln(1+x)=\frac{x}{1+c}$$

for some $$0<c<x$$.

Since $$1/(1+x)<1/(1+c)<1$$, multiplying by positive $$x$$ proves the two strict inequalities. Equality occurs only at $$x=0$$. The argument controls the derivative on the interval, so it proves a bound rather than an approximation.

</details>
</section>

<section class="worked" data-problem-id="applications-two-limits" markdown="1">
{% include learning/problem-label.html number=9 difficulty=2 %}
<h3>A residual and a changing power</h3>

Evaluate the limits

$$\lim_{x\to0}\frac{\ln(1+x)-x+x^2/2}{x^3}$$

and

$$\lim_{x\to+\infty}\left(1+\frac3x\right)^x.$$

Use only tools already established in the course. For every l’Hôpital step, identify the eligible form.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

In the first limit, simplify after differentiating once. In the second, take the logarithm before working with a quotient.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The first quotient has form $$0/0$$. Its derivative ratio simplifies, for nonzero $$x$$ near zero, to

$$\begin{aligned}
&\frac{1/(1+x)-1+x}{3x^2}\\
&\quad=\frac{x^2/(1+x)}{3x^2}\\
&\quad=\frac1{3(1+x)}.
\end{aligned}$$

This tends to $$1/3$$, so one justified application suffices.

For the second, let $$y=(1+3/x)^x>0$$. Then

$$\ln y=\frac{\ln(1+3/x)}{1/x}.$$

This has form $$0/0$$ at infinity. The denominator derivative $$-1/x^2$$ is nonzero; the derivative ratio is $$3/(1+3/x)\to3$$. Thus $$\ln y\to3$$ and $$y\to e^3$$. No series expansion is required.

</details>
</section>

<section class="worked" data-problem-id="applications-rational-sketch" markdown="1">
{% include learning/problem-label.html number=10 difficulty=2 %}
<h3>A slant asymptote and two turns</h3>

Sketch $$f(x)=x^2/(x-1)$$. Determine its domain, intercepts, asymptotes, growth intervals, local extrema and concavity. Does the concavity change across $$1$$ create an inflection? Is either local extremum absolute on the whole domain?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Polynomial division gives $$f(x)=x+1+1/(x-1)$$. That form makes the asymptotes and derivatives easier to read.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The domain excludes $$1$$ and the only intercept is $$(0,0)$$. We can write

$$f(x)-(x+1)=\frac1{x-1}.$$

This difference tends to zero as $$x\to\pm\infty$$, so the slant asymptote is $$y=x+1$$. At $$1$$ the left limit is $$-\infty$$ and right limit is $$+\infty$$, giving a vertical asymptote.

$$\begin{aligned}
f^{\prime}(x)&=1-\frac1{(x-1)^2}\\
&=\frac{x(x-2)}{(x-1)^2},\\
f^{\prime\prime}(x)&=\frac2{(x-1)^3}.
\end{aligned}$$

The function increases on $$(-\infty,0)$$ and $$(2,\infty)$$, and decreases on $$(0,1)$$ and $$(1,2)$$. Thus $$(0,0)$$ is a local maximum and $$(2,4)$$ a local minimum. Neither is absolute on the whole domain, where the values are unbounded above and below.

The left branch is concave down and the right branch concave up. No inflection exists at $$1$$ because no graph point exists there. Draw the left branch below its slant asymptote and the right branch above it, as the sign of $$1/(x-1)$$ requires.

</details>
</section>

<section class="worked" data-problem-id="applications-weighted-cylinder" markdown="1">
{% include learning/problem-label.html number=11 difficulty=2 %}
<h3>Material costs change the proportions</h3>

An open-top cylindrical container holds $$18\pi\text{ cm}^3$$. Material for its base costs three times as much per square centimetre as material for its curved side. Find the radius and height giving least material cost. Compare height with radius, and justify global optimality.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Measure cost in units of the side material’s cost per square centimetre. Include the factor three in the base contribution.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The volume constraint gives $$h=18/r^2$$. In the chosen cost units,

$$\begin{aligned}
C(r)&=3\pi r^2+2\pi rh\\
&=3\pi r^2+\frac{36\pi}{r},
\end{aligned}$$

with $$r>0$$.

Its derivative is $$C^{\prime}(r)=6\pi(r^3-6)/r^2$$, negative before $$r=\sqrt[3]6$$ and positive afterward. The cost therefore has a global minimum at that radius. The height is

$$h=\frac{18}{6^{2/3}}=3\sqrt[3]6\text{ cm}.$$

The container is three times as tall as its radius. The more expensive base favours a smaller radius and greater height. The cost also tends to infinity at either end of the feasible domain, consistent with the full-domain sign result.

</details>
</section>

<section class="worked" data-problem-id="applications-viewing-angle" markdown="1">
{% include learning/problem-label.html number=12 difficulty=3 %}
<h3>Where does a picture look largest?</h3>

A vertical picture has its bottom edge $$1\text{ m}$$ above an observer's eye level and its top edge $$3\text{ m}$$ above it. The observer stands a horizontal distance $$x>0$$ from the wall. Maximize the angle subtended by the picture at the observer's eye.

Find both the best distance and the maximum angle. Explain why standing as close as possible is not optimal.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

The viewing angle is the difference of the angles to the top and bottom, not the angle to the top alone.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The viewing angle is

$$\begin{aligned}
\theta(x)&=\arctan(3/x)\\
&\quad-\arctan(1/x),
\end{aligned}$$

with $$x>0$$.

Differentiating gives

$$\begin{aligned}
\theta^{\prime}(x)&=-\frac3{x^2+9}\\
&\quad+\frac1{x^2+1}\\
&=\frac{6-2x^2}{(x^2+9)(x^2+1)}.
\end{aligned}$$

The derivative changes from positive to negative at $$x=\sqrt3$$, so this is the global maximum. Its value is

$$\theta(\sqrt3)=\frac\pi3-\frac\pi6=\frac\pi6.$$

The best distance is $$\sqrt3\text{ m}$$ and the angle is $$30^\circ$$. As $$x\to0^+$$ both lines of sight approach vertical, so their difference tends to zero; as $$x\to\infty$$ both angles tend to zero. Neither extreme gives a large apparent height.

</details>
</section>

<section class="worked" data-problem-id="applications-saturated-rate" markdown="1">
{% include learning/problem-label.html number=13 difficulty=3 %}
<h3>When an average forces an entire motion</h3>

A differentiable position function $$s$$ is defined on an open interval containing $$[0,3]$$. Suppose $$s(0)=2$$, $$s(3)=11$$ and $$s^{\prime}(t)\le3$$ for every $$0<t<3$$.

Show that $$s(t)=2+3t$$ throughout $$[0,3]$$. The mean value theorem immediately gives one input with derivative three; explain why your conclusion is stronger.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

For each interior $$t$$, apply the theorem separately on $$[0,t]$$ and $$[t,3]$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

On $$[0,t]$$ the theorem gives $$s(t)-2\le3t$$. On $$[t,3]$$ it gives $$11-s(t)\le3(3-t)$$, or $$s(t)\ge2+3t$$. The inequalities force equality for every interior $$t$$; the endpoints already have those values.

Thus $$s^{\prime}(t)=3$$ at every interior instant, not just one. If the rate never exceeds its average, it cannot compensate for any shortfall elsewhere. The two interval comparisons make that intuition precise without integration.

</details>
</section>

<section class="worked" data-problem-id="applications-three-zeros" markdown="1">
{% include learning/problem-label.html number=14 difficulty=3 %}
<h3>Three zeros force a flatter point</h3>

Let $$f$$ be twice differentiable on an open interval containing $$[a,b]$$, and suppose $$f(a)=f(d)=f(b)=0$$ with $$a<d<b$$. Prove that $$f^{\prime\prime}(c)=0$$ for some $$a<c<b$$.

Show by an example that only two distinct zeros of $$f$$ would not suffice.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

First find two separate zeros of $$f^{\prime}$$. Check continuity of that new function before applying Rolle’s theorem to it.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Rolle's theorem on $$[a,d]$$ gives $$u\in(a,d)$$ with $$f^{\prime}(u)=0$$. On $$[d,b]$$ it gives $$v\in(d,b)$$ with $$f^{\prime}(v)=0$$.

Because $$f$$ is twice differentiable, $$f^{\prime}$$ is differentiable, hence continuous, on an interval containing $$[u,v]$$. Rolle's theorem applied to $$f^{\prime}$$ yields $$c\in(u,v)$$ with $$f^{\prime\prime}(c)=0$$.

With only two zeros, take $$f(x)=(x-a)(x-b)$$. It vanishes at the endpoints, yet $$f^{\prime\prime}(x)=2$$ everywhere. The third zero is what creates two distinct first-derivative zeros.

</details>
</section>

<section class="worked" data-problem-id="applications-failed-derivative-ratio" markdown="1">
{% include learning/problem-label.html number=15 difficulty=3 %}
<h3>A failed test with a successful limit</h3>

For $$x\ne0$$, set $$f(x)=x^2\sin(1/x)$$ and $$g(x)=x$$. Find $$\lim_{x\to0}f(x)/g(x)$$, then show that the derivative ratio has no limit.

Which implication about l’Hôpital’s rule does this example disprove?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Squeeze the original quotient. For the derivative ratio, choose inputs whose reciprocals are even or odd multiples of $$\pi$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The quotient is $$x\sin(1/x)$$ and has absolute value at most $$\lvert x\rvert$$. Its limit is zero by the squeeze theorem.

The derivative ratio is

$$\begin{aligned}
\frac{f^{\prime}(x)}{g^{\prime}(x)}
&=2x\sin(1/x)\\
&\quad-\cos(1/x).
\end{aligned}$$

At $$x_n=1/(2\pi n)$$ this equals $$-1$$; at $$z_n=1/((2n+1)\pi)$$ it equals $$1$$. Both lists of inputs approach zero, so no common derivative-ratio limit exists.

This disproves “if the derivative ratio has no limit, then the original quotient has no limit.” The rule gives a sufficient method, not a necessary test for convergence. It also illustrates why differentiating blindly can make a simple limit harder.

</details>
</section>
