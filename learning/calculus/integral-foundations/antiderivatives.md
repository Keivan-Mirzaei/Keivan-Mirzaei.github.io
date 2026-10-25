---
layout: learning-topic
title: "Antiderivatives and indefinite integrals"
permalink: /learning/calculus/integral-foundations/antiderivatives/
course_key: calculus
module_key: integral-foundations
position: "5.1"
description: "Recover a function from its derivative, understand the missing constant, and use a known value to determine it."
epigraph:
  text: "…the process of differentiation may be reversed…"
  author: "Silvanus P. Thompson"
  source: "Calculus Made Easy, second edition (1914), Chapter XVIII, p. 189. Excerpt."
  source_url: "https://www.gutenberg.org/files/33283/33283-h/33283-h.htm"
math: true
sitemap: false
topic_script: /assets/js/learning-antiderivatives.js
exercises:
  - text: 'Two differentiable functions have the same derivative on \((0,5)\), and their values agree at \(x=2\). What follows?'
    options: ['They agree everywhere on \((0,5)\)', 'They may differ away from \(x=2\)', 'Both functions must be constant']
    correct: 0
    why: 'Their difference is constant on this interval. Its value at \(2\) is zero, so that constant is zero.'
  - text: 'Which family has derivative \(x^{-3}\) on \((0,\infty)\)?'
    options: ['\(-3x^{-4}+C\)', '\(\ln(x)+C\)', '\(-\frac{1}{2x^2}+C\)']
    correct: 2
    why: 'Raise the exponent from \(-3\) to \(-2\), then divide by \(-2\). Differentiating \(-\tfrac12 x^{-2}\) returns \(x^{-3}\).'
  - text: 'Someone proposes \(H(x)=\sin(x^2)\) as an antiderivative of \(\cos(x^2)\). What is the problem?'
    options: ['Only the constant is missing', 'Its derivative is \(2x\cos(x^2)\)', 'The derivative of sine is negative cosine']
    correct: 1
    why: 'The chain rule contributes \(2x\). Adding a constant cannot remove an unwanted factor in the derivative.'
  - text: 'On the interval \((-\infty,0)\), which expression is an antiderivative of \(1/x\)?'
    options: ['\(\ln(x)\)', '\(-\ln(-x)\)', '\(\ln(-x)\)']
    correct: 2
    why: 'Here \(-x>0\), and \(\frac{d}{dx}\ln(-x)=\frac{1}{-x}(-1)=1/x\). The real logarithm \(\ln(x)\) is undefined on this interval.'
  - text: 'Suppose \(F^{\prime}(x)=3x^2\) for all real \(x\), and \(F(1)=2\). What is \(F(0)\)?'
    options: ['\(0\)', '\(1\)', '\(2\)']
    correct: 1
    why: 'The family is \(F(x)=x^3+C\). The given value gives \(1+C=2\), so \(C=1\) and \(F(0)=1\).'
  - text: 'A vehicle’s acceleration is known throughout a time interval. Which data determine its position uniquely on that interval?'
    options: ['Its position at one time', 'Its velocity at one time', 'Its velocity and position at one time']
    correct: 2
    why: 'One constant appears when recovering velocity, and another when recovering position. A velocity value and a position value determine them.'
  - text: 'Suppose \(F^{\prime}(x)=x^2+1\) on an interval. Can changing the integration constant give \(F\) a local maximum at an interior point?'
    options: ['Yes, if the constant is large enough', 'No, because the derivative remains positive', 'Yes, if the constant is negative']
    correct: 1
    why: 'The constant changes height, not slope. Since \(x^2+1>0\), every member of the family is strictly increasing.'
  - text: 'A differentiable function satisfies \(H^{\prime}(x)=0\) for every \(x\ne0\). Must it have one constant value on all of \(\mathbb R\setminus\{0\}\)?'
    options: ['Yes, by the mean value theorem', 'No: the constants on the two intervals can differ']
    correct: 1
    why: 'For example, \(H(x)=0\) for \(x<0\) and \(H(x)=1\) for \(x>0\) has derivative zero everywhere in its domain. The mean value theorem cannot bridge the missing point.'
---

<!-- Prerequisites: Power, sum, chain, exponential, logarithmic and trigonometric derivative rules; the mean value theorem and derivative sign tests; velocity and acceleration. Established here: Antiderivative on an interval; the complete family F+C; indefinite integral notation; reverse power and linearity rules; initial-value selection and successive antidifferentiation. No definite integral or fundamental theorem is assumed. -->

## What does a derivative leave out?

Suppose a moving object's velocity is known at every time. Can we recover its position? The derivative tells us how position changes, but it does not tell us where the object started. Two objects can have the same velocity throughout a journey while remaining a fixed distance apart.

The same issue appears without a physical setting. Each of

$$
x^2,\qquad x^2+3,\qquad x^2-5
$$

has derivative $$2x$$. Reversing differentiation should recover all of these possibilities. The missing information is an additive constant.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Antiderivative</h3>

