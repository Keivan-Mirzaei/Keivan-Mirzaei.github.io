---
title: Functions, domains, and representations
description: Specify a function, find its domain and range, and read its formula, graph, and table consistently.
module_id: functions-limits
module_step: 1
breadcrumb: Calculus I / Functions / Lesson 1
permalink: /learning/calculus-i/functions-limits/functions/
math: true
widgets: [function-machine]
objectives:
  - Specify a real-valued function by its domain and its assignment rule.
  - Distinguish a stated domain from the natural domain of an expression.
  - Prove an exact range by excluding impossible outputs and producing every claimed output.
  - Interpret a formula, graph, and table without assuming information they do not supply.
---

**Guiding question.** What information do we need before we can say exactly what a function is?

## What you should be able to do

<ul>
{% for objective in page.objectives %}
  <li>{{ objective }}</li>
{% endfor %}
</ul>

## A function includes its domain

Think of a function as a **machine**: an input in its **domain** produces exactly one output; an input outside its domain gives **undefined**. This is an error message, not a numerical output.

{% include widgets/function-machine.html id='function-machine' %}

Here $$\log$$ is the **natural logarithm**. It requires $$1-x^2>0$$, so the **domain** is $$(-1,1)$$. Try $$x=0$$, then $$x=1$$.

In this course, we work with **real-valued functions of one real variable**. Let $$D\subseteq\mathbb R$$. A function

$$
f:D\longrightarrow\mathbb R
$$

assigns **exactly one real number** $$f(x)$$ to each $$x\in D$$. The set $$D$$ is its **domain**: the allowed inputs. The target set $$\mathbb R$$ is its **codomain**. Its **range**, also called its **image**, is the set of outputs actually attained:

$$
f(D)=\{f(x):x\in D\}.
$$

Different inputs may have the same output. What the definition prohibits is assigning two different outputs to the **same input**. If $$x\notin D$$, this function has no value at $$x$$.

The notation $$f(x)$$ means “the value of $$f$$ at $$x$$”; it does not mean $$f$$ multiplied by $$x$$. An equation such as $$y=f(x)$$ names the output $$y$$ corresponding to the input $$x$$.

**A formula alone may leave the domain unspecified.** When we ask for the **natural real domain of an expression**, we mean all real inputs for which that expression, as written, is defined and real. Denominators must be nonzero, radicands of square roots must be nonnegative, and logarithm arguments must be positive. A stated domain may be a smaller set, for example because a model restricts the allowed inputs.

Throughout this course, an explicitly stated domain takes precedence. When a formula is supplied without a domain, we use its natural real domain unless the problem states a different convention. Simplifying an expression does not restore inputs excluded from the original domain.

For real-valued functions, **equality of functions** requires the same domain and the same value at every input in that domain. Having equal values on a shared subset is a weaker statement.

## Does simplifying give the same function?

Consider two functions, each on its **natural real domain**:

$$
F(x)=\frac{1-x^2}{1-x},\qquad G(x)=1+x.
$$

**Are these the same function?** Before simplifying, check which inputs each function allows.

The denominator of $$F$$ is zero at $$x=1$$, so its domain is $$\mathbb R\setminus\{1\}$$. The domain of $$G$$ is all of $$\mathbb R$$. For every $$x\ne1$$, we can factor and cancel:

$$
F(x)=\frac{(1-x)(1+x)}{1-x}=1+x=G(x).
$$

Cancellation is valid here because $$1-x\ne0$$. It establishes agreement at **every shared input**; it does not add $$1$$ to the domain of $$F$$.

At $$x=1$$, $$F$$ is **undefined** because that input is outside its domain, while $$G(1)=2$$. Thus **the functions are different**, although their outputs agree wherever $$F$$ is defined.

The simplified formula $$1+x$$ still describes $$F$$ if we retain its domain $$\mathbb R\setminus\{1\}$$. Using that formula on all of $$\mathbb R$$ gives $$G$$ instead. **The domain is part of the function.**

## Find the domain, then prove the range

Consider

$$
f(x)=\sqrt{4-x^2}
$$

on its natural real domain. The square root is defined exactly when

$$
4-x^2\ge0,
$$

so the **domain** is $$D=[-2,2]$$.

The range is $$[0,2]$$. To establish that claim, we need **both directions**.

First, if $$x\in[-2,2]$$, then $$0\le4-x^2\le4$$. Consequently,

$$
0\le f(x)\le2.
$$

This proves that **no output lies outside** $$[0,2]$$. It does not yet prove that every number inside that interval occurs.

For the other direction, take any $$y\in[0,2]$$ and choose

$$
x=\sqrt{4-y^2}.
$$

This input belongs to $$[0,2]\subseteq D$$, and

$$
f(x)=\sqrt{4-(4-y^2)}=\sqrt{y^2}=y.
$$

The last equality uses $$y\ge0$$. Thus **every claimed output is attained**, and $$f(D)=[0,2]$$.

