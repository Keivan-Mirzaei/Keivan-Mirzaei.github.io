# Procedure for developing Calculus I

## Working agreement

The course must be mathematically rigorous, purposeful, and readable. The learner should be able to **calculate, interpret, and justify**. Emphasize important terms and distinctions selectively. Explain precisely in natural language, without making the prose rigid or repeating an explanation merely to fill a section.

Write the course's prose and explanations in our own words. Do not copy a source word for word or closely paraphrase its exposition. Sources may inform the curriculum and verify mathematics; student-facing companion reading is not needed. When a teaching element needs a stronger example, idea, or problem, ask Keivan for a contribution rather than add material merely to fill space.

The course home page is `/learning/calculus-i/`. Its six core chapters reuse the Calculus I roadmap from `_data/courses.yml`; the `calculus-i` record supplies its own objectives, prerequisites, study guidance, and planned lesson outlines. The larger Calculus I–II overview remains the sequence's entry point.

## The development cycle

1. **Agree on the mathematical task.** Identify the lesson's central question, what the reader already knows, and two to four observable learning objectives. Identify any unresolved convention, example choice, or scope decision and ask Keivan to choose before writing the dependent material. Offer a recommendation with its reason and the consequence of each alternative. Continue independent work while a decision is pending.
2. **Map the dependencies.** List the definitions, results, and earlier skills the lesson uses. Arrange the argument so that each tool is established before it is needed. Label a result being used without proof explicitly, and explain where its proof belongs. An optional section must not quietly become a prerequisite for the next core lesson.
3. **Give each element a purpose.** Plan definitions, theorems, examples, activities, exercises, problems, and optional material. For each, record the objective it supports and the particular reasoning, distinction, or difficulty it addresses. Remove an element whose contribution duplicates another. Add a second example only when it addresses a different method, representation, hypothesis, misconception, or case.
4. **Draft and solve.** Write the explanation and the mathematical argument together. State a definition's domain and quantifiers and a theorem's hypotheses and conclusion. Explain proof steps rather than compressing them into unexplained algebra. Solve every proposed exercise and problem in full before committing its statement. Use examples appropriate to the agreed level and context.
5. **Build the learning sequence.** Follow the mathematical dependencies, introducing an example or motivating question when it helps the reader see why an idea is needed. Add an interaction only when changing or inspecting something helps answer a specific mathematical question. A finite picture or numerical experiment is evidence for exploration; the accompanying argument establishes any general claim.
6. **Audit independently of the presentation.** Recalculate examples and solutions, check every inference and theorem application, inspect edge cases, and check notation across the lesson and earlier chapters. Verify any programmed mathematical behavior against exact values or independently derived bounds. Then inspect the rendered page for legible equations, correct emphasis, usable controls, and readable static explanations.
7. **Review the concrete result.** Present the finished page or a specific disputed passage. Ask about genuine ambiguity or matters of taste, such as a convention or two equally useful example contexts. Explain the tradeoff. A mathematical error must be corrected; it is not a preference to ask the user to approve. Apply feedback and repeat only the checks affected by the change.
8. **Record and proceed.** Record settled conventions and editorial decisions here, update the home-page outline when the scope actually changes, and continue to the next lesson. Reuse an approved choice consistently. Reopen it only if a new mathematical or teaching consequence requires discussion.

This is a reasoning procedure, not a requirement to put eight sections on every lesson page. Let the material determine the visible structure.

## Exercises, problems, and optional material

**Exercises review learning.** They ask the reader to recall a definition, interpret a representation, reproduce a justified technique, check a hypothesis, or consolidate a skill taught in that lesson. They should vary in a meaningful way rather than repeat the same calculation with new coefficients. A review exercise may ask for a short proof when proof is a stated learning objective.

**Problems challenge the reader.** They require a new combination, a strategic choice, a proof, a counterexample, a carefully constructed model, or an insight beyond the worked examples. Difficulty comes from mathematical reasoning, not from excessively large numbers, unannounced prerequisites, or artificial notation.

**The most challenging problems remain visible.** Give their statements a clear label and explain any extra prerequisite. Hints and solutions may be collapsed. Never hide a challenge's statement merely because it is difficult. The number and arrangement of problems will follow Keivan's choice below; no fixed count is required on every page.

