---
layout: learning-topic
title: "Related rates"
permalink: /learning/calculus/applications-of-derivatives/related-rates/
course_key: calculus
module_key: applications-of-derivatives
position: "4.2"
description: "Turn a changing geometric relationship into an equation connecting rates, with time, signs and units kept explicit."
math: true
sitemap: false
topic_script: /assets/js/learning-applications.js
exercises:
  - text: "A sphere expands with \\(dr/dt=2\\,\\mathrm{cm/s}\\). At \\(r=3\\,\\mathrm{cm}\\), what is \\(dV/dt\\)?"
    options: ["\\(24\\pi\\,\\mathrm{cm^3/s}\\)", "\\(72\\pi\\,\\mathrm{cm^3/s}\\)", "\\(36\\pi\\,\\mathrm{cm^2/s}\\)"]
    correct: 1
    why: "Use \\(dV/dt=4\\pi r^2\\,dr/dt=4\\pi(9)(2)=72\\pi\\). Volume rate has cubic length units per time."
  - text: "A \\(5\\,\\mathrm{m}\\) ladder stays against a wall. Its foot is \\(4\\,\\mathrm{m}\\) from the wall and moves outward at \\(0.3\\,\\mathrm{m/s}\\). What is the rate of change of the top's height?"
    options: ["\\(-0.225\\,\\mathrm{m/s}\\)", "\\(-0.4\\,\\mathrm{m/s}\\)", "\\(0.4\\,\\mathrm{m/s}\\)", "\\(-0.3\\,\\mathrm{m/s}\\)"]
    correct: 1
    why: "The geometry gives \\(y=\\sqrt{25-16}=3\\,\\mathrm{m}\\). Then \\(\\frac{dy}{dt}=-\\frac43(0.3)=-0.4\\,\\mathrm{m/s}\\). The negative sign indicates downward motion."
  - text: "A rectangle has \\(A=xy\\), with both sides changing. Which time derivative is correct?"
    options: ["\\(dA/dt=(dx/dt)(dy/dt)\\)", "\\(dA/dt=x\\,dy/dt+y\\,dx/dt\\)", "\\(dA/dt=x+y\\)"]
    correct: 1
    why: "The product rule is needed because both factors depend on time."
  - text: "Water in a conical tank satisfies \\(r=h/3\\), and the volume inflow stays constant. When the water depth \\(h\\) doubles, what happens to \\(dh/dt\\)?"
    options: ["It is halved", "It stays the same", "It doubles", "It becomes one quarter as large"]
    correct: 3
    why: "Here \\(\\frac{dV}{dt}=\\frac{\\pi h^2}{9}\\frac{dh}{dt}\\). With \\(dV/dt\\) fixed, multiplying \\(h^2\\) by \\(4\\) divides \\(dh/dt\\) by \\(4\\)."
  - text: "A person \\(2\\,\\mathrm{m}\\) tall walks away from a \\(6\\,\\mathrm{m}\\) lamp at \\(1.2\\,\\mathrm{m/s}\\). How fast does the shadow tip move away from the lamp?"
    options: ["\\(0.6\\,\\mathrm{m/s}\\)", "\\(1.2\\,\\mathrm{m/s}\\)", "\\(1.8\\,\\mathrm{m/s}\\)", "\\(2.4\\,\\mathrm{m/s}\\)"]
    correct: 2
    why: "Similar triangles give \\(s=x/2\\), so the shadow length grows at \\(0.6\\,\\mathrm{m/s}\\). The tip is \\(x+s\\) from the lamp, and its rate is \\(1.2+0.6=1.8\\,\\mathrm{m/s}\\)."
  - text: "Two cyclists move away from a junction along perpendicular paths. Their distances from the junction are \\(3\\,\\mathrm{m}\\) and \\(4\\,\\mathrm{m}\\), increasing at \\(4\\,\\mathrm{m/s}\\) and \\(3\\,\\mathrm{m/s}\\), respectively. How fast is their separation increasing?"
    options: ["\\(4.8\\,\\mathrm{m/s}\\)", "\\(5\\,\\mathrm{m/s}\\)", "\\(7\\,\\mathrm{m/s}\\)", "\\(24\\,\\mathrm{m/s}\\)"]
    correct: 0
    why: "Let \\(x,y\\) be the two distances and \\(z\\) the separation. Differentiating \\(z^2=x^2+y^2\\) gives \\(\\frac{dz}{dt}=\\frac{x}{z}\\frac{dx}{dt}+\\frac{y}{z}\\frac{dy}{dt}\\). Here \\(z=5\\,\\mathrm{m}\\), so \\(\\frac35(4)+\\frac45(3)=4.8\\,\\mathrm{m/s}\\)."
