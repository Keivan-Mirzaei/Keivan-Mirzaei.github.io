---
title: "A set that shifts into its complement"
description: "Can arbitrarily small translations turn a subset of the real line into its complement?"
format: problem
difficulty: 3
tags: [real analysis, linear algebra, set theory]
math: true
---

For a set $$S\subseteq\mathbb R$$ and a real number $$a$$, write

$$
S+a=\{s+a:s\in S\}.
$$

Does there exist a set $$S\subseteq\mathbb R$$ such that

$$
\inf\{a>0:S+a=\mathbb R\setminus S\}=0?
$$

In other words, can a set become its complement under arbitrarily small positive translations?

The solution uses vector spaces over $$\mathbb Q$$ and the axiom of choice.

<!-- hint -->

Choose positive numbers $$a_n\to0$$ that are linearly independent over $$\mathbb Q$$, and extend them to a basis. Adding $$a_n$$ then increases just one coordinate by $$1$$. Use $$\lfloor q+1\rfloor=\lfloor q\rfloor+1$$ to reverse a parity.

<!-- solution -->

Yes. The idea is to give every real number a parity that flips when any one of a sequence of small translations is applied.

Let $$a_n=e^{-n}$$ for $$n\geq1$$. These numbers are linearly independent over $$\mathbb Q$$: a nontrivial relation

$$
\sum_{n=1}^{N}c_ne^{-n}=0,
\qquad c_n\in\mathbb Q,
$$

would, after multiplication by $$e^N$$, give a nonzero polynomial with rational coefficients vanishing at $$e$$. This contradicts the transcendence of $$e$$.

Extend $$A=\{a_1,a_2,\ldots\}$$ to a Hamel basis $$H$$ of $$\mathbb R$$ over $$\mathbb Q$$. This is the step that uses the axiom of choice, through Zorn's lemma. Every real number has a unique expansion

$$
x=\sum_{h\in H}q_h(x)h,
\qquad q_h(x)\in\mathbb Q,
$$

with only finitely many nonzero coefficients. Define the integer

$$
p(x)=\sum_{n=1}^{\infty}\lfloor q_{a_n}(x)\rfloor
$$

and put

$$
S=\{x\in\mathbb R:p(x)\text{ is even}\}.
$$

The sum defining $$p(x)$$ is finite for each $$x$$, since all but finitely many coordinates are zero.

Adding $$a_n$$ increases $$q_{a_n}(x)$$ by $$1$$ and leaves every other coordinate unchanged. Consequently,

$$
p(x+a_n)=p(x)+1.
$$

Thus $$x\in S$$ if and only if $$x+a_n\notin S$$. This gives both inclusions in $$S+a_n=\mathbb R\setminus S$$: a point of $$S$$ translates outside $$S$$, and every point $$y\notin S$$ has $$y-a_n\in S$$.

Since $$a_n>0$$ and $$a_n\to0$$, the required infimum is zero.

The same construction works for any positive sequence tending to zero that is linearly independent over $$\mathbb Q$$.

I encountered this problem as Problem 1.32 in Piotr Biler and Alfred Witkowski's *Problems in Mathematical Analysis* (1990). I [posted the question on Math StackExchange](https://math.stackexchange.com/q/785005) in 2014 and added this construction in 2016.

<!-- extension -->

**Could such a set be Lebesgue measurable?**

No. Suppose $$S$$ were measurable and $$S+a_n=\mathbb R\setminus S$$ for some positive sequence $$a_n\to0$$. Write $$m$$ for Lebesgue measure. The set $$S$$ cannot have measure zero: translation invariance would make its complement null as well.

By the Lebesgue density theorem, there is a bounded interval $$I$$ such that, for $$E=S\cap I$$,

$$
m(E)>\frac34m(I).
$$

Choose $$n$$ with $$a_n<\frac12m(I)$$. The sets $$E$$ and $$E+a_n$$ are disjoint, since one lies in $$S$$ and the other in its complement. Their union lies in $$I\cup(I+a_n)$$, so

$$
\begin{aligned}
\frac32m(I)&<2m(E)\\
&=m\bigl(E\cup(E+a_n)\bigr)\\
&\leq m(I)+a_n\\
&<\frac32m(I),
\end{aligned}
$$

a contradiction. Nonmeasurability is forced by the problem itself.
