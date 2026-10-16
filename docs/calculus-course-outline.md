# Calculus for Engineers and Scientists

Approved outline, 16 October 2026, with the two combinations requested after review. The live hierarchy now follows this structure; existing lesson content is preserved pending a separate content pass.

## Scope and evidence

The supplied tentative schedule covers limits and continuity; differentiation and its applications; integration, areas and improper integrals; Taylor polynomials and power series. Its weekly headings are a scope guide, not a complete prerequisite sequence. The supplied schedule was checked against its retained page rendering.

The [UCalgary description](https://calendar.ucalgary.ca/courses/1627841) also explicitly includes Taylor's theorem and Taylor series. The detailed sequence below is an educational proposal, not a claim about the current instructor's examinable syllabus.

Cross-checks: OpenStax's [limits chapter](https://openstax.org/books/calculus-volume-1/pages/2-introduction), [derivatives chapter](https://openstax.org/books/calculus-volume-1/pages/3-introduction), [integration chapter](https://openstax.org/books/calculus-volume-1/pages/5-introduction), [sequences and series chapter](https://openstax.org/books/calculus-volume-2/pages/5-introduction), and [power series chapter](https://openstax.org/books/calculus-volume-2/pages/6-introduction). These support coverage checks; our organization and lesson content remain original.

## Coverage audit

| Current area | Gap or prerequisite issue | Proposed response |
| --- | --- | --- |
| Limits and continuity | Limit laws, squeeze theorem, standard trigonometric limits, infinite limits, and limits at infinity lack dedicated coverage. Algebraic methods first appear partly in Problems. | Add explicit teaching topics before Problems. Keep introductory graphs in Limits; reserve systematic asymptote treatment for its own topics. |
| Derivative foundations | Rules combines several substantial ideas. Derivative as a function, higher derivatives, and differentiability versus continuity need explicit coverage. | Give chain rule and higher derivatives clear homes; include differentiability in the derivative definition lesson. |
| Elementary derivatives | Exponential differentiation first appears incidentally in Hyperbolic Functions; logarithm differentiation arrives in Logarithmic Differentiation. | Add an exponential/logarithmic derivative lesson before hyperbolic functions and logarithmic differentiation. |
| Inverse functions | General inverse derivatives and inverse trigonometric derivatives share one lesson. | Retain one compact lesson initially; name both in the outline and check branch/domain restrictions. |
| Implicit and logarithmic differentiation | Overall subject grouping is sound. | Retain it; require chain rule and logarithmic derivatives first. |
| Derivative applications | Extreme-value theorem, Rolle's theorem, critical numbers, sign analysis, and concavity are hidden behind broad labels. | Make their homes explicit and place MVT before derivative sign tests. |
| Integral foundations | Antiderivatives, indefinite notation, integration constants, integral properties and basic formulas are missing from the outline. | Add these explicitly; distinguish signed accumulation from geometric area. |
| Integration techniques | No home for selecting a method or checking answers. Scope of the schedule's “inverse trigonometric substitution” is ambiguous. | Include inverse-trig integral patterns and standard trig substitutions; teach method selection in Problems. Do not assume additional techniques are required. |
| Integral applications and improper integrals | Net change, average value and the limit definitions of improper integrals need explicit homes. | Include compact applications; distinguish unbounded intervals from unbounded integrands and treat interior singularities separately. |
| Taylor polynomials and power series | Two headings conceal sequence limits, partial sums, convergence, radius/endpoints, and approximation error. | Split finite Taylor approximation from infinite-series foundations; establish convergence before identifying a function with its series. |
| Problems | Only the first module currently has a Problems submodule. | Every module ends with Problems, using only established calculus tools. |

## Course structure

The numbered lists give the approved order within each module. Each item is a submodule; parenthetical details are lesson scope, not additional pages.

### 1. Limits and continuity
1. Limits (graphical/numerical meaning and one-sided limits)
2. Limit laws and algebraic methods (factoring, cancellation, conjugates, piecewise functions)
3. Squeeze theorem and trigonometric limits
4. Infinite limits, limits at infinity and asymptotes (vertical, horizontal and slant; end behavior)
5. Continuity (continuity rules, endpoints and discontinuity types)
6. Intermediate value theorem
7. Problems

### 2. Derivative foundations
1. Definition and geometry of the derivative (secants, tangent lines, instantaneous rates, differentiability and continuity)
2. Differentiation rules (constants, powers, linear combinations, products and quotients)
3. Chain rule
4. Derivatives as functions and higher derivatives (graphs, notation, velocity and acceleration)
5. Problems

### 3. Derivatives of elementary functions
1. Trigonometric derivatives
2. Inverse functions and inverse trigonometric derivatives
3. Exponential, logarithmic and hyperbolic functions and their derivatives (exponential and logarithmic foundations first; hyperbolic functions last)
4. Problems

### 4. Implicit and logarithmic differentiation
1. Implicit differentiation
2. Logarithmic differentiation
3. Problems

### 5. Applications of derivatives
1. Linear approximation and differentials
2. Related rates
3. Extreme values and critical numbers (extreme-value theorem and closed-interval method)
4. Rolle's theorem and mean value theorem
5. Increasing, decreasing and concavity (first/second derivative tests and inflection points)
6. Indeterminate forms and l'Hopital's rule
7. Curve sketching (domain, intercepts, asymptotes and derivative information)
8. Applied optimization
9. Problems

### 6. Integral foundations
1. Antiderivatives and indefinite integrals (constants and initial conditions)
2. Area and Riemann sums (sigma notation supplied as a prerequisite reminder)
3. Definite integrals and their properties (signed area, bounds, additivity and comparison)
4. Fundamental theorem of calculus: differentiating accumulation
5. Fundamental theorem of calculus: evaluating definite integrals
6. Basic integration formulas (including exponential, logarithmic and inverse-trig patterns)
7. Problems

### 7. Integration techniques
1. Substitution (indefinite and definite, including changing bounds)
2. Integration by parts
3. Trigonometric substitution (radical patterns, domain choices and back-substitution)
4. Problems (method selection and combinations)

### 8. Integral applications and improper integrals
1. Net change and average value (including displacement versus distance)
2. Areas between curves (with respect to either variable)
3. Improper integrals over unbounded intervals
4. Improper integrals with unbounded integrands (split at singularities; convergence and comparison)
5. Problems

### 9. Sequences and power series
1. Sequences and convergence
2. Infinite series and geometric series (partial sums and the necessary term test)
3. Convergence tools for power series (absolute convergence, ratio test, elementary comparison and alternating-series test for endpoints)
4. Power series: radius and interval of convergence (check endpoints separately)
5. Operations on power series (substitution, differentiation and integration within the convergence interval)
6. Problems

### 10. Taylor approximation and Taylor series
1. Taylor and Maclaurin polynomials
2. Taylor's theorem and approximation error (remainder bounds and choosing degree)
3. Taylor and Maclaurin series (representation requires the remainder to tend to zero)
4. Problems

## Prerequisite policy

- Keep precalculus review available on demand through named prerequisite blocks: function notation/domain, composition/inverses, factoring/rationalization, inequalities/absolute value, radians/trig identities, exponential/logarithm laws, and sigma notation. Do not create a compulsory review module.
- Establish limit laws before derivative calculations from the definition. Establish continuity before justifying direct substitution as a general method.
- Establish the standard small-angle limits before any optional proof of trigonometric derivative formulas. Do not prove those limits using derivatives or l'Hopital's rule.
- Chain rule precedes all composite derivative examples, inverse-function arguments, implicit differentiation and logarithmic differentiation.
- Give the exponential derivative an explicit foundation. Its proof must not rely on a logarithm derivative that was itself obtained from that exponential derivative. State any adopted foundational limit/theorem before using it; optional deeper proofs stay collapsed.
- Higher derivatives precede concavity and Taylor polynomials. MVT precedes proofs of monotonicity tests. L'Hopital's rule comes after derivative rules and MVT, never as a prerequisite for their proofs.
- Riemann sums and definite integrals precede FTC; FTC and basic antiderivatives precede definite-integral techniques. Unbounded limits precede improper integrals.
- Series foundations precede power-series convergence and termwise operations. Taylor polynomials require only finite derivatives; the infinite-series representation additionally requires a vanishing remainder.
- Domain restrictions stay visible wherever a rule needs them. For logarithmic differentiation, retain the chosen positive-function treatment.

## Scope boundaries

The missing foundations above are recommended for a coherent standalone course. Net change and average value are modest proposed additions, not headings explicitly listed in the supplied schedule. Likewise, the exact selection of convergence tests is a proposal supporting power series, not verified instructor coverage.

Do not automatically add the entire standard two-semester calculus syllabus. Partial fractions, a full trigonometric-integral techniques lesson, numerical integration, volumes, arc length, surface area, physical work integrals, Newton's method, differential equations, parametric curves and polar coordinates are possible extensions, not confirmed omissions from this particular schedule. Add them only after a scope decision. An optional epsilon-delta lesson can deepen Limits without blocking the main path; a full catalogue of series tests is also unnecessary for this proposed path.

## Content migration after the outline change

Preserve authored lessons, widgets and their approved styling. Extract the chain-rule material into its own lesson rather than duplicate it. Move elementary derivative lessons together while preserving existing URLs or providing redirects if routes change. Add clear exponential/logarithmic foundations and revise references in Hyperbolic Functions and Logarithmic Differentiation. Revisit existing quizzes for newly reordered prerequisites.

Move essential method teaching out of the first Problems page into the new limit lessons; retain its exploratory extensions, hints and solutions. Every Problems page should mix graphical reasoning, calculation, applications and one or two challenges without introducing required calculus theory for the first time.

Before authoring a topic, record its prerequisites and newly established results. Audit proofs, worked examples, widgets and quiz explanations against that list. Keep optional proofs collapsed and label them optional.

## Implementation

The hierarchy is defined in `_data/learning_courses.json`: 10 modules and 54 submodules, with Problems last in each module. New pages remain empty and excluded from the sitemap until authored. Existing topic URLs are retained; the old combined Taylor module redirects to Sequences and Power Series.

The approved course artwork remains the force-displacement curve with a lightly shaded work region and the full course title.
