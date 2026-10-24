---
layout: learning-topic
title: "Indeterminate forms and l’Hôpital’s rule"
permalink: /learning/calculus/applications-of-derivatives/indeterminate-forms-and-lhopitals-rule/
course_key: calculus
module_key: applications-of-derivatives
position: "4.6"
description: "Decide when a derivative ratio can evaluate a limit, and turn products, differences and powers into suitable quotients."
math: true
sitemap: false
exercises:
  - text: "Which limit has an eligible quotient form directly?"
    options: ["\\(\\lim_{x\\to0}e^x/x\\)", "\\(\\lim_{x\\to0}\\ln(1+x)/x\\)", "\\(\\lim_{x\\to0^+}x\\ln x\\)"]
    correct: 1
    why: "The logarithm quotient has form \\(0/0\\). The first has a nonzero numerator, while the product must be rewritten first."
  - text: "For \\(\\lim_{x\\to0}(\\sin x-x)/x^3\\), what is the first derivative ratio?"
    options: ["\\(\\frac{\\cos x-1}{3x^2}\\)", "\\(\\frac{d}{dx}\\left(\\frac{\\sin x-x}{x^3}\\right)\\)", "\\(\\frac{\\cos x}{3x^2}\\)"]
    correct: 0
    why: "Differentiate numerator and denominator separately; keep the derivative of \\(-x\\). The quotient rule computes a different quantity."
  - text: "What is \\(\\lim_{x\\to0^+}x^x\\)? Use logarithms and l’Hôpital’s rule."
    options: ["\\(0\\)", "\\(1\\)", "The \\(0^0\\) form means the limit does not exist"]
    correct: 1
    why: "For \\(y=x^x\\), \\(\\ln y=x\\ln x=\\frac{\\ln x}{1/x}\\). This quotient has an infinity-over-infinity form. Its derivative ratio simplifies to \\(-x\\to0\\), so \\(\\ln y\\to0\\). Exponentiating gives \\(y\\to e^0=1\\)."
  - text: "For \\(x\\to+\\infty\\), which rewriting makes \\(x(e^{1/x}-1)\\) eligible?"
    options: ["\\((e^{1/x}-1)/(1/x)\\)", "\\(x e^{1/x}-x\\)", "Differentiate the two factors directly"]
    correct: 0
    why: "The quotient has form \\(0/0\\); the product itself is not in the theorem’s quotient form."
  - text: "If the derivative ratio oscillates without a limit, what follows about the original quotient?"
    options: ["It must diverge", "It must tend to zero", "This theorem gives no conclusion"]
    correct: 2
    why: "A sufficient condition failing does not establish failure of the conclusion. A different method may evaluate the original limit."
  - text: "What is \\(\\lim_{x\\to0}(e^x-1)/\\sin x\\)?"
    options: ["\\(0\\)", "\\(1\\)", "The rule cannot apply because \\(\\sin(x)\\) changes sign"]
    correct: 1
    why: "Both parts vanish; near zero, \\(\\cos(x)\\) is nonzero. The derivative ratio \\(\\frac{e^x}{\\cos(x)}\\) tends to \\(1\\). Apply the rule on each side of zero; both one-sided limits are \\(1\\)."
  - text: "Which statement about \\(\\lim_{x\\to+\\infty}\\ln(x)/x=0\\) is correct?"
    options: ["\\(\\ln(x)\\) tends to zero", "\\(x\\) eventually equals \\(\\ln(x)\\)", "\\(\\ln(x)\\) grows more slowly in the sense of their ratio"]
    correct: 2
    why: "Both functions grow without bound, but the ratio compares their relative sizes."
---

<!-- Prerequisites: Limit laws, one-sided and infinite limits, exponential and logarithmic derivatives, chain rule, mean value theorem. Established here: L’Hôpital rule with sufficient hypotheses; transformations of other indeterminate forms; limits of positive powers. -->

## The form tells you what is unresolved

Substitution sometimes gives a value immediately. At other times, it tells us only that competing tendencies remain unresolved. The **indeterminate form** $$0/0$$ is one such situation: both quantities vanish, but their relative rates of vanishing determine the quotient.

For instance, as $$x\to0^+$$, $$x^2/x\to0$$, $$x/x\to1$$ and $$x/x^2\to+\infty$$. The same formal shape has three different outcomes. <mark markdown="span">Indeterminate forms like $$0/0$$ and $$\infty/\infty$$ are diagnoses, not answers.</mark>

