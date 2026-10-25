# Attribution

Third-party and source material used in this repository, with license/status notes. Everything not listed here is original to this repo (CC BY 4.0 for content, MIT for code — see `LICENSE` and `LICENSE-CODE`).

## Cited research sources

Cited and summarized in [research/literature-notes.md](research/literature-notes.md) (each with URL and access date, 2026-10-25) and linked from the site and README. Citation and short-summary use; no text reproduced at length.

| Source | Used in | How |
|---|---|---|
| Qian et al. (2026), *Generative AI and cognitive load in education*, Frontiers in Psychology | README, literature notes, landing page | Finding summary + link |
| Chen (2026), *Layer-sensitive cognitive offloading in generative AI-assisted writing*, Frontiers in Psychology | README, literature notes, landing page | Finding summary + link |
| Yang, Van Alstyne & Dellarocas (2026), *When AI Tutors Speak: Evidence from a Randomized Field Experiment*, arXiv | README, literature notes, tutor spec | Finding summary + link |
| Teamed (2026), *L&D Skills Landscape 2026* | README, landing page, literature notes | Statistic (46.2% of L&D résumés mention AI, up from 30.0% in 2025) + link |
| Chi et al. (1989), Cognitive Science; Hattie & Timperley (2007), RER; VanLehn (2011), Educational Psychologist; Kapur (2008), Cognition and Instruction; Chi & Wylie (2014), Educational Psychologist; Aleven & Koedinger (2002), Cognitive Science; Aleven et al. (2003), RER; Sweller, van Merriënboer & Paas (2019), Educational Psychology Review; Knuth, Stephens, McNeil & Alibali (2006), JRME | literature notes, pedagogy rules, misconceptions | Finding summaries + links |

## Frameworks referenced

- **WCAG 2.1** (W3C): used as the accessibility testing baseline. Referenced by name and link; no text reproduced. https://www.w3.org/TR/WCAG21/
- **Nielsen's 10 usability heuristics**: named as the basis of the upcoming Agent review checklist. https://www.nngroup.com/articles/ten-usability-heuristics/
- **Cohen's kappa**: standard inter-rater statistic; implemented from the published formula in `eval/score.mjs`.

## Tools (used, not bundled)

- axe-core 4.11.1 (Magnea/Deque) — accessibility audit engine, run from the workspace tooling. (MPL 2.0)
- Playwright 1.57.0 (Microsoft) — browser automation for tests and screenshots. (Apache-2.0)
- dotenv 17.3.1 (motdotla) — `.env` loading in the pipelines. (BSD-2-Clause)
- gitleaks 8.30.1 (Zachary Rice / Gitleaks) — secret scanning. (MIT)
None of these are committed to this repository (see `.gitignore`); they are external tooling pinned at the workspace level.

## Fictional content (labeled where it appears)

- The simulated-learner personas **Riley, Sam, Alex, Jordan and Casey** (spec/misconceptions.md, eval/run-adaptive-learner.mjs) are fictional personas created for evaluation design; they are not real people and are labeled "fictional" and "AI-simulated" everywhere they appear.

## License summary

- Learning content (text, spec, prompts, rubric, test cases, evaluation design, prose): **CC BY 4.0**.
- Code (HTML/CSS/JS, Node.js pipelines, tests): **MIT**.