**Optional material has a stated reason.** Identify what it adds and which extra knowledge it requires. Optional does not mean less rigorous. An extension should deepen an idea, expose a boundary of a theorem, connect subjects, or offer a deliberate further challenge.

## Mathematical and notational checks

- Specify domains and the relevant approach to a point. Check endpoint cases and distinguish two-sided from one-sided assertions.
- Distinguish a function's value, its limit, and the existence of either. State the finite-limit and infinite-limit conventions before using a label such as DNE.
- State quantified definitions correctly. Avoid exchanging quantifiers or assuming the point under discussion belongs to the function's domain when the definition does not require it.
- Check differentiability and continuity hypotheses before using a derivative result. Distinguish critical points, local extrema, absolute extrema, and points of inflection.
- State the eligible form and hypotheses before applying L'Hôpital's rule. An indeterminate form alone is insufficient.
- Distinguish an antiderivative, a definite integral, geometric area, signed accumulation, displacement, and total distance. Treat constants of integration and substitution bounds consistently.
- For the Fundamental Theorem, state the version and its assumptions: differentiation of an accumulation function requires continuity at the point in the usual Riemann-integral formulation; the evaluation formula must be stated with sufficient hypotheses. Generalizations must be explicitly justified.
- Check signs, units, parameter restrictions, zeros, endpoints, and denominators. A simplified expression must retain the original domain restrictions where relevant.
- Use notation consistently, with variable roles clear. An integral's dummy variable must not be confused with its upper-limit variable. Label axes and distinguish function values from slope values.
- A diagram, table, interaction, or numerical check must match the exact mathematical statement. It cannot replace a proof of a claim about all points or all sufficiently small increments.

## Choice register

| Choice | Status | When it must be settled |
| --- | --- | --- |
| Student-facing course title | Asked: Single-Variable Calculus; Differential and Integral Calculus; or Introductory Calculus I. The page uses the neutral working title Calculus I. | Before finalizing the title. |
| Role of epsilon–delta proofs | Asked: precise introduction with selected simple proofs; proofs throughout the limits unit; or an intuitive first pass with optional formal proofs. | Before developing the limits lesson and its assessment. |
| Arrangement of challenging problems | Asked: a progression up to the most challenging problems, or a smaller selection. In both cases statements remain visible and hints/solutions can be opened. | Before writing the first practice set. |
| DNE and infinite-limit notation | Pending. Offer the distinction between “no finite real limit” and “neither a finite limit nor a signed infinite limit.” In either convention, report signed infinite behavior explicitly and never treat infinity as a real number. | Before the first limit examples. |
| Newton's method and Taylor polynomials | Pending. The earlier broad roadmap includes them; their role in the detailed Calculus I course needs agreement. | Before developing the approximation chapter. |
| Example contexts and optional enrichment | Ask when selecting the actual examples or extensions. Explain the mathematical purpose of the alternatives. | Before writing dependent material. |
| Lesson 1 machine | Settled: three aligned boxes, input → log(1−x²) → result, without visible labels or decorative icons. Update immediately and show undefined outside (−1,1). Keep the separate algebraic comparison of (1−x²)/(1−x) and 1+x. | Apply in Lesson 1. |
| Meaning of log and result display | Settled: natural logarithm (base e). Show three decimal places followed by an ellipsis, truncating rather than rounding; use no approximation sign. Keep the exact output 0. | Apply consistently unless a different base is explicit. |

Mathematical rigor and correctness are already required. The unresolved proof-depth choice concerns teaching emphasis and the exercises expected of students, not whether the statements themselves are precise or valid.

## Current step

Keivan authorized publication of the course home page, chapter overview, and [Lesson 1 — Functions, domains, and representations](calculus-i-lesson-01-plan.md), including the agreed function machine and four solved review Exercises. Companion reading is removed. The candidate challenge remains in the authoring plan; its arrangement can be settled in a later addition. The next lesson is **Approaching a value and one-sided limits**. Settle the DNE convention before examples that use it, and the proof-depth choice before the precise-limit lesson and its assessment.