---

<!-- Prerequisites: Chain rule, implicit differentiation, Pythagorean theorem, similar triangles. Established here: Related-rate workflow; constraints valid over time; interpretation of signed rates. -->

## One equation, several moving quantities

A ladder slides down a wall. The ladder length stays fixed, while its horizontal and vertical reaches change together. Knowing how fast one end moves lets us find the rate of the other end because the geometry constrains both.

In a **related-rates problem**, quantities depend on a common variable, usually time. We first connect the quantities, then differentiate that relationship to connect their rates.

<section class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Differentiate with respect to time</h3>

If $$x=x(t)$$, the chain rule gives

$$\frac{d}{dt}(x^2)=2x\frac{dx}{dt}.$$

The symbol $$x$$ may denote a length, but it still represents a time-dependent function. By contrast, a length fixed throughout the motion has time derivative zero.

</section>

## Follow the ladder

Let a $$5\text{ m}$$ ladder have its foot $$x(t)$$ metres from a wall and its top at height $$y(t)$$ metres. We model the ladder as a rigid segment with both ends staying in contact with the wall and floor. Then

$$x^2+y^2=25,\qquad x>0,\quad y>0.$$

Differentiate before inserting the values at a particular instant:

$$2x\frac{dx}{dt}+2y\frac{dy}{dt}=0,$$

$$\frac{dy}{dt}=-\frac{x}{y}\frac{dx}{dt}.$$

<div class="topic-widget applications-widget" data-applications="ladder">
<figure class="applications-plot">
<svg viewBox="0 0 640 360" role="group" aria-label="A ladder sliding against a wall"><title>A ladder sliding against a wall</title><desc>A fixed five-metre ladder connects a point on the floor to a point on the wall. As its foot moves away, the top moves down.</desc><image data-applications-fallback href="{{ '/assets/figures/learning/applications-ladder.svg' | relative_url }}" width="640" height="360"/></svg>
</figure>
<div class="applications-controls" hidden></div>
<div class="widget-readouts applications-values" hidden></div>
<p class="widget-instruction" markdown="span">Drag the foot, or focus it and use the arrow keys. Its outward speed is $$0.4\,\mathrm{m/s}$$. Watch how the top’s downward rate changes even though the foot’s speed is fixed.</p>
</div>

The factor $$x/y$$ depends on the configuration. Near the wall it is small; near the floor it is large. Equal changes of the foot do not produce equal changes of the top.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Evaluate a rate at one instant</h3>

The foot moves away at $$dx/dt=0.4\text{ m/s}$$. At $$x=3\text{ m}$$, the geometry gives $$y=\sqrt{25-9}=4\text{ m}$$. Therefore

$$\frac{dy}{dt}=-\frac34(0.4)=-0.3\text{ m/s}.$$

The signed rate is negative because height decreases. The *speed* of the top is the positive magnitude $$0.3\text{ m/s}$$.

</section>

<details class="disclosure" id="ladder-model-limits" markdown="1">
<summary>Extra reading: could the top move faster than light?</summary>

The formula predicts it! If the foot keeps moving outward at a fixed speed $$u>0$$, then

$$\left\lvert\frac{dy}{dt}\right\rvert=\frac{x}{y}u\longrightarrow\infty
\qquad\text{as }y\to0^+.$$

