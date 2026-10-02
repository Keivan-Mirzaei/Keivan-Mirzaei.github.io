---
title: "Why the differentiation rules work"
description: "Derive the differentiation rules, then combine them in demanding calculations."
module_id: derivatives
module_step: 3
breadcrumb: "Derivatives / Lesson 3"
permalink: /notes/derivatives/rules/
math: true
duration: "60–90 minutes, plus problem work"
---

**Guiding question.** Can every rule be traced back to the same limit, rather than memorized as an unrelated instruction?

Assume $$f$$ and $$g$$ are differentiable at $$a$$. Write $$\Delta f=f(a+h)-f(a)$$ and similarly for $$\Delta g$$.

## Linearity and the product rule

For constants $$\alpha,\beta$$, the quotient for $$\alpha f+\beta g$$ is $$\alpha\Delta f/h+\beta\Delta g/h$$. Taking limits gives

$$
(\alpha f+\beta g)'(a)=\alpha f'(a)+\beta g'(a).
$$

For a product, add and subtract $$f(a+h)g(a)$$:

$$
\frac{f(a+h)g(a+h)-f(a)g(a)}h
=f(a+h)\frac{\Delta g}h+g(a)\frac{\Delta f}h.
$$

Differentiability gives continuity of $$f$$, so $$f(a+h)\to f(a)$$. Therefore

$$
(fg)'(a)=f'(a)g(a)+f(a)g'(a).
$$

The two terms account for changes in each factor. For example, $$(x\cdot x)'=2x$$; multiplying the two derivatives would incorrectly give $$1$$.

## Reciprocals and quotients

If $$g(a)\ne0$$, continuity makes $$g(a+h)\ne0$$ for sufficiently small $$h$$. Then

