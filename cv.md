---
title: Curriculum vitae
eyebrow: Background & experience
section: cv
permalink: /cv/
description: Education, research, teaching, mathematical outreach, and awards.
search: true
updated: 2026-09-30
---

I am a PhD candidate in Mathematical Finance at the University of Calgary, supervised by Jinniao Qiu. My work lies at the intersection of stochastic analysis and partial differential equations, with a focus on approximating non-Markovian processes by Markovian ones.

[keivan.mirzaei@ucalgary.ca](mailto:keivan.mirzaei@ucalgary.ca) · [GitHub](https://github.com/Keivan-Mirzaei)

[Download CV (PDF, April 2026)]({{ '/assets/cv/keivan-mirzaei-cv-april-2026.pdf' | relative_url }})

*Web CV updated {{ page.updated | date: '%B %Y' }}.*

## Education

### University of Calgary

**PhD candidate in Mathematical Finance — In progress**<br>
Calgary, Alberta, Canada · GPA: 4.0/4.0<br>
Supervisor: Jinniao Qiu

### Sharif University of Technology

**MSc in Pure Mathematics — 2021**<br>
Tehran, Iran · GPA: 4.0/4.0

Thesis: [Stein’s Method, Malliavin Calculus, Relations and Applications]({{ '/research/steins-method-malliavin-calculus/' | relative_url }}). Supervisor: Prof. Bijan Zohuri-Zangeneh. Evaluated as excellent.

### Ferdowsi University of Mashhad

**BSc in Pure Mathematics — 2018**<br>
Mashhad, Iran · GPA: 3.2/4.0

## Honors and awards

### 2026 — Eric Milner Prize

University of Calgary. Awarded in recognition of research achievements and contributions to promoting mathematics and making it accessible to others.

### Winter 2026 — Graduate Assistant Teaching (GAT) Excellence Award

Department of Mathematics and Statistics, University of Calgary. Recognition for excellent teaching assistance and contributions to teaching and learning in the department.

### 2024 — Math to Power Industry (M2PI) Student Stipend Award

Math to Power Industry, Calgary, Canada.

### 2024 — Teaching Excellence Award

University of Calgary.

### Earlier distinctions

- **2021:** One of the faculty’s top three students by GPA (4.0/4.0), Sharif University of Technology.
- **2018:** First place and gold medal, 23rd National Scientific Olympiad for University Students in Mathematics, Tehran, Iran.
- **2017:** Second Prize, International Mathematics Competition for University Students (IMC), Blagoevgrad, Bulgaria.
- **2017:** Educational Prize, Iran’s National Elites Foundation (INEF).
- **2017:** Bronze medal, 18th International Mathematical Olympiad for University Students, Tehran, Iran.
- **2017:** Third place and bronze medal, 22nd National Scientific Olympiad for University Students in Mathematics, Tehran, Iran.
- **2016:** Silver medal, Contest of Mathematics for University Students, Seoul, South Korea.
- **2016:** Silver medal, Iranian Mathematics Competition for University Students, Tehran, Iran.
- **2014:** Educational Prize, Iran’s National Elites Foundation (INEF).
- **2014:** Silver medal, Iranian Mathematics Competition for University Students, Kerman, Iran.

## Research and preprints

Research interests: stochastic analysis, probability theory, mathematical finance, stochastic differential equations, and partial differential equations.

{% assign papers = site.research | where: 'kind', 'Paper' %}
{% for paper in papers %}
- {{ paper.authors | join: ', ' }}. [{{ paper.title }}]({{ paper.url | relative_url }}). {{ paper.status }} ({{ paper.year }}).
{% endfor %}

[Read more about my papers and thesis]({{ '/research/' | relative_url }}).

## Teaching and curriculum development

### Women Online University of Afghanistan

- **Spring 2026 — Instructor:** Discrete Mathematics.
- **Spring 2026 — Supervisor:** Undergraduate thesis.

### Bow Valley College

- **Winter 2026 — Instructor:** Linear Methods I; Introductory Calculus II.
- **Fall 2025 — Course developer:** Introduction to Statistics II. Contributed to the development of the university transfer mathematics curriculum in statistics.

### University of Calgary — Teaching assistant

- **Spring 2026:** Introduction to Statistics I.
- **Winter 2026:** Time Series Analysis; Introduction to Statistics II.
- **Fall 2025:** Calculus for Engineers and Scientists; University Calculus II.
- **Spring 2025:** Introduction to Probability.
- **Winter 2025:** Analysis II.
- **Fall 2024:** Differential Equations for Engineers and Scientists; Linear Methods II.
- **Summer 2024:** Discrete Mathematics.
- **Winter 2024:** Discrete Mathematics; University Calculus I.
- **Fall 2023:** Linear Methods II; Discrete Mathematics.
- **Spring 2023:** Linear Methods II.
- **Winter 2023:** Complex Analysis.
- **Fall 2022:** Discrete Mathematics; Linear Methods.

### Sharif University of Technology

- **2019 — Teacher:** Preparatory classes for undergraduate students entering the International Mathematics Competition (IMC), Department of Mathematical Sciences.

### Ferdowsi University of Mashhad

- **2019 — Teacher:** Preparatory classes for the Iranian Mathematics Competition for University Students, Department of Mathematical Sciences.
- **2017 — Teaching assistant:** Complex Analysis; Theoretical Foundations of Problem Solving.
- **2016 — Teaching assistant:** Linear Algebra; Foundations of Analysis.

### Math House

- **2018 — Teacher:** Preparatory classes for the International Mathematical Tournament of Towns.
- **2016 — Teacher:** Preparatory classes for the National Mathematical Olympiad.

## Talks

- **Spring 2026:** “Strong Measurability and Approximations for Non-Separable Metric-Valued Mappings, with Applications in Stochastic Analysis.” [Alberta Mathematics Dialogue](https://sites.google.com/macewan.ca/AMD2026), MacEwan University, Edmonton.
- **Fall 2025:** “Sevian Triangles, Sevian Simplexes, and Their Areas and Volumes.” Graduate Seminar Talks, University of Calgary.
- **Fall 2025:** “An interesting problem in analysis?” Graduate Seminar Talks, University of Calgary.
- **Spring 2025:** “Viscosity Solutions for Stochastic Variational Inequalities.” Alberta Mathematics Dialogue, University of Calgary.

## Research and industry experience

- **Summer 2024 — Project member:** Complilogic Project, Math to Power Industry Program.
- **Summer 2024 — Workshop participant:** “New Trends and Challenges in Stochastic Differential Games,” Banff International Research Station.

## Mathematical service

- **2022 — Grader:** Canadian Open Mathematics Challenge (COMC).
- **2019 — Grader:** 43rd Iranian Mathematics Competition, Competitions’ Committee of the Iranian Mathematical Society.
- **2017 — Assistant team leader:** Ferdowsi University of Mashhad’s team for the 41st Iranian Mathematics Competition.

## Skills

**Programming and web:** Python, MATLAB, JavaScript, HTML, CSS, Bash.

**Languages:** Persian (native), English (fluent), Turkish (fluent), French (basic).
