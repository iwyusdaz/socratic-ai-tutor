# Literature notes

Every source below was verified against the linked page on **2026-10-25** (access date recorded per source). Each note states the finding in plain language and the **design rule it implies** for this tutor. Nothing here claims the tutor works — these are inputs to the design, not evidence of outcomes.

Verification method: each 2026 source's landing page was fetched and its title, authors and key findings read directly. Older sources were confirmed via multiple independent citation records (publisher, ERIC, PsycNet or institutional copies). If a source could not be verified, it was removed rather than guessed.

---

## A. 2026 sources on AI and offloading (fetched directly)

### 1. Generative AI and cognitive load in education — systematic review

- **Source:** Qian, W., Yang, F., Cao, Y., Yi, L., Gu, R., & Wang, Z. (2026). *Generative AI and cognitive load in education: a systematic review of WoS/SSCI-indexed studies through the lens of cognitive load theory.* Frontiers in Psychology, 17.
- **URL:** https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1921504/full
- **Access date:** 2026-10-25
- **Key finding:** The review synthesized 39 empirical studies; 21 gave a *conditional* verdict on GenAI's effect on cognitive load, 16 beneficial, 2 mixed. In the authors' words: "benefits depended on scaffolding, dosage, learner prior knowledge, and task design." They warn that reduced overall load can mean freed capacity for learning — or the learning itself being offloaded to the AI — a distinction most studies cannot draw.
- **Design rule it implies:** The tutor must *impose* productive load deliberately (learner generates steps, explains thinking) and never remove the load that constitutes the learning. An unconfigured "helpful assistant" is exactly the open-ended configuration this review flags.
- **Used in:** [spec/pedagogy-rules.md](../spec/pedagogy-rules.md) (P1, P6), [spec/tutor-spec.md](../spec/tutor-spec.md).

### 2. Cognitive offloading in AI-assisted writing

- **Source:** Chen, X. (2026). *Layer-sensitive cognitive offloading in generative AI-assisted writing: supported performance and independent no-AI outcomes.* Frontiers in Psychology, 17.
- **URL:** https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1906199/full
- **Access date:** 2026-10-25
- **Key finding:** The strongest AI-supported products were not followed by the strongest independent no-AI performance. Students with open AI collaboration produced the best essays *while AI was available*, but deeper offloading at the idea and reasoning layers was associated with weaker independent performance later (open collaboration predicted higher aggregate offloading, which was associated with lower Week-8 higher-order thinking). Bounded AI support plus required reflection did best on the no-AI task.
- **Design rule it implies:** "Fluent help now" can quietly trade away "competence later." The tutor's contract with the learner is that the *learner* does the thinking: hints escalate only in response to demonstrated need, and the final steps stay with the learner. Bounded support + reflection is the pattern to copy.
- **Used in:** [spec/pedagogy-rules.md](../spec/pedagogy-rules.md) (P1, P4), [spec/guardrails.md](../spec/guardrails.md) (answer leakage).

### 3. Randomized field experiment on AI tutoring configurations

- **Source:** Yang, S., Van Alstyne, M., & Dellarocas, C. (2026). *When AI Tutors Speak: Evidence from a Randomized Field Experiment.* arXiv working draft (cs.HC), September 2026.
- **URL:** https://arxiv.org/html/2609.23958v1
- **Access date:** 2026-10-25
- **Key finding:** In a preregistered randomized field experiment (86 MBA students, corporate finance), a structured, pedagogically grounded AI tutor — one that *requires an attempt before explaining* and *closes topics only on unassisted transfer* — beat self-study with ambient consumer AI (+6.63 points of 55, p=.007), with gains concentrated in written reasoning depth. Voice modality doubled interaction density but produced statistically equivalent mastery. The authors state the design insight plainly: "This study uses AI to counter the offloading that AI invites," and note "Making an AI more humanlike does not by itself make it more educational."
- **Design rule it implies:** Two concrete tutor behaviors have experimental support: (a) require a genuine attempt before any explanation, (b) judge success by unassisted transfer, not by the supported conversation. This project operationalizes (a) in the pedagogy rules and states (b) as the definition of a successful session.
- **Used in:** [spec/tutor-spec.md](../spec/tutor-spec.md) (success definition), [spec/pedagogy-rules.md](../spec/pedagogy-rules.md) (P1, P5).
- **Limitation of the source:** n=86, one course, one subject; noted so it is not over-generalized.