A quotient whose numerator and denominator each tend to $$+\infty$$ or $$-\infty$$ has an **infinity-over-infinity form**; their signs may differ. Merely being unbounded is not enough: each must tend to an infinite limit. Again, the relative growth matters.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>L’Hôpital’s rule</h3>

Consider a one-sided limit as $$x$$ approaches a finite endpoint, or a limit as $$x\to+\infty$$ or $$x\to-\infty$$. On the relevant open interval sufficiently near that endpoint, assume that $$f$$ and $$g$$ are differentiable and that $$g(x)\ne0$$ and $$g^{\prime}(x)\ne0$$.

All limits below use the same approach direction. Neither function needs to be defined at a finite approach point.

Suppose either both $$f$$ and $$g$$ tend to zero, or both tend to infinity in magnitude. If

$$\lim_{x\to a}\frac{f^{\prime}(x)}{g^{\prime}(x)}=L$$

exists as a finite or infinite limit, then

$$\lim_{x\to a}\frac{f(x)}{g(x)}=L.$$

The symbol $$a$$ also represents the relevant infinite endpoint. For a two-sided finite limit, apply the one-sided statement on both sides and check that the answers agree.

The full theorem is stated without proof. Its general proof needs an extension of the mean value theorem; the explanation below proves only a restricted case.

</section>
<details class="disclosure" markdown="1">
<summary>Why derivatives enter a zero-over-zero limit (optional)</summary>

Suppose $$f(a)=g(a)=0$$, both functions are differentiable at the finite input $$a$$, and $$g^{\prime}(a)\ne0$$. For $$x\ne a$$,

$$\frac{f(x)}{g(x)}=\frac{[f(x)-f(a)]/(x-a)}{[g(x)-g(a)]/(x-a)}.$$

Taking the derivative limits gives $$f^{\prime}(a)/g^{\prime}(a)$$. If additionally the derivatives are continuous at $$a$$, the derivative ratio has this same limit. This motivates the theorem in a simple setting, but does not prove cases where both derivatives vanish, derivatives fail at the endpoint, or the endpoint is infinite.

</details>

## Use the rule as a conditional step

First compute the numerator and denominator limits separately. If the quotient has an eligible form and the hypotheses hold, differentiate numerator and denominator *separately*. Then evaluate the new ratio. Reapply only after checking the new form and hypotheses.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>A second application</h3>

Evaluate $$\displaystyle\lim_{x\to0}\frac{e^x-1-x}{x^2}$$. Both parts tend to zero, and the functions are differentiable near zero. The denominator derivative $$2x$$ is nonzero off zero. Thus we may study

$$\lim_{x\to0}\frac{e^x-1}{2x}.$$

This is again $$0/0$$; its denominator derivative is now the nonzero constant $$2$$. A second application gives

$$\begin{aligned}
&\lim_{x\to0}\frac{e^x-1-x}{x^2}\\
&\quad=\lim_{x\to0}\frac{e^x-1}{2x}\\
&\quad=\lim_{x\to0}\frac{e^x}{2}=\frac12.
\end{aligned}$$

The reasoning runs back from the last, existing limit to justify each earlier equality.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Unbounded growth at different rates</h3>

As $$x\to+\infty$$, both $$\ln x$$ and $$x$$ tend to infinity. Since the denominator derivative is $$1$$,

$$\lim_{x\to+\infty}\frac{\ln x}{x}=\lim_{x\to+\infty}\frac{1/x}{1}=0.$$

The logarithm remains unbounded; the zero limit says its size becomes small *relative to* $$x$$.

<figure class="topic-figure" id="logarithm-relative-growth">
<div class="applications-legend" aria-label="Logarithm ratio figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$y=\frac{\ln x}{x}$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-log-growth.svg' | relative_url }}" alt="The ratio of natural log x to x, shown for x at least one, initially rises and then falls toward zero while remaining positive." width="640" height="350" loading="lazy">
<figcaption markdown="span">Shown for $$x\ge1$$. The ratio eventually decreases toward $$0$$, even though both $$\ln x$$ and $$x$$ grow without bound.</figcaption>
</figure>

</section>

## Products and differences must be rewritten

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A vanishing factor times an unbounded factor</h3>

For $$x\to0^+$$, the expression $$x\ln x$$ has form $$0\cdot(-\infty)$$. The rule cannot be applied directly to a product. Rewrite it as an unbounded quotient:

$$\begin{aligned}
\lim_{x\to0^+}x\ln x
&=\lim_{x\to0^+}\frac{\ln x}{1/x}\\
&=\lim_{x\to0^+}\frac{1/x}{-1/x^2}\\
&=\lim_{x\to0^+}(-x)=0.
\end{aligned}$$