**Range arguments need attainable values.** A bound narrows the possibilities; producing an allowed input for each claimed output completes the argument.

## One function, several representations

The **graph** of $$f:D\to\mathbb R$$ is the set

$$
\{(x,f(x)):x\in D\}.
$$

Our function's graph is the **upper semicircle** of radius $$2$$ centered at the origin. It includes both endpoints because $$-2$$ and $$2$$ belong to the domain.

<figure>
  <img src="{{ '/assets/images/calculus-i-functions-semicircle.svg' | relative_url }}" alt="The graph of y equals the square root of four minus x squared is the upper semicircle from the included point minus two, zero, through zero, two, to the included point two, zero. Its domain is minus two to two and its range is zero to two, with all endpoints included." width="600" height="300">
  <figcaption>The horizontal coordinates give the domain; the vertical coordinates give the range. The algebra above proves the exact sets represented by the picture.</figcaption>
</figure>

A graph of a function with stated domain $$D$$ contains **exactly one point with horizontal coordinate $$x$$** for every $$x\in D$$. Two points with the same horizontal coordinate and different vertical coordinates would assign two outputs to one input.

The equation $$x^2+y^2=4$$ describes the **whole circle**, which is not the graph of a real-valued function of $$x$$ on $$[-2,2]$$: when $$x=0$$, it permits both $$y=2$$ and $$y=-2$$. The formula $$y=\sqrt{4-x^2}$$ selects the nonnegative output.

A table gives another view:

| Input $$x$$ | Output $$f(x)$$ |
| --- | --- |
| $$-2$$ | $$0$$ |
| $$-1$$ | $$\sqrt3$$ |
| $$0$$ | $$2$$ |
| $$1$$ | $$\sqrt3$$ |
| $$2$$ | $$0$$ |

For this function, the table lists **selected values**, not every input in the interval. Those five values alone do not determine the function between the listed inputs. If a function instead has an explicitly stated finite domain and the table supplies exactly one output for every input in that domain, the table can specify the entire function.

## Exercises — review what you have learned

Attempt each exercise before opening its solution. Give a reason for your domain or range claim.

**E1. Allowed inputs.** Find the natural real domain of

$$
g(x)=\frac{\sqrt{x+1}}{x-2}.
$$

Is $$g(-1)$$ defined? Is $$g(2)$$ defined?

<details markdown="1">
<summary>Solution to E1</summary>

We need $$x+1\ge0$$ and $$x-2\ne0$$. The domain is

$$
[-1,2)\cup(2,\infty).
$$

The value $$g(-1)=0$$ is defined. The value $$g(2)$$ is undefined because its denominator would be zero.

</details>

**E2. A stated domain changes the range.** Let $$q:(-2,1]\to\mathbb R$$ be given by $$q(x)=x^2$$. Find its range. Explain whether the lower and upper endpoints of your proposed range are included.

<details markdown="1">
<summary>Solution to E2</summary>

For every allowed input, $$0\le x^2<4$$, so the range is contained in $$[0,4)$$. Conversely, for any $$y\in[0,4)$$, the input $$x=-\sqrt y$$ belongs to $$(-2,0]\subseteq(-2,1]$$ and satisfies $$q(x)=y$$. Therefore the range is exactly $$[0,4)$$.

The lower endpoint is attained at $$x=0$$. The upper endpoint is not attained: the only real inputs whose square is $$4$$ are $$-2$$ and $$2$$, and neither is allowed.

</details>

**E3. Repeated outputs and missing inputs.** A function $$p$$ has domain $$\{0,1,2\}$$ and values $$p(0)=2$$, $$p(1)=0$$, and $$p(2)=2$$. Find its range and describe its graph. Does the repeated output $$2$$ violate the definition of a function? Does this table tell us a value of $$p(3)$$?

<details markdown="1">
<summary>Solution to E3</summary>

The range is $$\{0,2\}$$. The graph consists of the three points $$(0,2)$$, $$(1,0)$$, and $$(2,2)$$; it contains no connecting segments. Repeated outputs are permitted because each input still has exactly one output. The function has no value at $$3$$, since $$3$$ is outside its stated domain.

</details>

**E4. The same domain and range.** Let $$u,v:\mathbb R\to\mathbb R$$ be given by $$u(x)=x$$ and $$v(x)=-x$$. Prove that they have the same range. Are they equal as functions? If not, give one input whose outputs settle the question.

<details markdown="1">
<summary>Solution to E4</summary>

Both have range $$\mathbb R$$. Every output is real, and every $$y\in\mathbb R$$ is attained: $$u(y)=y$$ and $$v(-y)=y$$.

They are not equal as functions because $$u(1)=1$$ while $$v(1)=-1$$. The same domain and range do not determine **which output belongs to each input**.

</details>

## Checkpoint

Explain the difference between **domain**, **codomain**, and **range**. Then explain why a graph, a finite table of selected values, and a formula without a stated domain may each leave different information to be checked.

The next lesson studies how function values behave **near an input**. Keeping the domain and the value at that input distinct will matter there.
