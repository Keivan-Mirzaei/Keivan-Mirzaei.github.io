---
layout: learning-topic
problem_set: true
title: "Problems"
permalink: /learning/calculus/elementary-function-derivatives/problems/
course_key: calculus
module_key: elementary-function-derivatives
position: "3.6"
description: Build from short discoveries to deeper questions about elementary derivatives, inverse functions, and tangents.
math: true
sitemap: false
---

<section class="worked" data-problem-id="unfolding-an-inverse-trig-composition" markdown="1">
{% include learning/problem-label.html number=1 difficulty=1 %}

On $$0\le x\le2\pi$$, let $$A(x)=\arccos(\cos x)$$.

A student cancels the two functions and concludes $$A(x)=x$$ and $$A^{\prime}(x)=1$$ throughout the interval. Find exactly where that conclusion fails. Give a piecewise formula for $$A$$ and use its graph to explain how composing two familiar continuous functions can create a corner.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Arccosine always returns an angle in $$[0,\pi]$$. For the second half of the interval, use $$\cos(2\pi-x)=\cos x$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The principal branch forces

$$A(x)=\begin{cases}x,&0\le x\le\pi,\\2\pi-x,&\pi\le x\le2\pi.\end{cases}$$

Its graph consists of the segments from $$(0,0)$$ to $$(\pi,\pi)$$ and then to $$(2\pi,0)$$.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/elementary-problems-fold.svg' | relative_url }}" alt="A triangular graph rises with slope one from zero, zero to pi, pi, then falls with slope minus one to two pi, zero." width="640"><figcaption>The principal branch folds the second half of the cosine cycle back into its allowed angle interval.</figcaption></figure>

Thus

$$A^{\prime}(x)=\begin{cases}1,&0<x<\pi,\\-1,&\pi<x<2\pi.\end{cases}$$

At $$\pi$$ the one-sided slopes differ, so no derivative exists. Directly substituting into the chain-rule expression $$\sin x/\sqrt{1-\cos^2x}$$ there gives an undefined quotient, not a justification for assigning a slope.

</details>
</section>

<section class="worked" data-problem-id="one-function-three-descriptions" markdown="1">
{% include learning/problem-label.html number=2 difficulty=1 %}

Can a function grow without bound while its slope always stays between $$-1$$ and $$1$$? Decide using

$$L(x)=\ln(e^x+e^{-x}).$$

Find its derivative, give a bound for it, and examine what happens to $$L(x)$$ as $$x\to+\infty$$.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Compare the sum and difference of the two positive numbers $$e^x$$ and $$e^{-x}$$. For the limit, factor $$e^x$$ inside the logarithm.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The logarithm rule gives

$$L^{\prime}(x)=\frac{e^x-e^{-x}}{e^x+e^{-x}}=\tanh x.$$

For positive $$u,v$$, $$\lvert u-v\rvert<u+v$$. Therefore

$$-1<L^{\prime}(x)<1.$$

But

$$L(x)=\ln\bigl(e^x(1+e^{-2x})\bigr)=x+\ln(1+e^{-2x})\longrightarrow+\infty.$$

So the answer is yes. A bound on how fast a function changes is not a bound on how large it can become.

</details>
</section>

<section class="worked" data-problem-id="decay-with-a-background-reading" markdown="1">
{% include learning/problem-label.html number=3 difficulty=2 %}

A sensor reading, in concentration units, is modelled by

$$C(t)=5+40e^{-kt},\qquad k>0,$$

with time in hours. A measurement gives $$C(2)=25$$.

The reading falls from $$45$$ to $$25$$ in two hours. A student says, “The amount has not halved, so this cannot be exponential decay.” What has the student overlooked?

Find $$k$$ and the rate at which the reading is falling after two hours. State exactly which quantity halves every two hours.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

First isolate the exponential in the measurement equation. The constant background contributes to the reading but not to its derivative.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The measurement gives $$20=40e^{-2k}$$, hence

$$k=\frac{\ln2}{2}\,\mathrm{h}^{-1}.$$

Differentiation yields $$C^{\prime}(t)=-40ke^{-kt}$$, and therefore

$$C^{\prime}(2)=-20k=-10\ln2$$

concentration units per hour. The constant $$5$$ is a background reading. The quantity above background is

$$E(t)=C(t)-5=40e^{-kt}.$$

Since $$e^{-2k}=1/2$$,

$$E(t+2)=E(t)e^{-2k}=\frac12E(t).$$

