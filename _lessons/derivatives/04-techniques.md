---
title: "Choosing a more powerful technique"
description: "Choose between implicit, inverse, logarithmic, and parametric differentiation."
module_id: derivatives
module_step: 4
breadcrumb: "Derivatives / Lesson 4"
permalink: /notes/derivatives/techniques/
math: true
duration: "60–90 minutes, plus problem work"
---

**Guiding question.** Can a different description of the same function make its derivative easier to find?

## Implicit differentiation: follow a branch

Suppose an equation $$x^2+xy+y^2=7$$ determines a differentiable branch $$y=y(x)$$ near a point. Differentiate the identity along that branch:

$$
2x+y+xy'+2yy'=0,
\qquad
y'=-\frac{2x+y}{x+2y},\quad x+2y\ne0.
$$

At $$(1,2)$$ the slope is $$-4/5$$. The $$y$$ in the product $$xy$$ is a function of $$x$$, so its derivative contributes $$xy'$$.

In general, if $$\Phi(x,y(x))=0$$ and $$\Phi$$ has continuous partial derivatives, the chain rule gives $$\Phi_x+\Phi_y y'=0$$. The partial derivatives mean differentiating with respect to one variable while holding the other fixed. If $$\Phi_y\ne0$$ at a point of the curve, the implicit function theorem guarantees a differentiable local branch there. We use that guarantee here without proving the theorem.

If $$\Phi_y=0$$, the division formula is unavailable. The curve may have a vertical tangent, several branches, or even a perfectly differentiable branch: inspect the relation itself. For $$x^2+y^2=1$$ at $$(1,0)$$, a finite $$y'$$ would require $$2+0\cdot y'=0$$, which is impossible. For other equations, a zero coefficient need not imply this contradiction.

## Inverse differentiation: reverse the relation

Suppose $$f$$ has a continuous inverse near $$b=f(a)$$, is differentiable at $$a$$, and $$f'(a)\ne0$$. Put $$y=f(x)$$. As $$y\to b$$, continuity of the inverse gives $$x\to a$$, and