A function $$F$$ is an **antiderivative** of $$f$$ on an open interval $$I$$ if $$F$$ is differentiable there and, for every $$x\in I$$,

$$
F^{\prime}(x)=f(x).
$$

Finding such a function is called **antidifferentiation**. Uppercase $$F$$ is a useful naming convention, not a different kind of function.

</aside>

Thus $$F(x)=x^2$$ is *an* antiderivative of $$f(x)=2x$$ on $$\mathbb R$$. To check a proposed antiderivative, differentiate it and compare the result with $$f$$ throughout the stated interval.

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>

Adding a constant leaves a derivative unchanged. We also know from the mean value theorem that a differentiable function with derivative zero on an interval is constant there. These two facts explain both why adding $$C$$ works and why it gives every possibility.

</aside>

## Why adding a constant gives every solution

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Antiderivatives differ by a constant on an interval</h3>

If $$F$$ is an antiderivative of $$f$$ on an open interval $$I$$, then every antiderivative of $$f$$ on $$I$$ has the form

$$
F(x)+C,
$$

where $$C$$ is a real constant. Conversely, each such function is an antiderivative of $$f$$ on $$I$$.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

Let $$G$$ be another antiderivative and put $$H=G-F$$. Then $$H^{\prime}=f-f=0$$ throughout $$I$$. For any $$a<b$$ in $$I$$, the entire segment $$[a,b]$$ lies in $$I$$. The function $$H$$ is continuous on this segment and differentiable inside it, so the mean value theorem gives a point $$c\in(a,b)$$ with

$$
\begin{aligned}
H(b)-H(a)&=H^{\prime}(c)(b-a)\\
&=0.
\end{aligned}
$$

Therefore every pair of values of $$H$$ agrees: $$H=C$$, and $$G=F+C$$. Conversely, differentiating $$F+C$$ gives $$f+0=f$$.

</details>
</section>

<mark>On an interval, a derivative determines the shape of a graph but leaves its vertical position undetermined.</mark>

The investigation below pairs a family of antiderivatives with their common derivative. The pale curves show three fixed members of the family; the darker curve is the one you can move.

{% include learning/antiderivative-family.html %}

First move the upper point vertically. The graph changes height, but its tangent slope at the selected input does not change. Next move the lower point across zero. Every member decreases where $$2x<0$$ and increases where $$2x>0$$, so each has a minimum at $$x=0$$. Their minimum *heights* can differ.

## Giving the family a name

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Indefinite integral</h3>

If $$F^{\prime}=f$$ on an interval, we write

$$
\int f(x)\,dx=F(x)+C
$$

for the family of all antiderivatives on that interval. This is the **indefinite integral** of $$f$$. The function $$f(x)$$ is the **integrand**, $$dx$$ identifies the variable of integration, and $$C$$ is the **constant of integration**.

</aside>

For example,

$$
\int 2x\,dx=x^2+C.
$$

The right side represents a family of functions. A particular choice, such as $$C=3$$, selects one member. There are no endpoints in this notation; definite integrals and their connection with area come later.

<aside class="attention" markdown="1">
<p class="element-label">Attention</p>
<h3>Reversing differentiation is not finding an inverse function</h3>

An antiderivative of $$2x$$ is $$x^2$$ because its *derivative* is $$2x$$. The inverse function of $$x\mapsto2x$$ is $$x\mapsto x/2$$ because it undoes the function by *composition*. These answer different questions.

</aside>

## Reading familiar derivative rules backwards

For a real exponent $$n\ne-1$$, the power rule gives

$$
\frac{d}{dx}\left(\frac{x^{n+1}}{n+1}\right)=x^n.
$$

Consequently,

$$
\int x^n\,dx=\frac{x^{n+1}}{n+1}+C,\qquad n\ne-1.
$$

Use this on an interval where the powers are real and the derivative identity holds. For arbitrary real exponents, $$x>0$$ is a safe domain; nonnegative integer powers also work on all of $$\mathbb R$$. Negative powers require $$x\ne0$$.

The sum and constant-multiple derivative rules also work backwards: if $$F^{\prime}=f$$ and $$G^{\prime}=g$$ on the same interval, then

$$
\begin{aligned}
&\int\bigl(af(x)+bg(x)\bigr)\,dx\\
&\qquad=aF(x)+bG(x)+C
\end{aligned}
$$

for constants $$a,b$$. Differentiating the right side verifies the statement. One arbitrary constant is enough: a sum of constant terms is still a constant.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Recovering a polynomial</h3>

Find all antiderivatives of $$3x^2-4x+2$$ on $$\mathbb R$$.

Treat each term separately. To obtain $$3x^2$$ after differentiating, use $$x^3$$; to obtain $$-4x$$, use $$-2x^2$$; and to obtain the constant $$2$$, use $$2x$$. Thus

$$
\begin{aligned}
&\int(3x^2-4x+2)\,dx\\
&\qquad=x^3-2x^2+2x+C.
\end{aligned}
$$

The check is immediate:

