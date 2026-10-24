---
layout: learning-topic
title: "Limit laws and algebraic methods"
permalink: /learning/calculus/limits-and-continuity/limit-laws/
course_key: calculus
module_key: limits-and-continuity
position: "1.2"
description: Combine limits you know, then rewrite expressions that resist substitution.
epigraph:
  text: "Mathematics is the art of giving the same name to different things."
  author: "Henri Poincaré"
  source: "Science and Method, The Future of Mathematics"
  source_url: "https://mathshistory.st-andrews.ac.uk/Extras/Poincare_Future/"
math: true
sitemap: false
exercises:
  - text: 'As \(x\to a\), suppose \(f(x)\to-2\) and \(g(x)\to3\). What is \(\displaystyle\lim_{x\to a}\frac{f(x)^2+g(x)}{g(x)-1}\)?'
    options: ['\(1/2\)', '\(7/2\)', '\(-1/2\)', 'The laws do not apply']
    correct: 1
    why: 'The denominator approaches \(2\ne0\), so the quotient law applies: \(((-2)^2+3)/(3-1)=7/2\).'
  - text: 'A square plate has side length \(3+h\). What is \(\displaystyle\lim_{h\to0}\frac{(3+h)^2-9}{h}\), the limiting change in area per change in side length?'
    options: ['\(3\)', '\(9\)', '\(6\)', '\(0\)']
    correct: 2
    why: 'Expand the numerator to \(6h+h^2\). For \(h\ne0\), the quotient is \(6+h\), so its limit is \(6\). Both dimensions of the square change.'
  - text: 'In \(\displaystyle\lim_{x\to0}\frac{\sqrt{4+x}-2}{x}\), which expression equals the quotient for nearby \(x\ne0\)?'
    options: ['\(\sqrt{4+x}+2\)', '\(1/\sqrt{4+x}\)', '\(1/(\sqrt{4+x}-2)\)', '\(1/(\sqrt{4+x}+2)\)']
    correct: 3
    why: 'Multiplying by the conjugate makes the numerator \((4+x)-4=x\), which cancels the denominator. The rewritten limit is \(1/4\).'
  - text: 'Suppose \(f(x)\to0\) and \(g(x)\to0\) as \(x\to0\). Which claim about \(f(x)/g(x)\) is justified by these facts alone?'
    options: ['Its limit is \(1\)', 'They do not determine the quotient limit', 'Its limit is \(0\)', 'It cannot have a finite limit']
    correct: 1
    why: 'The quotient law requires a nonzero denominator limit. Taking \(f(x)=cx\), \(g(x)=x\) gives any chosen finite limit \(c\); taking \(f(x)=\lvert x\rvert\), \(g(x)=x\) gives no two-sided limit.'
  - text: 'A calibration rule is \(C(t)=\frac{t^2-25}{t-5}\) for \(t<5\), and \(C(t)=b-t\) for \(t>5\). Which \(b\) makes \(\displaystyle\lim_{t\to5}C(t)\) exist?'
    options: ['\(5\)', '\(10\)', '\(15\)', '\(25\)']
    correct: 2
    why: 'The left branch equals \(t+5\) for \(t\ne5\), giving left limit \(10\). The right limit is \(b-5\); equality requires \(b=15\). No assigned value at \(t=5\) is needed for the limit.'
  - text: 'For \(x\ne3\), a function equals \(\frac{x^2-2x-3}{x-3}\), but its assigned value is \(F(3)=-100\). Find \(\displaystyle\lim_{x\to3}(F(x)-4)\).'
    options: ['\(0\)', '\(-104\)', '\(4\)', 'The limit does not exist']
    correct: 0
    why: 'Away from \(3\), factor to get \(F(x)=x+1\). Thus \(\lim_{x\to3}(F(x)-4)=\lim_{x\to3}(x-3)=0\). The isolated value \(F(3)\) does not affect this limit.'
---

## The idea

**Limit laws** let us calculate with *approached values*. Start with substitution. When the relevant laws apply, it gives the limit; when substitution produces $$0/0$$, look for an equivalent expression at nearby inputs.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Limit laws</h3>

Suppose $$\lim_{x\to a}f(x)=L$$ and $$\lim_{x\to a}g(x)=M$$ are finite, and $$c$$ is constant. Then

$$\begin{aligned}
\lim_{x\to a}(f(x)\pm g(x))&=L\pm M,\\
\lim_{x\to a}c f(x)&=cL,\\
\lim_{x\to a}f(x)g(x)&=LM,\\
\lim_{x\to a}\frac{f(x)}{g(x)}&=\frac{L}{M},\qquad M\ne0.
\end{aligned}$$