It is the amount *above background* that halves every two hours, not the full reading. A fixed background can hide the halving pattern in the measured numbers.

</details>
</section>

<section class="worked" data-problem-id="a-changing-power-at-two-inputs" markdown="1">
{% include learning/problem-label.html number=4 difficulty=2 %}

For $$P(x)=(2+\sin x)^{\cos x}$$, a student says: “Whenever the exponent is zero, the function is $$1$$, so its derivative must be zero too.” Decide whether this reasoning is valid at $$x=\pi/2$$. Compare with $$x=0$$ by finding both tangent lines. At each input, identify which changing part—the base or the exponent—contributes to the slope.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

The base is always positive. Differentiate $$\ln P=\cos(x)\ln(2+\sin x)$$ using the product rule.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Logarithmic differentiation gives

$$\frac{P^{\prime}(x)}{P(x)}=-\sin(x)\ln(2+\sin x)+\frac{\cos^2x}{2+\sin x}.$$

At zero, $$P(0)=2$$ and $$P^{\prime}(0)=2(1/2)=1$$. The tangent is

$$y=2+x.$$

At $$\pi/2$$, $$P(\pi/2)=1$$ and $$P^{\prime}(\pi/2)=-\ln3$$. Thus

$$y=1-\ln3\left(x-\frac\pi2\right).$$

At zero, the exponent has zero derivative, and only the changing base contributes. At $$\pi/2$$, the base has zero derivative, and only the changing exponent contributes.

Holding the exponent fixed at zero would turn the expression into the constant $$1$$ and incorrectly predict zero slope. Here the entire nonzero rate comes from the changing exponent.

</details>
</section>

<section class="worked" data-problem-id="a-light-spot-on-a-wall" markdown="1">
{% include learning/problem-label.html number=5 difficulty=2 %}

A lamp is $$4\,\mathrm m$$ from a straight wall. Its beam makes angle $$\theta$$ with the perpendicular to the wall. The light spot is at position $$s=4\tan\theta$$ along the wall.

<figure class="topic-figure lamp-sketch">
<div class="limits-plot">
<img src="{{ '/assets/figures/learning/elementary-problems-lamp.svg' | relative_url }}" alt="The beam, the four-metre perpendicular distance to the wall, and the spot position form a right triangle. The angle at the lamp is theta, and the distance up the wall is s." width="640">
<span class="diagram-label" style="left: 26.5%; top: 73%;">\(\theta\)</span>
<span class="diagram-label" style="left: 44%; top: 87%;">\(4\,\mathrm m\)</span>
<span class="diagram-label" style="left: 80%; top: 51%;">\(s\)</span>
</div>
</figure>

The beam turns at a constant rate of $$0.2\,\mathrm{rad/s}$$, starting at $$\theta=0$$. Will the spot cover equal distances in equal times? Find when its speed first doubles, and find a turning rate $$d\theta/dt$$ that would instead make the spot move at the constant speed $$1\,\mathrm{m/s}$$.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

The chain rule connects $$ds/dt$$ and $$d\theta/dt$$. For the final part, work backwards from the desired value of $$ds/dt$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The chain rule gives

$$\frac{ds}{dt}=4\sec^2\theta\frac{d\theta}{dt}.$$

For the constant turning rate, this is

$$\frac{ds}{dt}=\frac45\sec^2\theta.$$

The spot does not move at constant speed. Its initial speed is $$4/5\,\mathrm{m/s}$$, and this first doubles when $$\sec^2\theta=2$$, at $$\theta=\pi/4$$. Since $$\theta=t/5$$, the time is $$5\pi/4$$ seconds.

To get $$ds/dt=1\,\mathrm{m/s}$$ instead, we must choose

$$\frac{d\theta}{dt}=\frac14\cos^2\theta\quad\mathrm{rad/s}.$$

The beam must turn more slowly as it points farther along the wall. Working backwards through the chain rule tells us how to produce a desired motion.

</details>
</section>

<section class="worked" data-problem-id="a-camera-viewing-an-object" markdown="1">
{% include learning/problem-label.html number=6 difficulty=2 %}

A camera is $$3\,\mathrm m$$ from a straight track. An object occupies the segment from coordinate $$s$$ to $$s+2$$ along the track, measured in metres from the point nearest the camera. Its angular width is

$$\alpha(s)=\arctan\!\left(\frac{s+2}{3}\right)-\arctan\!\left(\frac{s}{3}\right).$$