$$
\frac{f^{-1}(y)-f^{-1}(b)}{y-b}
=\frac{x-a}{f(x)-f(a)}
\longrightarrow\frac1{f'(a)}.
$$

Thus $$(f^{-1})'(b)=1/f'(a)$$. The input to the inverse is $$b$$, while the derivative of $$f$$ is evaluated at $$a=f^{-1}(b)$$.

Apply this to the natural logarithm, the inverse of $$e^x$$:

$$
(\ln x)'=\frac1x,\qquad x>0.
$$

For real $$\alpha$$ and $$x>0$$, define $$x^\alpha=e^{\alpha\ln x}$$. The chain rule now proves $$(x^\alpha)'=\alpha x^{\alpha-1}$$. Also, for a constant $$b>0$$, $$b^x=e^{x\ln b}$$ has derivative $$b^x\ln b$$. Notice the difference between a constant exponent and a constant base.

## Logarithmic differentiation: turn products into sums

For a positive differentiable function $$y$$, differentiate $$\ln y$$:

$$
\frac{y'}y=(\ln y)'.
$$

For example, let $$y=(1+x^2)^{\sin x}$$. Its base is positive for every $$x$$, so

$$
\ln y=\sin x\ln(1+x^2),
$$

and

$$
y'=(1+x^2)^{\sin x}
\left[\cos x\ln(1+x^2)+\frac{2x\sin x}{1+x^2}\right].
$$

In general, for differentiable $$u>0$$ and $$v$$,

$$
\frac d{dx}u(x)^{v(x)}
=u(x)^{v(x)}\left[v'(x)\ln u(x)+v(x)\frac{u'(x)}{u(x)}\right].
$$

Both the base and the exponent change. Dropping either contribution is a common error. For a nonzero function of either sign, $$\ln\lvert y\rvert$$ gives $$y'/y$$ locally; zeros still require separate treatment. A variable real power of a negative base is not generally a real-valued function on an interval.

**[Revisit Lesson 3]({{ '/notes/derivatives/rules/#a-demanding-derivative-without-expanding' | relative_url }}).** Take the logarithm of $$F$$ and recover its three-term factored derivative in one line. This supplies a second route to the same answer.

## Parametric differentiation: keep the parameter straight

If a curve is given by differentiable functions $$x=X(t)$$ and $$y=Y(t)$$, and $$X'(t)\ne0$$, then on a local branch where $$t$$ can be expressed as a differentiable function of $$x$$,

$$
\frac{dy}{dx}=\frac{Y'(t)}{X'(t)}.
$$

For $$X(t)=e^t\cos t$$ and $$Y(t)=e^t\sin t$$, the slope at $$t=0$$ is $$1/1=1$$. If $$X'(t)=0$$, the quotient cannot be used there; return to the curve or a limit. A second derivative with respect to $$x$$ also requires the chain rule:

$$
\frac{d^2y}{dx^2}=\frac1{X'(t)}\frac d{dt}\left(\frac{Y'(t)}{X'(t)}\right).
$$

## Problems: choose the method

**4.1 — A tower with three changing copies of $$x$$.** For $$x>0$$, differentiate $$y=x^{(x^x)}$$. The parentheses specify the grouping. Explain why applying the constant-exponent power rule is invalid.

<details markdown="1">
<summary>Hint</summary>

First write $$\ln y=x^x\ln x$$. Differentiate $$x^x$$ by the same technique.

</details>

<details markdown="1">
<summary>Solution</summary>

Since $$(x^x)'=x^x(\ln x+1)$$,

$$
y'=x^{(x^x)}x^x
\left[(\ln x+1)\ln x+\frac1x\right].
$$

The exponent $$x^x$$ changes with $$x$$, so a formula derived for a constant exponent does not apply.

</details>

**4.2 — A zero denominator with two finite slopes.** Consider $$y^2=x^2(x+1)$$ near $$(0,0)$$. Differentiate implicitly away from $$y=0$$. Then exhibit two differentiable branches through the origin and find their slopes there. What information did the divided formula fail to provide?

<details markdown="1">
<summary>Hint</summary>

Use $$y=x\sqrt{1+x}$$ and $$y=-x\sqrt{1+x}$$ for $$x>-1$$ near zero. Avoid replacing $$x$$ by $$\lvert x\rvert$$ if you want smooth crossing branches.

</details>

<details markdown="1">
<summary>Solution</summary>

Implicit differentiation gives $$2yy'=3x^2+2x$$, so $$y'=(3x^2+2x)/(2y)$$ when $$y\ne0$$. At the origin this becomes the uninformative identity $$0=0$$. The displayed branches have derivatives $$1$$ and $$-1$$ at zero. The equation alone does not select a single branch or slope there.

</details>

**4.3 — An inverse without a formula.** Let $$f(x)=x^3+x$$. Show it has a continuous inverse $$g$$ on $$\mathbb R$$ without solving the cubic. Find $$g'(2)$$ and $$g''(2)$$.

<details markdown="1">
<summary>Hint</summary>

For $$u>v$$, factor $$f(u)-f(v)$$. Then use $$g^3+g=x$$ and differentiate twice.

</details>

<details markdown="1">
<summary>Solution</summary>

The difference is $$(u-v)(u^2+uv+v^2+1)>0$$. The function is continuous, strictly increasing, and tends to opposite infinities at opposite ends, so it is a bijection with a continuous inverse. Since $$f'(x)=3x^2+1>0$$, its inverse is differentiable. As $$g(2)=1$$,

$$
g'=\frac1{3g^2+1},\qquad
g''=-\frac{6g}{(3g^2+1)^3}.
$$

Consequently $$g'(2)=1/4$$ and $$g''(2)=-3/32$$. Differentiating the first derivative formula is legitimate because its denominator never vanishes.

</details>

**4.4 — Two derivatives, two variables.** For $$x=t+t^3$$ and $$y=t^2$$, find $$dy/dx$$ and $$d^2y/dx^2$$ at $$t=1$$. Explain why $$d^2y/dt^2=2$$ is not the requested second derivative.

<details markdown="1">
<summary>Hint</summary>

After differentiating $$2t/(1+3t^2)$$ with respect to $$t$$, divide once more by $$dx/dt$$.

</details>

<details markdown="1">
<summary>Solution</summary>

Since $$X'=1+3t^2>0$$,

$$
\frac{dy}{dx}=\frac{2t}{1+3t^2},\qquad
\frac{d^2y}{dx^2}=\frac{2-6t^2}{(1+3t^2)^3}.
$$

At $$t=1$$ these are $$1/2$$ and $$-1/16$$. Changing $$x$$ changes $$t$$ at the rate $$dt/dx=1/X'$$; the second derivative with respect to the parameter omits this conversion.

</details>

**Checkpoint.** Choose a method before calculating: explicit composition, implicit relation, inverse, logarithm, or parameter. Say why its hypotheses hold at the point you need.