Here the derivative of $$1/x$$ is nonzero on $$x>0$$, so the quotient meets the conditions.

<figure class="topic-figure" id="vanishing-logarithm-product">
<div class="applications-legend" aria-label="Logarithm product figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$y=x\ln x$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-log-product.svg' | relative_url }}" alt="The curve x times natural log x approaches an open point at the origin from below as x approaches zero from the right." width="640" height="350" loading="lazy">
<figcaption markdown="span">Read toward $$0$$ from the right. The product approaches $$0$$ from below; the open point marks that $$x\ln x$$ is undefined at $$x=0$$.</figcaption>
</figure>

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>A difference of two unbounded terms</h3>

Evaluate $$\displaystyle\lim_{x\to0^+}\left(\frac1x-\frac1{e^x-1}\right)$$. Both terms tend to positive infinity. Combine them:

$$\frac1x-\frac1{e^x-1}=\frac{e^x-1-x}{x(e^x-1)}.$$

This has form $$0/0$$. The first derivative ratio is

$$\frac{e^x-1}{e^x-1+xe^x},$$

again $$0/0$$. The second derivative ratio is $$e^x/(2e^x+xe^x)$$, which tends to $$1/2$$. Each denominator derivative is positive for $$x>0$$, so the applications are valid. The original difference tends to $$1/2$$.

</section>

## Powers: take a logarithm first

For a positive base $$u(x)$$, put $$y=u(x)^{v(x)}$$. The logarithm turns a changing exponent into a product:

$$\ln y=v(x)\ln(u(x)).$$

The forms $$1^\infty$$, $$0^0$$ and $$\infty^0$$ may become indeterminate products or quotients. After finding the logarithm limit, return to $$y$$ using continuity of the exponential.

<section class="worked" markdown="1">
<p class="element-label">Example 5</p>
<h3>A base approaching one</h3>

Find $$\displaystyle\lim_{x\to0}(1+2x)^{1/x}$$. Near zero the base is positive. For $$y=(1+2x)^{1/x}$$,

$$\begin{aligned}
\lim_{x\to0}\ln y
&=\lim_{x\to0}\frac{\ln(1+2x)}x\\
&=\lim_{x\to0}\frac{2}{1+2x}=2.
\end{aligned}$$

Therefore $$\displaystyle\lim_{x\to0}(1+2x)^{1/x}=e^2$$. The number $$2$$ is the limit of the logarithm, not of the original power.

<figure class="topic-figure" id="power-limit-from-both-sides">
<div class="applications-legend" aria-label="Power limit figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$y=(1+2x)^{1/x}$$</span>
<span markdown="span"><svg class="applications-legend-line" width="20" height="6" viewBox="0 0 20 6" aria-hidden="true" focusable="false"><line x1="0" y1="3" x2="20" y2="3" stroke="#617a9a" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="butt" vector-effect="non-scaling-stroke"/></svg> $$y=e^2$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-power-limit.svg' | relative_url }}" alt="The power one plus two x raised to one over x approaches the height e squared from both sides of zero. An open point at zero and e squared marks the missing function value." width="640" height="350" loading="lazy">
<figcaption markdown="span">The power approaches $$e^2\approx7.389$$ from both sides. Its value at $$x=0$$ is undefined, while its limit exists.</figcaption>
</figure>

</section>
<section class="warning" markdown="1">
<p class="element-label">Warning</p>

A nonzero numerator over a vanishing denominator is not an eligible indeterminate form. For example, differentiating numerator and denominator in $$1/x$$ would incorrectly suggest zero.

The rule concerns limits, not equality of the original functions with their derivative ratio. If the derivative ratio has no limit, this version of the theorem gives no conclusion; the original quotient may still converge. Algebra, squeeze arguments and standard limits remain useful.

</section>

<details class="disclosure" markdown="1">
<summary>A convergent quotient with an oscillating derivative ratio (optional)</summary>

As $$x\to+\infty$$, let $$f(x)=x+\sin x$$ and $$g(x)=x$$. Both tend to $$+\infty$$, but

$$\frac{f^{\prime}(x)}{g^{\prime}(x)}=1+\cos x$$

has no limit. Nevertheless,

$$\frac{f(x)}{g(x)}=1+\frac{\sin x}{x}\longrightarrow1,$$

because $$-1/x\le\sin x/x\le1/x$$ for $$x>0$$. The squeeze theorem settles the limit when l’Hôpital’s rule gives no conclusion.

</details>
