---
layout: learning-topic
title: "Logarithmic differentiation"
permalink: /learning/calculus/implicit-and-logarithmic-differentiation/logarithmic-differentiation/
course_key: calculus
module_key: implicit-and-logarithmic-differentiation
position: "4.2"
description: Use logarithms to turn products into sums and bring changing exponents down where you can differentiate them.
math: true
sitemap: false
exercises:
  - text: 'For \(y=(x^2+1)^3\), which logarithmic rewrite is valid?'
    options: ['\(\ln y=6\ln x\)', '\(\ln y=3\ln(x^2+1)\)', '\(\ln y=3(\ln(x^2)+\ln1)\)']
    correct: 1
    why: 'The power becomes a multiplier, but the sum inside remains intact. There is no rule that splits the logarithm of a sum into a sum of logarithms.'
  - text: 'For \(y=2^x\), taking logarithms gives \(\ln y=x\ln2\). What follows after differentiating?'
    options: ['\(y^{\prime}/y=\ln2\)', '\(y^{\prime}/y=x/2\)', '\(y^{\prime}/y=1\)', '\(y^{\prime}=x\ln2\)']
    correct: 0
    why: 'The number \(\ln2\) is constant, so the derivative of \(x\ln2\) is \(\ln2\). Multiplying by \(y\) then gives \(y^{\prime}=2^x\ln2\).'
  - text: 'A positive differentiable function has \(f(2)=10\) and \(f^{\prime}(2)=3\). What is the slope of \(\ln(f(x))\) at \(x=2\)?'
    options: ['\(3\)', '\(30\)', '\(0.3\)', '\(\ln3\)']
    correct: 2
    why: 'The chain rule gives \(d[\ln(f(x))]/dx=f^{\prime}(x)/f(x)\). At this input, the ratio is \(3/10=0.3\), not the logarithm of the original slope.'
  - text: 'For \(y=x-1\), logarithmic differentiation is unavailable at \(x=1\). Does that mean the original function has no derivative there?'
    options: ['Yes: zero values prevent differentiability', 'No: its derivative is \(1\); only the logarithmic method fails there', 'No: its derivative is \(0\) there']
    correct: 1
    why: 'The original function is a line with slope one. At its zero, \(\ln y\) and \(y^{\prime}/y\) are undefined, so use another method.'
  - text: 'For \(y=\sqrt{2-x}/(x-1)\), which interval lets us take the logarithm of each positive factor and of \(y\)?'
    options: ['\(x<1\)', '\(1<x<2\)', '\(x>2\)', '\(1<x\le2\)']
    correct: 1
    why: 'We need \(2-x>0\) and \(x-1>0\), giving \(1<x<2\). At \(x=2\), the original function is zero, so its logarithm is unavailable.'
  - text: 'A positive function satisfies \(\frac{d}{dx}\ln(y)=0\) at one input. What follows at that input?'
    options: ['\(y=1\)', '\(y^{\prime}=0\)', '\(y=0\)', '\(y\) is constant everywhere']
    correct: 1
    why: 'Since \(\frac{d}{dx}\ln(y)=y^{\prime}/y\) and \(y>0\), a zero logarithmic derivative means a zero ordinary derivative there. It determines neither the height nor the behavior at other inputs.'
---

## The idea

Products, quotients, and powers can become easier to differentiate after taking a logarithm. This is especially useful when **both the base and the exponent depend on the input**, as in $$x^x$$.

The method combines logarithm laws with implicit differentiation.

## The logarithm rule we need

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Natural logarithms</h3>

The natural logarithm, $$\ln x$$, is the inverse of $$e^x$$, so $$e^{\ln x}=x$$ for $$x>0$$.

For positive $$u,v$$, the logarithm laws are

$$\ln(uv)=\ln u+\ln v,\qquad \ln(u/v)=\ln u-\ln v,\qquad \ln(u^r)=r\ln u.$$

A real logarithm needs a positive argument. A sum inside a logarithm cannot be split by these laws.

</aside>

<section class="theorem" markdown="1">
<p class="element-label">Rule</p>
<h3>Derivative of a logarithm</h3>

For differentiable $$u(x)>0$$,

$$\frac{d}{dx}\ln(u(x))=\frac{u^{\prime}(x)}{u(x)}.$$

<details class="disclosure" markdown="1">
<summary>Derivation (optional)</summary>

The inverse derivative rule and the previously introduced exponential derivative give

$$\frac{d}{dx}\ln x=\frac{1}{e^{\ln x}}=\frac1x,\qquad x>0.$$

Apply the chain rule to the composition $$\ln(u(x))$$:

$$\frac{d}{dx}\ln(u(x))=\frac{1}{u(x)}\cdot u^{\prime}(x).$$

</details>
</section>

<aside class="definition" markdown="1">
<p class="element-label">Method</p>
<h3>Logarithmic differentiation</h3>

On an interval where $$y=f(x)>0$$:

1. Take $$\ln y$$ on both sides.
2. Use logarithm laws to simplify the expression.
3. Differentiate with respect to $$x$$, treating $$y$$ as a function of $$x$$.
4. Multiply by $$y$$, then substitute the original expression for $$y$$.

The left side becomes $$y^{\prime}/y$$, not $$y^{\prime}$$. <mark>Multiply by the original function to recover its derivative.</mark>

</aside>

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>A changing base and exponent</h3>

Let $$y=x^x$$ for $$x>0$$. The usual power rule assumes a constant exponent, so it does not apply directly. Instead,

$$\ln y=x\ln x.$$

Differentiate the product on the right:

$$\frac{y^{\prime}}y=\ln x+x\frac1x=\ln x+1.$$

Now multiply by $$y=x^x$$:

$$y^{\prime}=x^x(\ln x+1).$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A product, a root, and a quotient</h3>

For $$x>1$$, let

$$y=\frac{x^2\sqrt{x-1}}{(x+2)^3}.$$

All factors are positive on this interval, so

$$\ln y=2\ln x+\frac12\ln(x-1)-3\ln(x+2).$$

Differentiate each term, including its inner derivative:

$$\frac{y^{\prime}}y=\frac2x+\frac1{2(x-1)}-\frac3{x+2}.$$

Thus

$$y^{\prime}=\frac{x^2\sqrt{x-1}}{(x+2)^3}\left(\frac2x+\frac1{2(x-1)}-\frac3{x+2}\right).$$

The factored answer keeps the original function visible and avoids expanding a large numerator.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A variable power with an inner function</h3>

For $$x>-1$$, let $$y=(1+x)^{\sin x}$$. The base is positive, so

$$\ln y=\sin(x)\cdot\ln(1+x).$$

Apply the product rule and chain rule:

$$\frac{y^{\prime}}y=\cos(x)\cdot\ln(1+x)+\frac{\sin x}{1+x}.$$

Multiply by the original function:

$$y^{\prime}=(1+x)^{\sin x}\left(\cos(x)\cdot\ln(1+x)+\frac{\sin x}{1+x}\right).$$

Both changing parts contribute: one term comes from the exponent, and one from the base.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Logarithms do not split sums: $$\ln(u+v)\ne\ln u+\ln v$$ in general. Do not take the logarithm of zero, and do not stop at $$y^{\prime}/y$$ when the question asks for $$y^{\prime}$$. If the original function has a zero, check its derivative there by another method.

</aside>