The unbounded speed signals a limit of the model. A real ladder cannot remain rigid, keep both contacts and maintain a fixed foot speed all the way to horizontal. An object with mass cannot be accelerated to light speed.

If the top's downward speed instead stays finite near the floor, the same geometric relationship requires

$$\frac{dx}{dt}=-\frac{y}{x}\frac{dy}{dt}\longrightarrow0.$$

The foot must slow down as the ladder becomes horizontal. At $$y=0$$ itself, the formula that divides by $$y$$ is undefined.

</details>

## A method that survives a new context

1. Define each changing quantity and choose a direction for positive motion.
2. Write an equation valid over the motion, not just at one instant.
3. Remove extra variables with geometric constraints if useful.
4. Differentiate with respect to the common time variable.
5. Substitute the instantaneous data, solve, and interpret units and sign.

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Filling a cone</h3>

A cone has height $$6\text{ m}$$ and top radius $$2\text{ m}$$. Water enters at $$0.5\text{ m}^3/\text{min}$$. Find the height rate when the water is $$3\text{ m}$$ deep.

Let $$r$$ be the water-surface radius and $$h$$ its depth.

<figure class="topic-figure" id="cone-cross-section">
<img src="{{ '/assets/figures/learning/applications-cone.svg' | relative_url }}" width="640" height="400" alt="A vertical cross-section of a conical tank, six metres high with top radius two metres. Water at half the tank height forms a smaller similar triangle, with depth h and surface radius r measured from the same vertex. A downward arrow shows the inflow." loading="lazy">
<figcaption markdown="span">The water is shown at $$h=3\,\mathrm{m}$$. The water and tank share a vertex and side angle, so their radius-to-height ratios agree.</figcaption>
</figure>

Similar triangles give $$r/h=2/6$$, so $$r=h/3$$. Substitute this relation into the volume before differentiating:

$$V=\frac13\pi r^2h=\frac{\pi h^3}{27}.$$

Hence

$$\begin{aligned}
\frac{dV}{dt}&=\frac{\pi h^2}{9}\frac{dh}{dt},\\
\frac{dh}{dt}&=\frac9{\pi h^2}\frac{dV}{dt}.
\end{aligned}$$

At $$h=3$$ this is $$1/(2\pi)\text{ m/min}$$, about $$0.159\text{ m/min}$$. A constant volume inflow produces a decreasing height rate as the water surface widens.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A shadow has two possible rates</h3>

A $$2\text{ m}$$ tall person walks away from a $$6\text{ m}$$ lamp at $$1.5\text{ m/s}$$. Let $$x$$ be the person's distance from the lamp and $$s$$ the shadow length.

<figure class="topic-figure" id="shadow-distances">
<img src="{{ '/assets/figures/learning/applications-shadow.svg' | relative_url }}" width="640" height="445" alt="A six-metre lamp and two-metre person form similar right triangles with the shadow tip. Distance x runs from lamp to person, s from person to shadow tip, and x plus s from lamp to shadow tip. The person walks right at 1.5 metres per second." loading="lazy">
<figcaption markdown="span">The same light ray forms both triangles. The shadow has length $$s$$, while its tip lies $$x+s$$ from the lamp.</figcaption>
</figure>

Similar triangles give

$$\frac6{x+s}=\frac2s\quad\Longrightarrow\quad s=\frac{x}{2}.$$

Thus $$ds/dt=(1/2)(dx/dt)=0.75\text{ m/s}$$: this is the rate at which the *shadow length* grows. The tip is $$x+s$$ from the lamp, so it moves at $$1.5+0.75=2.25\text{ m/s}$$ relative to the ground. The question's reference point matters.

</section>
<section class="warning" markdown="1">
<p class="element-label">Warning</p>

Do not replace a changing length by its instantaneous value before differentiating: $$x=3$$ at one instant does not imply $$dx/dt=0$$. Also convert rates to a common time unit before combining them.

</section>