### 4. L&D résumé statistic

- **Source:** Teamed (2026). *L&D Skills Landscape 2026: What's Hot, What's Not* (hiring-data article based on Teamed's own L&D job board and résumé archive).
- **URL:** https://www.teamedforlearning.com/ld-skills-landscape-2026-whats-hot-whats-not/
- **Access date:** 2026-10-25
- **Key finding (exact wording checked):** AI mentions on résumés in Teamed's archive rose to **46.2% in 2026**, up from 30.0% in 2025 and 1.6% in 2022. The page reports the share of résumés *mentioning AI at all* — it does not claim people literally write "I use AI."
- **Design rule it implies:** This is a portfolio-positioning note, not a design rule: "I use AI" is no longer a differentiator in learning design; judgment about *when AI helps learning and when it undermines it* is. This repo exists to demonstrate exactly that judgment, with evaluation.
- **Used in:** README framing.

---

## B. Foundational learning-science sources (verified via publisher/ERIC/institutional records)

### 5. Self-explanation effect

- **Source:** Chi, M. T. H., Bassok, M., Lewis, M. W., Reimann, P., & Glaser, R. (1989). *Self-explanations: How students study and use examples in learning to solve problems.* Cognitive Science, 13(2), 145–182.
- **URL:** https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1302_1 (open copy: https://www.sciencedirect.com/science/article/pii/0364021389900025)
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** Students who generated explanations to themselves while studying worked examples learned more; "good" students generated more self-explanations than "poor" students, and prompting explanations improved problem solving.
- **Design rule it implies:** After a correct answer, the tutor should ask *why it works* (P4) — the explanation is where the learning happens, not the correct symbol.

### 6. Feedback can be powerful — in either direction

- **Source:** Hattie, J., & Timperley, H. (2007). *The Power of Feedback.* Review of Educational Research, 77(1), 81–112.
- **URL:** https://journals.sagepub.com/doi/abs/10.3102/003465430298487
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** "Feedback is one of the most powerful influences on learning and achievement, but this impact can be either positive or negative." Feedback about the task and the *process* helps most; feedback directed at the person helps least.
- **Design rule it implies:** Feedback should target the learner's process ("what did the +5 do to both sides?"), never the person, and should be specific rather than evaluative (P4 "specific feedback" move).

### 7. What actually makes tutoring work

- **Source:** VanLehn, K. (2011). *The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems.* Educational Psychologist, 46(4), 197–221.
- **URL:** https://www.tandfonline.com/doi/abs/10.1080/00461520.2011.611369
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** The advantage of human tutoring over step-based computer tutoring is much smaller than the "2 sigma" legend suggests; what the best systems share is *feedback and scaffolding at the level of individual steps* — supporting the "interactive-constructive" account rather than human-like dialogue.
- **Design rule it implies:** The tutor's value should be measured by *step-level support* (one hint tied to the learner's actual step), not by fluent conversation. This is why the rubric scores "learner does the thinking" separately from politeness or fluency.

### 8. Productive struggle has limits

- **Source:** Kapur, M. (2008). *Productive failure.* Cognition and Instruction, 26(3), 379–424.
- **URL:** https://www.tandfonline.com/doi/abs/10.1080/07370000802212669 (open copy: https://arch.kuleuven.be/studeren/tall/artikels/productive-failure-kapur.pdf)
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** Struggling before instruction can *improve* later learning even when the struggle itself produces wrong solutions — but the design matters: exploration must be followed by consolidation (instruction/structure), and struggle becomes unproductive when it continues without support.
- **Design rule it implies:** The hint ladder must be a *ladder*, not a wall. Endless refusal to help is not rigor; after repeated failure the tutor must step in with a worked example (P7). Structure after struggle, not instead of it.

### 9. ICAP: generation beats reception

- **Source:** Chi, M. T. H., & Wylie, R. (2014). *The ICAP framework: Linking cognitive engagement to active learning outcomes.* Educational Psychologist, 49(4), 219–243.
- **URL:** https://www.tandfonline.com/doi/abs/10.1080/00461520.2014.965823 (open copy: https://education.asu.edu/sites/g/files/litvpz656/files/lcl/chiwylie2014icap_2.pdf)
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** Engagement modes predict learning: Passive < Active < Constructive < Interactive. "Constructive" means generating ideas beyond what was presented (self-explaining, predicting); "active" manipulation without generation (copying steps) gets much less.
- **Design rule it implies:** Every tutor turn should push the learner one mode up: from watching (passive) → doing the shown step (active) → producing the next step or the why (constructive). The tutor should never solve the step the learner was about to produce.

### 10. Prompted self-explanation inside a step-based tutor

- **Source:** Aleven, V., & Koedinger, K. R. (2002). *An effective metacognitive strategy: Learning by doing and explaining with a computer-based Cognitive Tutor.* Cognitive Science, 26(2), 147–179.
- **URL:** http://pact.cs.cmu.edu/koedinger/pubs/Aleven%20&%20Koedinger%2002.pdf
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** Adding prompted self-explanation to a step-based computer tutor improved transfer ("deep learning") beyond the tutor's usual gains — explanation prompts cost little and pay off.
- **Design rule it implies:** A chat-based tutor can implement the same move with zero UI: the tutor's prompt *is* the self-explanation prompt (P4).

### 11. Learners abuse on-demand help — help design matters

- **Source:** Aleven, V., Stahl, E., Schworm, S., Fischer, F., & Wallace, R. (2003). *Help seeking and help design in interactive learning environments.* Review of Educational Research, 73(3), 277–320.
- **URL:** https://journals.sagepub.com/doi/10.3102/00346543073003277
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** On-demand help in interactive learning environments is frequently *overused, misused or avoided* ("help abuse", "gaming the system"); help that is too easy to bottom out undermines learning. Help design determines whether it is used productively.
- **Design rule it implies:** An AI tutor asked "just give me the answer" is the classic help-abuse scenario. The answer-leakage guardrail and the ladder structure (one rung at a time, no skipping to the solution before attempts) are direct applications (P2, guardrails).
- **Also supports:** the evaluation suite's decision to make **answer-leakage rate** a headline metric rather than a footnote.

### 12. Cognitive load theory and worked examples

- **Source:** Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). *Cognitive architecture and instructional design: 20 years later.* Educational Psychology Review, 31, 261–292.
- **URL:** https://link.springer.com/article/10.1007/s10648-019-09465-5
- **Access date:** 2026-10-25 (verified via multiple citation records)
- **Key finding:** Worked examples reduce extraneous load for novices, but the *expertise-reversal effect* means the same support becomes redundant and harmful once skill grows; adaptive fading (removing support as competence increases) is the pattern that works.
- **Design rule it implies:** Two rules: (a) a worked example is a legitimate ladder rung *after repeated failure* (P7, L4) — it is not a betrayal of rigor; (b) support should fade — the tutor should give fewer hints as the session progresses, and a new problem after a success (P5) tests transfer with less scaffolding.