Two positions symmetric about $$s=-1$$ have the same angular width. Must they have the same rate of change of angular width? Show why the widths agree, then compare their derivatives. Where is the derivative zero?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Simplify each derivative to a fraction with numerator $$3$$. Compare the two positive denominators.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Arctangent is odd, so

$$\alpha(-2-s)=\arctan(-s/3)-\arctan(-(s+2)/3)=\alpha(s).$$

The inverse tangent rule and chain rule give

$$\alpha^{\prime}(s)=\frac3{9+(s+2)^2}-\frac3{9+s^2}
=\frac{-12(s+1)}{(9+(s+2)^2)(9+s^2)}.$$

The denominator is positive. The rate is positive for $$s<-1$$, zero at $$s=-1$$, and negative for $$s>-1$$, in radians per metre.

At $$s=-1$$ the object occupies $$[-1,1]$$ and is centred opposite the camera. The angular width has a horizontal tangent as a function of position there. Differentiating the symmetry identity also gives

$$-\alpha^{\prime}(-2-s)=\alpha^{\prime}(s).$$

The symmetric positions have equal widths but opposite rates. Equal function values do not imply equal derivatives.

</details>
</section>

<section class="worked" data-problem-id="logarithms-of-trigonometric-combinations" markdown="1">
{% include learning/problem-label.html number=7 difficulty=2 %}

Two students differentiate

$$F(x)=\ln\!\left(\frac{1-\cos x}{\sin x}\right),\qquad 0<x<\pi.$$

One first writes the fraction as $$\csc x-\cot x$$. The other first separates the logarithm into a difference of logarithms. Use both routes and show that the apparently different answers agree.

What must you check before separating the logarithm?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

On the given interval, both numerator and denominator are positive. In the second route, use $$\sin^2x+\cos^2x=1$$ to combine the result.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Since $$1-\cos x>0$$ and $$\sin x>0$$ on $$0<x<\pi$$, both routes are valid.

The first route gives

$$F^{\prime}(x)=\frac{-\csc x\cot x+\csc^2x}{\csc x-\cot x}=\csc x.$$

The second route starts from

$$F(x)=\ln(1-\cos x)-\ln(\sin x),$$

and gives

$$\begin{aligned}
F^{\prime}(x)&=\frac{\sin x}{1-\cos x}-\frac{\cos x}{\sin x}\\
&=\frac{\sin^2x-\cos x(1-\cos x)}{\sin x(1-\cos x)}\\
&=\frac{1-\cos x}{\sin x(1-\cos x)}=\csc x.
\end{aligned}$$

The answers agree. The useful choice is often how to rewrite the function *before* differentiating; different-looking derivative formulas need not disagree. Positivity justifies taking each separate logarithm.

</details>
</section>

<section class="worked" data-problem-id="an-exponential-constraint" markdown="1">
{% include learning/problem-label.html number=8 difficulty=3 %}

A differentiable branch of the curve

$$e^{xy}+x+y=e+2$$

passes through $$(1,1)$$. Find its tangent line and its second derivative there. Why does the exponential term have zero first derivative at this point even though neither coordinate is zero?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Keep $$y+xy^{\prime}$$ as a single factor after the first differentiation. It represents the rate of change of the exponent.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The point satisfies the equation. Differentiating gives

$$e^{xy}(y+xy^{\prime})+1+y^{\prime}=0.$$

At $$(1,1)$$ this becomes $$(e+1)(1+y^{\prime})=0$$, so $$y^{\prime}=-1$$ and the tangent is

$$y-1=-(x-1).$$

The exponent's derivative is $$y+xy^{\prime}=0$$ there: the two contributions cancel. Differentiate again before substituting:

$$e^{xy}\left[(y+xy^{\prime})^2+2y^{\prime}+xy^{\prime\prime}\right]+y^{\prime\prime}=0.$$

At the point,

$$e(-2+y^{\prime\prime})+y^{\prime\prime}=0,\qquad y^{\prime\prime}=\frac{2e}{e+1}.$$

A term can have zero first derivative at a point while having a nonzero second derivative.

</details>
</section>

<section class="worked" data-problem-id="inverse-sensitivity-to-second-order" markdown="1">
{% include learning/problem-label.html number=9 difficulty=3 %}

A strictly increasing, twice differentiable function satisfies

$$f(2)=5,\qquad f^{\prime}(2)=3,\qquad f^{\prime\prime}(2)=-6.$$