For integers $$n\ge2$$, the **root law** is

$$\lim_{x\to a}\sqrt[n]{f(x)}=\sqrt[n]{L}.$$

For even roots, require $$f(x)\ge0$$ near the point and $$L\ge0$$. These laws also apply to one-sided limits on the relevant side.

</section>


<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Check the denominator first</h3>

$$\lim_{x\to-1}\frac{2x^2+3}{x+4}
=\frac{2(-1)^2+3}{-1+4}=\frac53.$$

The denominator approaches $$3\ne0$$, so the quotient law applies.

</section>

## Rewriting near the point

<aside class="definition" markdown="1">
<p class="element-label">Principle</p>
<h3>Equal nearby expressions have the same limit</h3>

If $$f(x)=g(x)$$ for every input sufficiently close to $$a$$ except possibly $$a$$ itself, <mark>they have the same limit whenever either limit exists.</mark> Their values at $$a$$ may differ or be missing.

</aside>

For the graph below, factoring gives

$$q(x)=\frac{x^3-8}{x-2}=x^2+2x+4=p(x),\qquad x\ne2.$$

<figure class="topic-figure">
<div class="algebra-comparison">
<div class="comparison-plot">
<svg viewBox="0 0 320 290" role="img" aria-label="Quotient graph with a hole at (2,12)">
<path d="M45 250H300M45 250V25" fill="none" stroke="#c9d1c6"/>
<path class="axis-ticks" d="M185 247V253M42 142H48" fill="none" stroke="#9eac96" stroke-width="1"/>
<path d="M45 142H185V250" fill="none" stroke="#c4cebf" stroke-dasharray="4 5"/>
<path d="M45.00 214.00 L46.75 213.54 L48.50 213.08 L50.25 212.60 L52.00 212.11 L53.75 211.61 L55.50 211.10 L57.25 210.57 L59.00 210.04 L60.75 209.49 L62.50 208.94 L64.25 208.37 L66.00 207.79 L67.75 207.20 L69.50 206.60 L71.25 205.98 L73.00 205.36 L74.75 204.72 L76.50 204.08 L78.25 203.42 L80.00 202.75 L81.75 202.07 L83.50 201.38 L85.25 200.67 L87.00 199.96 L88.75 199.23 L90.50 198.50 L92.25 197.75 L94.00 196.99 L95.75 196.22 L97.50 195.44 L99.25 194.64 L101.00 193.84 L102.75 193.02 L104.50 192.20 L106.25 191.36 L108.00 190.51 L109.75 189.65 L111.50 188.78 L113.25 187.89 L115.00 187.00 L116.75 186.09 L118.50 185.18 L120.25 184.25 L122.00 183.31 L123.75 182.36 L125.50 181.40 L127.25 180.42 L129.00 179.44 L130.75 178.44 L132.50 177.44 L134.25 176.42 L136.00 175.39 L137.75 174.35 L139.50 173.30 L141.25 172.23 L143.00 171.16 L144.75 170.07 L146.50 168.98 L148.25 167.87 L150.00 166.75 L151.75 165.62 L153.50 164.48 L155.25 163.32 L157.00 162.16 L158.75 160.98 L160.50 159.80 L162.25 158.60 L164.00 157.39 L165.75 156.17 L167.50 154.94 L169.25 153.69 L171.00 152.44 L172.75 151.17 L174.50 149.90 L176.25 148.61 L178.00 147.31 L179.75 146.00 L181.50 144.68 L183.25 143.34 L185.00 142.00 L186.75 140.64 L188.50 139.28 L190.25 137.90 L192.00 136.51 L193.75 135.11 L195.50 133.70 L197.25 132.27 L199.00 130.84 L200.75 129.39 L202.50 127.94 L204.25 126.47 L206.00 124.99 L207.75 123.50 L209.50 122.00 L211.25 120.48 L213.00 118.96 L214.75 117.42 L216.50 115.88 L218.25 114.32 L220.00 112.75 L221.75 111.17 L223.50 109.58 L225.25 107.97 L227.00 106.36 L228.75 104.73 L230.50 103.10 L232.25 101.45 L234.00 99.79 L235.75 98.12 L237.50 96.44 L239.25 94.74 L241.00 93.04 L242.75 91.32 L244.50 89.60 L246.25 87.86 L248.00 86.11 L249.75 84.35 L251.50 82.58 L253.25 80.79 L255.00 79.00 L256.75 77.19 L258.50 75.38 L260.25 73.55 L262.00 71.71 L263.75 69.86 L265.50 68.00 L267.25 66.12 L269.00 64.24 L270.75 62.34 L272.50 60.44 L274.25 58.52 L276.00 56.59 L277.75 54.65 L279.50 52.70 L281.25 50.73 L283.00 48.76 L284.75 46.77 L286.50 44.78 L288.25 42.77 L290.00 40.75" fill="none" stroke="#285b46" stroke-width="2.6"/>
<circle cx="185" cy="142" r="5.5" fill="#fcfcf9" stroke="#285b46" stroke-width="2"/>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="185" y="273" text-anchor="middle">2</text><text x="33" y="147" text-anchor="end">12</text></g>
<g fill="#282e29" font-family="Georgia,serif" font-size="17" font-style="italic"><text x="304" y="255">x</text><text x="29" y="23">y</text></g>
</svg>
<div class="graph-legend" aria-label="Graph legend"><span class="legend-curve" aria-hidden="true"></span>\(q\)</div>
</div>
<div class="comparison-plot">
<svg viewBox="0 0 320 290" role="img" aria-label="Polynomial graph including the point (2,12)">
<path d="M45 250H300M45 250V25" fill="none" stroke="#c9d1c6"/>
<path class="axis-ticks" d="M185 247V253M42 142H48" fill="none" stroke="#9eac96" stroke-width="1"/>
<path d="M45 142H185V250" fill="none" stroke="#c4cebf" stroke-dasharray="4 5"/>
<path d="M45.00 214.00 L46.75 213.54 L48.50 213.08 L50.25 212.60 L52.00 212.11 L53.75 211.61 L55.50 211.10 L57.25 210.57 L59.00 210.04 L60.75 209.49 L62.50 208.94 L64.25 208.37 L66.00 207.79 L67.75 207.20 L69.50 206.60 L71.25 205.98 L73.00 205.36 L74.75 204.72 L76.50 204.08 L78.25 203.42 L80.00 202.75 L81.75 202.07 L83.50 201.38 L85.25 200.67 L87.00 199.96 L88.75 199.23 L90.50 198.50 L92.25 197.75 L94.00 196.99 L95.75 196.22 L97.50 195.44 L99.25 194.64 L101.00 193.84 L102.75 193.02 L104.50 192.20 L106.25 191.36 L108.00 190.51 L109.75 189.65 L111.50 188.78 L113.25 187.89 L115.00 187.00 L116.75 186.09 L118.50 185.18 L120.25 184.25 L122.00 183.31 L123.75 182.36 L125.50 181.40 L127.25 180.42 L129.00 179.44 L130.75 178.44 L132.50 177.44 L134.25 176.42 L136.00 175.39 L137.75 174.35 L139.50 173.30 L141.25 172.23 L143.00 171.16 L144.75 170.07 L146.50 168.98 L148.25 167.87 L150.00 166.75 L151.75 165.62 L153.50 164.48 L155.25 163.32 L157.00 162.16 L158.75 160.98 L160.50 159.80 L162.25 158.60 L164.00 157.39 L165.75 156.17 L167.50 154.94 L169.25 153.69 L171.00 152.44 L172.75 151.17 L174.50 149.90 L176.25 148.61 L178.00 147.31 L179.75 146.00 L181.50 144.68 L183.25 143.34 L185.00 142.00 L186.75 140.64 L188.50 139.28 L190.25 137.90 L192.00 136.51 L193.75 135.11 L195.50 133.70 L197.25 132.27 L199.00 130.84 L200.75 129.39 L202.50 127.94 L204.25 126.47 L206.00 124.99 L207.75 123.50 L209.50 122.00 L211.25 120.48 L213.00 118.96 L214.75 117.42 L216.50 115.88 L218.25 114.32 L220.00 112.75 L221.75 111.17 L223.50 109.58 L225.25 107.97 L227.00 106.36 L228.75 104.73 L230.50 103.10 L232.25 101.45 L234.00 99.79 L235.75 98.12 L237.50 96.44 L239.25 94.74 L241.00 93.04 L242.75 91.32 L244.50 89.60 L246.25 87.86 L248.00 86.11 L249.75 84.35 L251.50 82.58 L253.25 80.79 L255.00 79.00 L256.75 77.19 L258.50 75.38 L260.25 73.55 L262.00 71.71 L263.75 69.86 L265.50 68.00 L267.25 66.12 L269.00 64.24 L270.75 62.34 L272.50 60.44 L274.25 58.52 L276.00 56.59 L277.75 54.65 L279.50 52.70 L281.25 50.73 L283.00 48.76 L284.75 46.77 L286.50 44.78 L288.25 42.77 L290.00 40.75" fill="none" stroke="#285b46" stroke-width="2.6"/>
<circle cx="185" cy="142" r="5.5" fill="#285b46" stroke="#285b46" stroke-width="2"/>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="185" y="273" text-anchor="middle">2</text><text x="33" y="147" text-anchor="end">12</text></g>
<g fill="#282e29" font-family="Georgia,serif" font-size="17" font-style="italic"><text x="304" y="255">x</text><text x="29" y="23">y</text></g>
</svg>
<div class="graph-legend" aria-label="Graph legend"><span class="legend-curve" aria-hidden="true"></span>\(p\)</div>
</div>
</div>
<figcaption>The graphs agree at every input except \(x=2\), where \(q\) is undefined and \(p(2)=12\). Both limits as \(x\to2\) equal \(12\).</figcaption>
</figure>

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite · algebra</p>
<h3>Conjugate identity</h3>

