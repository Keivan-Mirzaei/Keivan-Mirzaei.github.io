# Lesson 1 — Functions, domains, and representations

## Central task and learning objectives

**Central task:** determine exactly what a function is before using it in calculus. The reader should already know algebra, square roots, coordinates, and interval notation. No limit, derivative, or continuity result is used.

By the end of the lesson, the reader should be able to:

1. Specify a real-valued function by its domain and its assignment rule.
2. Distinguish an explicitly stated domain from the natural real domain of an expression.
3. Prove an exact range by excluding impossible outputs and producing every claimed output.
4. Interpret a formula, graph, and table without assuming information they do not supply.

These objectives specialize the domain, range, notation, and representation objectives in [OpenStax Section 1.1](https://openstax.org/books/calculus-volume-1/pages/1-1-review-of-functions). Composition, inverse functions, and a broad catalogue of elementary functions are already course prerequisites; bring them back where a later lesson actually needs them, rather than repeat that entire prerequisite course here.

## Mathematical dependency order

Real numbers and subsets → the input-output machine intuition → a domain and a single-valued assignment → function notation and the range → the natural domain of an expression → equality of functions and the rational-function comparison → proof of an exact range → the graph and table as representations.

The domain is defined before discussing equality of functions. The range proof uses a constructed preimage, so it does not assume the Intermediate Value Theorem before that theorem is taught. Graphs are illustrations of sets proved algebraically; selected table entries do not establish the behavior between sampled inputs.

## Purpose of each element

| Element | Purpose | Evidence or constraint |
| --- | --- | --- |
| Function-machine intuition and activity | Make an input, a function rule, and its result visible in one simple row. | Use only log(1−x²); its natural real domain is (−1,1). Outside that interval, show undefined. |
| Definition of a real-valued function | Fix the allowed inputs, target, and uniqueness of the output. | Use `f:D→R`; distinguish codomain R from the attained range f(D). |
| Natural-domain convention | Prevent illegal evaluation and changes of domain through simplification. | State restrictions before manipulating expressions. |
| Equality of functions | Distinguish the same assignment on the same domain from agreement on a subset. | All functions in this lesson have codomain R. |
| Keivan's rational-function example | Show why cancellation preserves an original restriction instead of adding an input. | Compare (1−x²)/(1−x) and 1+x; at x=1 the first is undefined and the second is 2. |
| Worked upper-semicircle example | Establish the two directions needed for an exact range. | Show every output is in [0,2] and construct an allowed input for every y in [0,2]. |
| Static graph | Connect an exact set of inputs and outputs to coordinates and included endpoints. | The arc represents the formula exactly; no sampled polyline is used. |
| Whole-circle comparison | Explain the uniqueness requirement for a function of x. | At x=0 the whole circle has two y-values. |
| Selected-values table | Show repeated outputs and the limitations of finite sampling. | Its five inputs do not exhaust the interval domain. |
| Exercise E1 | Review simultaneous radical and denominator restrictions. | Include an allowed zero of the numerator and an excluded zero of the denominator. |
| Exercise E2 | Review exact range reasoning with a restricted, partly open domain. | A bound alone is not a complete solution; endpoints must be checked. |
| Exercise E3 | Review uniqueness, repeated outputs, and a fully specified finite domain. | The graph consists of isolated points, not connecting segments. |
| Exercise E4 | Check the assignment condition in equality of functions, beyond the domain condition shown in the example. | The functions x↦x and x↦−x have the same domain and range but differ at x=1. |
| Challenging problem set, awaiting arrangement | Require the reader to choose an argument or analyze parameter cases. | The hardest statements stay visible; hints and solutions can be collapsed. |
| Checkpoint | Retrieve the distinctions needed before studying nearby behavior. | Explain domain, codomain, range, and the information supplied by each representation. |

**The machine interaction has one task:** try an allowed input and an excluded input for log(1−x²). Its visible structure is only input → function → result in three aligned boxes without labels. The result updates directly when the input changes. Exact arithmetic preserves the distinction between a decimal near an endpoint and the endpoint itself. Nonzero logarithmic results show the first three decimal places followed by an ellipsis, without an approximation sign; log(1)=0 is exact. The initial diagram shows input 0 and output 0 even without JavaScript. The logarithm's positive-argument requirement establishes the domain (−1,1). The semicircle remains a static graph because its current task needs no additional control.

## Agreed intuition and motivating example

Keivan requested a simple visible machine with one function, log(1−x²), and chose the natural logarithm. The activity has three aligned boxes containing the editable input, the rule, and the result, joined by arrows, with no visible labels or decorative icons. An allowed input produces its assigned output; an excluded input produces an undefined error message. The explanation states explicitly that this message is not a numerical output and is not part of the range.

Let

\[
F(x)=\frac{1-x^2}{1-x},\qquad G(x)=1+x,
\]

each on its natural real domain. Ask: **Are F and G the same function?**

For x≠1, factoring shows F(x)=G(x). Their domains differ: F has domain R\{1}, while G has domain R. In particular, G(1)=2 and F(1) is undefined. Therefore they are not equal as functions. Their graphs differ by the point (1,2), and their ranges are respectively R\{2} and R.

**Purpose:** connect the machine intuition to domain-aware simplification and later removable discontinuities. No limit notation is needed. The student-facing example focuses on cancellation and the excluded input; exact range reasoning is introduced with the subsequent semicircle example. Exercise E4 now tests whether the same domain and range determine the same assignment, avoiding a second example with only different domains.

## A solved candidate for the most challenging problem

This candidate is prepared for review; the final number and arrangement of Problems await Keivan's choice.

**Parameter challenge.** For each real a, determine the natural real domain and exact range of

\[
H_a(x)=\frac{\sqrt{x^2-2ax+1}}{x-a}.
\]

Give a proof covering every value of a. A drawing alone does not establish the range.

**Purpose:** combine domain restrictions, completion of the square, parameter cases, signs, and constructive range reasoning. It uses the lesson's ideas and prerequisite algebra, without derivatives or limits.

**Hint.** Put t=x−a and c=1−a². Then H_a(x)=√(t²+c)/t where defined. Account for the sign of t before recovering a value from a squared equation.

**Solution.** Write

\[
x^2-2ax+1=(x-a)^2+1-a^2=t^2+c.
\]

The domain requires t²+c≥0 and t≠0. On that domain,

\[
H_a(x)^2=1+\frac{c}{t^2}.
\]

If **|a|<1**, then c>0. Every t≠0 is allowed, so the domain is R\{a}. The numerator is positive and |H_a(x)|>1; the sign of H_a(x) is the sign of t. Conversely, for every y with |y|>1, choose

\[
t=\operatorname{sgn}(y)\sqrt{\frac{c}{y^2-1}},\qquad x=a+t.
\]

Here sgn(y) means 1 for positive y and −1 for negative y; it is used only when y≠0. This is an allowed input. The squared output is y² and its sign is the sign of y, so its output is y. The range is (−∞,−1)∪(1,∞).

If **|a|=1**, then c=0. The domain is R\{a}, and H_a(x)=|t|/t, so its range is {−1,1}. Both signs are attained.

If **|a|>1**, put d=a²−1>0. The allowed inputs satisfy |t|≥√d, so the domain is

\[
(-\infty,a-\sqrt d]\cup[a+\sqrt d,\infty).
\]

The denominator is automatically nonzero. We have 0≤H_a(x)²<1, and zero is attained when t=±√d. For any y with 0<|y|<1, choose

\[
t=\operatorname{sgn}(y)\sqrt{\frac{d}{1-y^2}},\qquad x=a+t.
\]

Then |t|>√d, and the output has squared magnitude y² and sign equal to the sign of y. Thus it equals y. Together with the attained output zero, this proves that the range is (−1,1).

The changes in the range arise from the sign of 1−a², not from an unexplained graphical impression.

## Current review status

Keivan authorized publication of the chapter overview and Lesson 1 after reviewing the function-machine design. The lesson includes the agreed machine intuition and rational-function example, four solved review Exercises, the range proof, the static graph, and the checkpoint. Companion reading is removed, and the original-writing requirement is recorded in the course procedure. The candidate challenging problem remains in this authoring plan for a later addition once its arrangement is selected.

The epsilon–delta proof choice applies when the limits lessons are developed. The DNE convention and the choice of a longer course title are still unsettled; neither is needed for this lesson's mathematical core.