Let $$g=f^{-1}$$ near $$5$$. A student takes reciprocals twice and predicts $$g^{\prime\prime}(5)=1/f^{\prime\prime}(2)$$. Find the error by deriving a formula for the second derivative of an inverse. Calculate the two derivatives of $$g$$ at $$5$$, and decide whether the original slope and inverse slope are changing in the same direction at the corresponding inputs.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Start with $$f(g(y))=y$$ and differentiate twice. Keep the factor from the inner derivative on both differentiations.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The identity gives

$$f^{\prime}(g(y))g^{\prime}(y)=1,$$

so $$g^{\prime}(5)=1/3$$. Differentiating once more,

$$f^{\prime\prime}(g(y))(g^{\prime}(y))^2+f^{\prime}(g(y))g^{\prime\prime}(y)=0.$$

Consequently,

$$g^{\prime\prime}(5)=-\frac{f^{\prime\prime}(2)}{(f^{\prime}(2))^3}=\frac{6}{27}=\frac29.$$

In general, the calculation shows

$$g^{\prime\prime}(y)=-\frac{f^{\prime\prime}(g(y))}{(f^{\prime}(g(y)))^3}.$$

The second derivative is not the reciprocal of the original second derivative. Differentiating the first reciprocal rule requires both a minus sign and the inner derivative.

Here the original slope is decreasing at $$2$$ because $$f^{\prime\prime}(2)<0$$, while the inverse slope is increasing at $$5$$ because $$g^{\prime\prime}(5)>0$$. Reflection swaps the roles of the variables, rather than preserving how the slope changes.

</details>
</section>

<section class="worked" data-problem-id="reverse-hyperbolic-sine" markdown="1">
{% include learning/problem-label.html number=10 difficulty=3 %}

For a real input $$u$$, define

$$H(u)=\ln\!\left(u+\sqrt{1+u^2}\right).$$

1. Explain why its logarithm is defined for every real $$u$$.
2. Show directly from the exponential definitions that $$\sinh(H(u))=u$$.
3. Find $$H^{\prime}(u)$$ both directly and by the inverse derivative rule.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

The two factors $$\sqrt{1+u^2}+u$$ and $$\sqrt{1+u^2}-u$$ have product $$1$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Since $$\sqrt{1+u^2}>\lvert u\rvert$$, the logarithm's argument is positive. Put $$v=H(u)$$. Then

$$e^v=u+\sqrt{1+u^2},\qquad e^{-v}=\sqrt{1+u^2}-u.$$

Thus

$$\sinh v=\frac{e^v-e^{-v}}2=u,\qquad \cosh v=\sqrt{1+u^2}.$$

Direct differentiation gives

$$H^{\prime}(u)=\frac{1+u/\sqrt{1+u^2}}{u+\sqrt{1+u^2}}=\frac1{\sqrt{1+u^2}}.$$

Alternatively, differentiate $$\sinh(H(u))=u$$ to obtain $$\cosh(H(u))H^{\prime}(u)=1$$ and the same answer. Since $$\sinh$$ is continuous, strictly increasing, and has range $$\mathbb R$$, $$H$$ is its inverse. This problem derives that inverse rather than assuming a new derivative formula.

</details>
</section>

<section class="worked" data-problem-id="a-model-with-competing-factors" markdown="1">
{% include learning/problem-label.html number=11 difficulty=3 %}

Let

$$R(x)=\frac{x^2e^{-x}}{1+x},\qquad x>0.$$

Find the positive input $$a$$ where $$R^{\prime}(a)=0$$. Then determine whether $$R^{\prime\prime}(a)$$ is zero, positive, or negative, without expanding a large quotient derivative. Does the horizontal tangent mean that $$R$$ is constant near $$a$$?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Use logarithmic differentiation. If $$q=R^{\prime}/R$$, differentiate $$R^{\prime}=Rq$$. At the required input, $$q=0$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

All factors are positive on the domain. Taking logarithms gives

$$\ln R=2\ln x-x-\ln(1+x),$$

so

$$q(x)=\frac{R^{\prime}(x)}{R(x)}=\frac2x-1-\frac1{1+x}=\frac{2-x^2}{x(1+x)}.$$

Because $$R(x)>0$$, its derivative is zero exactly when $$q(x)=0$$. Thus $$a=\sqrt2$$.

Differentiate $$R^{\prime}=Rq$$:

$$R^{\prime\prime}=R^{\prime}q+Rq^{\prime}=R(q^2+q^{\prime}).$$

At $$a$$, $$q(a)=0$$, so