The difference-of-squares identity gives, for $$A,B\ge0$$,

$$(\sqrt{A}-\sqrt{B})(\sqrt{A}+\sqrt{B})=(\sqrt{A})^2-(\sqrt{B})^2=A-B.$$

The two factors are **conjugates**.

</aside>

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Factor before cancelling</h3>

Substitution in $$\lim_{x\to-2}\frac{x^2+5x+6}{x+2}$$ gives $$0/0$$. For $$x\ne-2$$,

$$\frac{x^2+5x+6}{x+2}=\frac{(x+2)(x+3)}{x+2}=x+3.$$

Therefore,

$$\lim_{x\to-2}\frac{x^2+5x+6}{x+2}=\lim_{x\to-2}(x+3)=1.$$

The cancellation does not assign a value to the original quotient at $$-2$$.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Remove a difference of square roots</h3>

To find $$\lim_{x\to5}\frac{\sqrt{x+4}-3}{x-5}$$, multiply by the conjugate. Near $$5$$, with $$x\ne5$$,

$$\begin{aligned}
\frac{\sqrt{x+4}-3}{x-5}
&=\frac{\sqrt{x+4}-3}{x-5}\cdot\frac{\sqrt{x+4}+3}{\sqrt{x+4}+3}\\
&=\frac{(\sqrt{x+4})^2-3^2}{(x-5)(\sqrt{x+4}+3)}\\
&=\frac{x-5}{(x-5)(\sqrt{x+4}+3)}\\
&=\frac{1}{\sqrt{x+4}+3}.
\end{aligned}$$

