# Introductory calculus course plan

## Scope and purpose

Design the notes for a first-year university **Calculus I–II sequence in one variable**, with trigonometry and early use of exponential and logarithmic functions. The audience is students preparing for further mathematics, science, or engineering. Prior calculus is not assumed; algebra, functions, and trigonometry are prerequisites, supported by a brief readiness review when the first module is written.

The public course data in `_data/courses.yml` is the source of truth for the ordered roadmap and measurable outcomes. The first six modules form Calculus I; modules 7–13 form Calculus II. This is our teaching sequence, rather than a claim that every university divides the subject at the same point.

## Basis for alignment

Reviewed October 2, 2026. The following primary sources establish the intended scope:

| University source | What it contributes to the design |
| --- | --- |
| [UBC MATH 100 objectives, 2023](https://secure.math.ubc.ca/php/MathNet/courseinfo.php?name=100%3A1A2&session=2023W&t=outline) | Functions, limits, differentiation, approximations, applications, and mathematical explanation. |
| [UBC MATH 101 text and objectives, 2025/26](https://personal.math.ubc.ca/~elyse/Math101Text/text-integral-calculus.pdf), with [earlier detailed objectives, 2013W](https://www.math.ubc.ca/~wachs/Teaching/MATH101/MATH101_LearningObj.pdf) | Current section and appendix objectives for integration, numerical methods, sequences, and series; the earlier list also specifies separable differential equations and modeling. |
| [Utah Calculus I outcomes, Spring 2025](https://class-tools.app.utah.edu/syllabus/1254/2533/CalcI_Syllabus_Spring2025.pdf) | Observable skills in graph analysis, derivative applications, the Fundamental Theorem, and integral applications. |
| [Wisconsin–Madison Calculus I–II](https://www.math.wisc.edu/undergraduate/courses-enrollment/calculus/) | A recognizable two-semester structure, including integration techniques, power and Taylor series, and elementary differential equations. |
| [Alberta MATH 144](https://apps.ualberta.ca/catalogue/course/math/144) and [MATH 146](https://apps.ualberta.ca/catalogue/course/math/146) | Evidence that placement varies: Taylor polynomials appear in the first course, and partial differentiation appears in the second. |

Our synthesis preserves a broad single-variable core. Introduce Taylor polynomials with local approximation and develop series and error control later. Treat parametric and polar curves as a common syllabus-dependent addition. Probability applications and first-order linear differential equations can be selected to match the target syllabus; probability is present in the UBC 2025/26 text. An Alberta- or UBC-specific syllabus that includes partial derivatives needs an additional multivariable bridge; the present course does not claim to cover that requirement.

## Outcomes must have visible evidence

Every future lesson should state two to four observable objectives. Every objective needs a worked explanation or example, student practice, and a checkpoint that makes the student's reasoning visible. Use the following alignment when writing the details:

| Outcome | Main modules | Evidence of mastery |
| --- | --- | --- |
| Interpret functions, limits, and continuity | 1 | Calculate a limit, interpret a graph or table, and justify a continuity or existence claim. |
| Explain and calculate derivatives | 2 | Use the definition, select differentiation rules, and interpret a tangent slope and its units. |
| Analyze behavior and approximate values | 3 | Sketch a curve from derivative information and justify a theorem application or approximation. |
| Model problems with derivatives | 4 | Formulate and solve an optimization or related-rates problem, checking constraints and units. |
| Explain accumulation and the Fundamental Theorem | 5 | Construct a Riemann sum, interpret an accumulation function, and apply both parts of the theorem. |
| Choose integral methods and build integral models | 6–8 | Select a method, check an antiderivative, and derive an integral from a geometric or physical description. |
| Control numerical error and improper limits | 9 | Meet a stated accuracy requirement and justify convergence or divergence. |
| Interpret and solve elementary differential equations | 10 | Read a direction field, solve a separable initial-value problem, and interpret the model. |
| Reason about convergence and series approximation | 11–12 | Justify a test, check power-series endpoints, and give an error bound for an approximation. |
| Apply calculus in other curve representations | 13 | Interpret and calculate a parametric tangent, arc length, or polar area. |

Across all modules, ask students to connect formulas, graphs, tables, and words; state assumptions; choose a method; and explain whether an answer is plausible. Technology supports exploration and checking. Students should also be able to carry out the core calculations and reasoning independently.

## Level, lesson pattern, and assessment

Core material combines conceptual understanding, computational fluency, applications, and clear reasoning. Include precise definitions, statements and hypotheses of central theorems, and justified arguments. The role of epsilon–delta proofs in the core is now a choice to settle with Keivan; it is not automatically assigned to enrichment. Dense-set counterexamples and advanced differentiability proofs can remain clearly marked extensions, with their extra prerequisites stated.

Use a consistent lesson progression: guiding question, concept and representations, worked examples, routine practice, contextual or method-selection problems, and a short checkpoint. Give hints and complete solutions after students have a chance to work. Interactive activities should serve an objective and have a static explanation.

Practice should progress in difficulty. Do not make four challenging proof problems the default practice for an introductory lesson. A module checkpoint should sample explanation, calculation, and application. Plan cumulative reviews at the ends of Calculus I and II; assess the stated objectives and previously learned skills. Keep optional enrichment out of the required assessment.

## Current material and next writing pass

The functions chapter now begins with a lesson on domains, ranges, and representations. The derivatives module has five existing lessons: its definitions, elementary rules, implicit/inverse/logarithmic techniques, and ordinary tangent examples support Module 2. Its parametric section can be revisited in Module 13; the later oscillatory and rational/irrational arguments are enrichment. Preserve existing lesson addresses.

The course architecture and the detailed [Calculus I development procedure](calculus-i-authoring.md) govern the next pass. Begin with the Calculus I home page, settle the first lesson's conventions and teaching choices with Keivan, and develop Module 1. Then revise the derivatives lessons to supply review exercises, challenging problems, ordinary tangent and higher-derivative examples, and objective-aligned checkpoints. Continue through the roadmap in order. A listed module outcome is a target for the completed notes, not a claim that forthcoming lessons already teach it.