$$\frac{R^{\prime\prime}(a)}{R(a)}=q^{\prime}(a)
=-1+\frac1{(1+\sqrt2)^2}=2-2\sqrt2<0.$$

Since $$R(a)>0$$, $$R^{\prime\prime}(a)<0$$. The function is not constant near $$a$$: if it were, its second derivative there would also be zero. Taking logarithms can simplify a second-derivative question as well as a first-derivative calculation.

</details>
</section>

<section class="worked" data-problem-id="challenge-a-loop-with-special-tangents" markdown="1">
{% include learning/problem-label.html number=12 difficulty=3 %}

Consider the part of the implicit curve

$$x^3+y^3=6xy$$

with $$x>0$$ and $$y>0$$.

1. Find every horizontal and vertical tangent on this part of the curve, with exact coordinates and tangent equations.
2. Find the tangent and $$y^{\prime\prime}$$ at $$(3,3)$$.
<details class="disclosure" markdown="1">
<summary>Hint</summary>

Differentiate implicitly, and solve the curve equation together with the numerator-zero condition or denominator-zero condition. A vertical tangent can be checked by finding $$dx/dy$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Differentiation gives

$$(x^2-2y)+(y^2-2x)y^{\prime}=0,\qquad y^{\prime}=\frac{2y-x^2}{y^2-2x}.$$

For a horizontal tangent, $$y=x^2/2$$. Substituting into the curve yields

$$x^3+\frac{x^6}{8}=3x^3,\qquad x^3=16$$

because $$x>0$$. Put $$r=\sqrt[3]{2}$$. The point is $$(2r,2r^2)$$, where $$y^2-2x=4r\ne0$$. Its tangent is $$y=2r^2$$.

By symmetry, the vertical tangent is at $$(2r^2,2r)$$, with line $$x=2r^2$$. There $$dx/dy=(2x-y^2)/(x^2-2y)=0$$, with nonzero denominator, confirming the vertical direction. These equations have no other positive solutions.

At $$(3,3)$$ the slope is $$-1$$, so the tangent is $$x+y=6$$. Differentiate the unsolved first-derivative equation:

$$2x-2y^{\prime}+(2yy^{\prime}-2)y^{\prime}+(y^2-2x)y^{\prime\prime}=0.$$

Substitution gives $$8+8+3y^{\prime\prime}=0$$, hence

$$y^{\prime\prime}(3)=-\frac{16}{3}.$$

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/elementary-problems-loop.svg' | relative_url }}" alt="A positive loop leaves the origin along the horizontal direction, reaches a rightmost point, passes through three, three with tangent x plus y equals six, reaches its highest point, and returns to the origin along the vertical direction." width="640"><figcaption>The uppermost point has a horizontal tangent; the rightmost point has a vertical tangent. The origin is excluded from the problem's positive quadrant.</figcaption></figure>

At the origin, both numerator and denominator of the slope formula vanish. This calculation alone says nothing about a tangent there; the positive-coordinate restriction keeps that separate question out of this problem.

</details>
</section>

<section class="worked" data-problem-id="challenge-vanishing-waves" markdown="1">
{% include learning/problem-label.html number=13 difficulty=4 %}

For positive constants $$p,q$$, define

$$f(x)=\begin{cases}\lvert x\rvert^p\sin(\lvert x\rvert^{-q}),&x\ne0,\\0,&x=0.\end{cases}$$

Find exactly which pairs $$p,q$$ make each statement true:

1. $$f$$ is differentiable at zero.
2. $$f$$ is differentiable at zero and $$f^{\prime}$$ is continuous there.
3. $$f^{\prime}(0)=0$$, but the slopes at nearby points are unbounded.

Prove both directions of each claim. Give one concrete function for each of the three possible behaviours: a continuous derivative, a bounded but discontinuous derivative, and an unbounded derivative near zero. No sketch is required.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Separate the small size of the wave from its rapid oscillation. First study the difference quotient at zero. For nearby slopes, differentiate on $$x>0$$ and choose inputs where the sine is zero or where it is one. A bound proves sufficiency; carefully chosen inputs prove necessity.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The function is continuous at zero for every $$p>0$$, because $$\lvert f(x)\rvert\le\lvert x\rvert^p$$. For the derivative, the difference quotient satisfies

$$\left\lvert\frac{f(h)}h\right\rvert\le\lvert h\rvert^{p-1}.$$

Thus $$p>1$$ gives $$f^{\prime}(0)=0$$. This condition is necessary. Along positive inputs

$$h_n=(\pi/2+2n\pi)^{-1/q},$$