### 13. The equals-sign misconception

- **Source:** Knuth, E. J., Stephens, A. C., McNeil, N. M., & Alibali, M. W. (2006). *Does understanding the equal sign matter? Evidence from solving equations.* Journal for Research in Mathematics Education, 37(5), 381–388.
- **URL:** https://alibalilab.wiscweb.wisc.edu/wp-content/uploads/sites/371/2018/02/KnuthStephensMcNeilAlibali2006.pdf (open PDF from the Alibali Lab)
- **Access date:** 2026-10-25 (verified via publisher record and the lab copy)
- **Key finding:** Middle-school students' *relational* understanding of the equal sign (as "same value as", not "put the answer here") predicted their equation-solving performance. A large share of students held an operational view.
- **Design rule it implies:** The "equals is balance" misconception is worth a dedicated diagnostic question in the tutor's repertoire (P3), and the hint ladder's L1 conceptual nudge ("what do we want x to be alone on?") should sometimes target the *meaning of the equals sign*, not just the operation.
- **Used in:** [spec/misconceptions.md](../spec/misconceptions.md) (M5).

---

## Sources checked and not used

- GitHub secret scanning / push protection documentation (referenced in the plan's risk table): https://docs.github.com/en/code-security/secret-scanning — operational reference, not a learning-science claim; used in [DECISIONS.md](../DECISIONS.md) rather than here.

## What this evidence base does and does not support

- **Supported:** designing the tutor to require attempts, escalate hints gradually, prompt explanation, and step in with a worked example after repeated failure — each is grounded in at least one verified source.
- **Not supported by this evidence base:** any claim that *this* tutor makes learners learn more. That would require a controlled study with real learners over time (see [evaluation/METHODS.md](../evaluation/METHODS.md) for what is measured and what is pending).