Now the denominator approaches a nonzero value:

$$\lim_{x\to5}\frac{\sqrt{x+4}-3}{x-5}
=\lim_{x\to5}\frac{1}{\sqrt{x+4}+3}=\frac16.$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>Combine fractions first</h3>

Find $$\lim_{h\to0}\frac{\frac{1}{2+h}-\frac12}{h}$$. For nearby $$h\ne0$$,

$$\frac{\frac{1}{2+h}-\frac12}{h}
=\frac{2-(2+h)}{2(2+h)h}=-\frac{1}{2(2+h)}.$$

Hence

$$\lim_{h\to0}\frac{\frac{1}{2+h}-\frac12}{h}
=\lim_{h\to0}\left(-\frac{1}{2(2+h)}\right)=-\frac14.$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 5</p>
<h3>Use the expression on each side</h3>

Let $$r(x)=\frac{\lvert x\rvert}{x}$$ for $$x\ne0$$. Recall that $$\lvert x\rvert=-x$$ when $$x<0$$, and $$\lvert x\rvert=x$$ when $$x>0$$. Thus

$$\lim_{x\to0^-}\frac{\lvert x\rvert}{x}=\lim_{x\to0^-}(-1)=-1,\qquad
\lim_{x\to0^+}\frac{\lvert x\rvert}{x}=\lim_{x\to0^+}1=1.$$

The one-sided limits disagree, so the two-sided limit does not exist. Algebraic simplification must respect the side of approach.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

The quotient law cannot divide by a zero limiting denominator. In particular, $$0/0$$ is an **indeterminate form**, not a value: it leaves the limit undecided. Simplify or examine the two sides before drawing a conclusion. A factor may approach zero and still be cancelled at nearby inputs: for example, $$x-5\ne0$$ when $$x\ne5$$, so cancelling it is valid while taking a limit as $$x\to5$$.

</aside>