the quotient is $$h_n^{p-1}$$. For $$p<1$$ it grows without bound; for $$p=1$$ it equals $$1$$, while at $$h_n=(2n\pi)^{-1/q}$$ it is zero. Therefore

$$f\text{ is differentiable at }0\quad\Longleftrightarrow\quad p>1.$$

For $$x>0$$,

$$f^{\prime}(x)=px^{p-1}\sin(x^{-q})-qx^{p-q-1}\cos(x^{-q}).$$

For $$x<0$$, evenness of $$f$$ makes its derivative the negative of the derivative at $$-x$$. It is enough to bound the positive side.

If $$p>q+1$$, both terms tend to zero, so the derivative is continuous at zero. Conversely, at $$x_n=(2n\pi)^{-1/q}$$,

$$f^{\prime}(x_n)=-qx_n^{p-q-1}.$$

When $$p=q+1$$ this equals $$-q$$, and when $$p<q+1$$ its magnitude grows without bound. For a differentiable function in this family,

$$f^{\prime}\text{ is continuous at }0\quad\Longleftrightarrow\quad p>q+1.$$

When $$p=q+1$$, the displayed derivative formula is bounded near zero, yet is not continuous there. When $$1<p<q+1$$, the same special inputs show unbounded slopes. Hence the answer to the third question is exactly

$$1<p<q+1.$$

Examples, each with derivative zero at the origin, are

- $$\lvert x\rvert^3\sin(1/\lvert x\rvert)$$: continuous derivative;
- $$x^2\sin(1/\lvert x\rvert)$$: bounded but discontinuous derivative;
- $$x^2\sin(1/x^2)$$: derivative unbounded near zero.

Each is assigned value zero at zero. A wave can shrink enough to have a tangent at the origin while oscillating too quickly for nearby tangents to settle down.

</details>
</section>

<section class="worked" data-problem-id="challenge-common-exponential-logarithm-tangents" markdown="1">
{% include learning/problem-label.html number=14 difficulty=4 %}

How many straight lines are tangent to *both* $$y=e^x$$ and $$y=\ln x$$?

Find all such lines, giving their points of tangency, and prove that none are missing. An exact answer may define a constant as the unique positive solution of an equation; a decimal search alone is not a proof.

The two tangency points need not have the same input or be reflections of one another.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Call the common slope $$m$$. Express each point of tangency and each tangent's intercept in terms of $$m$$. Equating the intercepts leaves one equation. To count its solutions, try $$t=\ln m$$ and use the exponential definition of hyperbolic tangent.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Both derivatives are positive, so a common tangent must have slope $$m>0$$.

For the exponential, $$e^a=m$$ gives the point $$(\ln m,m)$$ and tangent

$$y=mx+m-m\ln m.$$

For the logarithm, $$1/b=m$$ gives the point $$(1/m,-\ln m)$$ and tangent

$$y=mx-1-\ln m.$$

These are the same line exactly when

$$(m-1)\ln m=m+1.$$

The value $$m=1$$ does not satisfy the equation. Put $$t=\ln m$$. Rearranging gives

$$t\frac{e^t-1}{e^t+1}=1,\qquad\text{or}\qquad t\tanh(t/2)=1.$$

The expression on the left is even. On $$t>0$$, both factors are positive and strictly increasing: the second is

$$\tanh(t/2)=1-\frac2{e^t+1},$$

which increases because $$e^t$$ increases. Their product is therefore strictly increasing, without needing a derivative test. It tends to zero as $$t\to0^+$$ and grows without bound as $$t\to+\infty$$. Continuity and the intermediate value theorem give exactly one positive solution, say $$t_0$$. Evenness gives exactly one negative solution, $$-t_0$$.

There are therefore exactly **two** common tangents. For each $$t\in\{t_0,-t_0\}$$, the line and its two points are

$$y=e^t x-1-t,\qquad (t,e^t),\qquad(e^{-t},-t).$$

Every common tangent was forced to have this form, and each solution produces a line tangent to both graphs. This proves completeness. The two slopes are reciprocals, as reflection across $$y=x$$ suggests, but the two contact points on a single line are not a reflected pair.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/elementary-problems-common-tangents.svg' | relative_url }}" alt="The exponential and logarithm have two common tangent lines, one steep and one shallow, reflected across y equals x." width="640"><figcaption>Each amber line touches both curves. The picture illustrates the two lines; the argument above establishes that there are exactly two.</figcaption></figure>

</details>
</section>