$$
\begin{aligned}
&\frac{d}{dx}(x^3-2x^2+2x+C)\\
&\qquad=3x^2-4x+2.
\end{aligned}
$$

The final $$2x$$ matters: a constant *integrand* has a linear antiderivative. Only an additive constant in the answer disappears during the check.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A chain-rule factor must be accounted for</h3>

Find an antiderivative of $$e^{2x}+\cos(x)$$ on $$\mathbb R$$.

The derivative of $$e^{2x}$$ is $$2e^{2x}$$, twice the first term we want. Multiplying by $$1/2$$ corrects that factor. Since the derivative of $$\sin(x)$$ is $$\cos(x)$$, we obtain

$$
F(x)=\frac12e^{2x}+\sin(x).
$$

Indeed,

$$
\begin{aligned}
F^{\prime}(x)&=\frac12\cdot2e^{2x}+\cos(x)\\
&=e^{2x}+\cos(x).
\end{aligned}
$$

This supplies one antiderivative. Adding $$C$$ gives all of them. Recognizing a familiar function is a starting point; differentiating checks that every factor is correct.

</section>

## The exceptional power and the role of the domain

At $$n=-1$$, the reverse power formula would divide by zero. Instead, recall the logarithmic derivative:

$$
\frac{d}{dx}\ln(x)=\frac1x\qquad(x>0).
$$

On $$x<0$$, the real expression $$\ln(-x)$$ has derivative

$$
\frac{d}{dx}\ln(-x)=\frac1{-x}\cdot(-1)=\frac1x.
$$

These combine into the useful notation

$$
\int\frac1x\,dx=\ln\lvert x\rvert+C,
$$

on any interval lying entirely on one side of zero. The absolute value makes the logarithm's argument positive; it does not allow the interval to pass through zero.

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>
<h3>The interval assumption matters</h3>

On a domain with a gap, different intervals can have different constants. For example,

$$
G(x)=
\begin{cases}
\ln(-x)+2,&x<0,\\
\ln(x)-3,&x>0
\end{cases}
$$

has derivative $$1/x$$ everywhere in its domain, but no single constant $$C$$ makes it equal to $$\ln\lvert x\rvert+C$$ on both sides. The constants are independent because no interval in the domain joins the two sides.

</aside>

## One known value selects one member

A condition such as $$F(a)=b$$ is an **initial condition**. It specifies a value of the unknown function; the input $$a$$ need not be zero or represent a starting time.

If $$A$$ is one antiderivative of $$f$$ on an interval containing $$a$$, all the possibilities are $$F(x)=A(x)+C$$. Substituting the known value gives $$C=b-A(a)$$. Therefore the unique member satisfying the condition is

$$
F(x)=A(x)+b-A(a).
$$

This explains uniqueness when an antiderivative exists. It does not yet establish that every function has an antiderivative.

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A condition away from zero</h3>

Find $$F$$ if $$F^{\prime}(x)=6x-4$$ on $$\mathbb R$$ and $$F(2)=7$$.

First recover the family:

$$
F(x)=3x^2-4x+C.
$$

Now impose the condition:

$$
7=F(2)=12-8+C,
$$

so $$C=3$$ and $$F(x)=3x^2-4x+3$$. Check both pieces of information: its derivative is $$6x-4$$, and its value at $$2$$ is $$7$$. The given value $$7$$ is not itself the integration constant.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>From acceleration to position</h3>

A cart moves along a straight track with constant acceleration $$2\,\mathrm{m/s^2}$$. At time $$t=0$$ its velocity is $$3\,\mathrm{m/s}$$ and its position is $$5\,\mathrm m$$. Find its position at $$t=4\,\mathrm s$$, assuming this model holds throughout $$0\le t\le4$$.

Write $$t$$ for the numerical time in seconds, $$v(t)$$ for velocity in metres per second, and $$s(t)$$ for position in metres. Since $$v^{\prime}(t)=2$$, the velocity family is

$$
v(t)=2t+C_1.
$$

The condition $$v(0)=3$$ gives $$C_1=3$$. Next, $$s^{\prime}(t)=v(t)=2t+3$$, so

$$
s(t)=t^2+3t+C_2.
$$

The condition $$s(0)=5$$ gives $$C_2=5$$. Hence

$$
s(4)=16+12+5=33.
$$

The cart is at position $$33\,\mathrm m$$. Its displacement from the initial position is $$33-5=28\,\mathrm m$$. Differentiating the position twice returns the prescribed acceleration; checking $$s(0)$$ and $$s^{\prime}(0)$$ returns both initial values.

Recovering position from acceleration introduced *two* independent constants. Each records information lost at a separate differentiation step.

</section>

## A final check before moving on

When you find an indefinite integral, differentiate your answer, check that it is defined on the intended interval, and include the arbitrary constant when the full family is requested. If a value is prescribed, check that condition as well.

We now know how a rate can determine a function up to a constant. In the next lesson, we approach accumulation by adding small pieces of area. The connection between these two ideas will become the fundamental theorem of calculus.