$$
\frac{1/g(a+h)-1/g(a)}h
=-\frac{\Delta g/h}{g(a+h)g(a)}
\longrightarrow-\frac{g'(a)}{g(a)^2}.
$$

Apply the product rule to $$f\cdot(1/g)$$:

$$
\left(\frac fg\right)'(a)
=\frac{f'(a)g(a)-f(a)g'(a)}{g(a)^2}.
$$

The condition $$g(a)\ne0$$ matters. A formula derived on a punctured domain does not automatically define a derivative at a missing point.

## The chain rule, including a subtle case

Suppose $$g$$ is differentiable at $$a$$ and $$f$$ at $$b=g(a)$$, with the composition defined near $$a$$. Differentiability means we can write

$$
g(a+h)-b=h\bigl(g'(a)+\varepsilon(h)\bigr),\qquad\varepsilon(h)\to0,
$$

and

$$
f(b+k)-f(b)=k\bigl(f'(b)+\eta(k)\bigr),\qquad\eta(k)\to0.
$$

Define $$\eta(0)=0$$ so the second identity also holds when $$k=0$$. Substituting $$k=g(a+h)-b$$, which tends to zero, gives

$$
\frac{f(g(a+h))-f(g(a))}h
=\bigl(g'(a)+\varepsilon(h)\bigr)\bigl(f'(b)+\eta(k)\bigr)
\longrightarrow g'(a)f'(b).
$$

Thus $$(f\circ g)'(a)=f'(g(a))g'(a)$$. This proof also covers increments for which $$g(a+h)=g(a)$$. Dividing by $$g(a+h)-g(a)$$ without checking it could miss those increments.

## A small toolbox, built from limits

For trigonometric functions, use radians and the standard limits

$$
\frac{\sin h}h\to1,\qquad\frac{\cos h-1}h\to0.
$$

The angle-addition formulas turn the quotient for $$\sin x$$ into

$$
\sin a\frac{\cos h-1}h+\cos a\frac{\sin h}h\longrightarrow\cos a.
$$

The same method gives $$(\cos x)'=-\sin x$$. For the exponential, use the standard limit $$(e^h-1)/h\to1$$ and $$e^{a+h}=e^ae^h$$ to obtain $$(e^x)'=e^x$$. These three elementary limits are inputs here; their proofs can be reviewed in a limits module. The logarithm and general real powers will be justified in [Lesson 4]({{ '/notes/derivatives/techniques/' | relative_url }}).

| Function | Derivative | Domain for this formula |
| --- | --- | --- |
| $$c$$ | $$0$$ | $$\mathbb R$$ |
| $$x^n$$, integer $$n\ge1$$ | $$nx^{n-1}$$ | $$\mathbb R$$ |
| $$x^{-n}$$, integer $$n\ge1$$ | $$-nx^{-n-1}$$ | $$x\ne0$$ |
| $$\sqrt{x}$$ | $$1/(2\sqrt{x})$$ | $$x>0$$ |
| $$\sin x$$ | $$\cos x$$ | $$\mathbb R$$, radians |
| $$\cos x$$ | $$-\sin x$$ | $$\mathbb R$$, radians |
| $$e^x$$ | $$e^x$$ | $$\mathbb R$$ |

## A demanding derivative without expanding

Differentiate

$$
F(x)=\frac{e^{\sin(x^2)}(1+x^2)^3}{\sqrt{2+\cos x}}.
$$

First check the domain: $$2+\cos x\ge1$$, so $$F$$ is defined and positive for every real $$x$$. Treat it as $$ABC$$, where

$$
A=e^{\sin(x^2)},\qquad B=(1+x^2)^3,\qquad C=(2+\cos x)^{-1/2}.
$$

Repeated use of the chain rule gives

$$
A'=A\,2x\cos(x^2),\quad
B'=6x(1+x^2)^2,\quad
C'=\frac{\sin x}{2(2+\cos x)^{3/2}}.
$$

The rule for $$C$$ follows by combining the reciprocal and square-root rules. The three-factor product rule gives $$F'=A'BC+AB'C+ABC'$$. Factor $$ABC=F$$:

$$
F'(x)=F(x)\left[
2x\cos(x^2)+\frac{6x}{1+x^2}
+\frac{\sin x}{2(2+\cos x)}
\right].
$$

Each term has a visible source. The factored answer is often more useful, and easier to check, than an expanded one.

## Problems: combine and justify the rules

**3.1 — Track every layer.** Differentiate

$$
H(x)=\frac{\sin(e^{x^2})}{1+\cos^2x}
$$

and explain why the formula is valid for every real $$x$$. Identify the inner-function factors in your answer.

<details markdown="1">
<summary>Hint</summary>

Differentiate the numerator and denominator separately before applying the quotient rule.

</details>

<details markdown="1">
<summary>Solution</summary>

$$
H'(x)=\frac{
2xe^{x^2}\cos(e^{x^2})(1+\cos^2x)
+2\sin(e^{x^2})\sin x\cos x
}{(1+\cos^2x)^2}.
$$

The numerator's nested chain contributes $$2x$$ and $$e^{x^2}$$. The denominator derivative is $$-2\cos x\sin x$$, producing the positive second term. Since $$1+\cos^2x\ge1$$, there are no excluded real points.

</details>

**3.2 — A missing point in disguise.** Let $$q(x)=(x^2-1)/(x-1)$$ for $$x\ne1$$. Compute $$q'$$ on its domain. Then choose $$q(1)$$ so the extended function is differentiable at $$1$$, and find that derivative. Why can you not substitute $$x=1$$ into the original quotient-rule expression?

<details markdown="1">
<summary>Hint</summary>

Simplify the function before differentiating it.

</details>

<details markdown="1">
<summary>Solution</summary>

For $$x\ne1$$, $$q(x)=x+1$$, so $$q'(x)=1$$. Continuity requires $$q(1)=2$$, and that extension is the linear function $$x+1$$ everywhere, with derivative $$1$$ at the join. The original function has no value at $$1$$ and the original denominator vanishes there; only the extension supplies a derivative at that point.

</details>

**3.3 — The converse of the product rule fails.** Construct two functions, both nondifferentiable at zero, whose product is differentiable there. Next construct a function $$f$$ that is nondifferentiable at zero while $$f^2$$ is differentiable there. Explain why these examples do not contradict the product rule.

<details markdown="1">
<summary>Hint</summary>

Try $$f(x)=\lvert x\rvert$$.

</details>

<details markdown="1">
<summary>Solution</summary>

Take $$f(x)=g(x)=\lvert x\rvert$$. Both fail to be differentiable at zero, but $$fg=f^2=x^2$$ has derivative zero there. The rule is a sufficient implication from differentiability of the factors; it does not claim that differentiability of a product forces differentiability of its factors.

</details>

**3.4 — Repeated differentiation.** Define $$f^{(0)}=f$$ and $$f^{(n+1)}=(f^{(n)})'$$ whenever these functions exist. For $$f(x)=xe^x$$, calculate the first three derivatives, conjecture a formula for $$f^{(n)}$$, and prove it by induction.

<details markdown="1">
<summary>Hint</summary>

Keep each answer factored by $$e^x$$.

</details>

<details markdown="1">
<summary>Solution</summary>

The first three are $$(x+1)e^x$$, $$(x+2)e^x$$, and $$(x+3)e^x$$. The formula $$f^{(n)}(x)=(x+n)e^x$$ holds for every integer $$n\ge0$$. Differentiating the formula gives $$e^x+(x+n)e^x=(x+n+1)e^x$$, proving the induction step.

</details>

**Checkpoint.** Given a complicated expression, describe its outermost operation before differentiating. State any restrictions on denominators and roots. A short answer is useful only if every factor has been accounted for.
