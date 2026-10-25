**Step:** [2. Define](Step-2-Define) · **Status:** `Done` · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Define measurable targets: task success, time on task, SUS, conversion.

## Inputs

Check each input is done and linked before you start.

- [x] **[#1 Stakeholder interview notes](01-Stakeholder-interview-notes)**
  - **Why it's needed:** Metrics must reflect what the business counts as success, and only stakeholders can say that.
  - **How it's used:** Stakeholders' definition of success becomes measurable UX metrics.
  - **Reference:** [Stakeholder Interviews 101](https://www.nngroup.com/articles/stakeholder-interviews/) (NN/g states this)
- [x] **[#2 Business goals and constraints](02-Business-goals-and-constraints)**
  - **Why it's needed:** Each metric should map to a business goal so improvements show business value.
  - **How it's used:** Business goals are translated into UX metrics to track.
  - **Reference:** [7 Steps to Benchmark Your Product’s UX](https://www.nngroup.com/articles/product-ux-benchmarks/)
- [x] **[#6 Analytics and support-ticket review](06-Analytics-and-support-ticket-review)**
  - **Why it's needed:** Targets need a starting value to measure improvement against.
  - **How it's used:** Current numbers become the baseline for UX metrics.
  - **This cycle:** Skipped, because there is no product yet. All baselines are "none".
  - **Reference:** [7 Steps to Benchmark Your Product’s UX](https://www.nngroup.com/articles/product-ux-benchmarks/)
- [x] **[#40 Survey scores (SUS, NPS)](40-Survey-scores-SUS-NPS)**
  - **Why it's needed:** Targets should be updated with real scores.
  - **How it's used:** Scores may reset targets.
  - **This cycle:** Not applicable (first cycle). The targets below are first guesses, to be reset after launch.
  - **Reference:** [Beyond NPS: SUS, NASA-TLX, SEQ](https://www.nngroup.com/articles/measuring-perceived-usability/)
- [x] **[#41 Benchmark report](41-Benchmark-report)**
  - **Why it's needed:** New targets should start from the latest measured values.
  - **How it's used:** Becomes the baseline for the next release.
  - **This cycle:** Not applicable (first cycle).
  - **Reference:** [7 Steps to Benchmark Your Product’s UX](https://www.nngroup.com/articles/product-ux-benchmarks/) (NN/g states this)

## Template

NN/g template: **None**

- NN/g has no free template for this output. Use the sections below.

## Content

_Drafted by Claude and reviewed by iman244 on 2026-10-23, from [#1](01-Stakeholder-interview-notes) and [#2](02-Business-goals-and-constraints). There is no product yet, so every baseline is "none" and every target is a first guess. Targets are reset after launch, from [#38 Analytics](38-Analytics-data) and [#40 Survey scores](40-Survey-scores-SUS-NPS)._

### Metrics

**Goal 1: building is easy without instructions** (measured in usability tests, [#25](25-Usability-test-tasks))

| Metric | Definition | Baseline | Target | Method | Owner |
|---|---|---|---|---|---|
| First-dashboard success | Testers who build and save a dashboard with at least 2 charts, with no help | None | 4 of 5 testers | Usability test | iman244 |
| Time to first chart | From opening the builder to seeing the first chart of real game data | None | Under 60 seconds | Usability test, timed | iman244 |
| Find-the-data success | Testers who find a named measure (for example "army DPS") on their first try | None | 4 of 5 testers | Usability test / first-click test ([#28](28-First-click-test-results)) | iman244 |
| Ease rating (SEQ) | "Overall, how easy was this task?" asked after each task, from 1 (very hard) to 7 (very easy) | None | Average 5.5 or higher | Question after each task | iman244 |
| SUS score | Standard 10-question usability questionnaire, 0–100 (68 is average) | None | 75 or higher | After the test ([#40](40-Survey-scores-SUS-NPS)) | iman244 |

**Goal 2: single-game dashboards on the full data, with calculated measures** (measured in the product)

| Metric | Definition | Baseline | Target | Method | Owner |
|---|---|---|---|---|---|
| Games that load | Games opened in the app that load all their data without an error | None | 95% or more | Error logging | iman244 |
| Calculated measures in use | Dashboards that use at least one calculated measure (such as army DPS) | None | 30% or more | Product analytics | iman244 |

**Goal 3: share and open games through others' dashboards** (measured in the product)

| Metric | Definition | Baseline | Target | Method | Owner |
|---|---|---|---|---|---|
| Dashboards shared | Saved dashboards whose link is copied or opened by someone else | None | 30% or more | Product analytics | iman244 |
| Lens reuse | Dashboard views that show a **different game** from the one the dashboard was built on | None | 50% or more | Product analytics | iman244 |

**Goal 4: people use it** (measured in the product)

| Metric | Definition | Baseline | Target | Method | Owner |
|---|---|---|---|---|---|
| **Weekly active people** | People who build, edit or open a dashboard in a week | None | **100** (set by iman244) | Product analytics | iman244 |
| Weekly builders | The part of weekly active people who create or edit a dashboard | None | Tracked, no separate target _(Claude's call)_ | Product analytics | iman244 |
| Weekly viewers | The part of weekly active people who only open dashboards | None | Tracked, no separate target _(Claude's call)_ | Product analytics | iman244 |
| Returning builders | Builders who build or edit again within 30 days | None | 30% or more | Product analytics | iman244 |

### Link to business goals

| Metric | Business goal ([#2](02-Business-goals-and-constraints), ranked) |
|---|---|
| First-dashboard success, time to first chart, find-the-data success, ease rating, SUS | 1. Building is easy without instructions |
| Games that load, calculated measures in use | 2. Single-game dashboards on the full data |
| Dashboards shared, lens reuse | 3. Anyone can share and open any game through someone else's dashboard |
| Weekly active people, weekly builders, weekly viewers, returning builders | 4. People use it |

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#25 Usability test tasks](25-Usability-test-tasks)**
  - **Why it needs this result:** Without it, test results can't show whether targets were met.
  - **How it's used:** Sets what to measure in tests: task success, time on task.
- **[#38 Analytics data](38-Analytics-data)**
  - **Why it needs this result:** Without it, analytics collects data that doesn't answer the key questions.
  - **How it's used:** Decides which events and goals to track.
- **[#39 A/B test results](39-A-B-test-results)**
  - **Why it needs this result:** Without it, teams pick whichever metric favors their preferred version.
  - **How it's used:** Defines the success metric for A/B tests.
- **[#40 Survey scores (SUS, NPS)](40-Survey-scores-SUS-NPS)**
  - **Why it needs this result:** Without it, a score like SUS 68 can't be judged good or bad for this product.
  - **How it's used:** Sets target SUS/NPS scores.
- **[#41 Benchmark report](41-Benchmark-report)**
  - **Why it needs this result:** Without it, the benchmark has nothing defined to track.
  - **How it's used:** Benchmarking starts by choosing the metrics.

## Definition of done

- [x] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-23)
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [x] Owners of the outputs under "Feeds into" are told

## References

- [Usability Metrics](https://www.nngroup.com/articles/usability-metrics/)
- [7 Steps to Benchmark Your Product’s UX](https://www.nngroup.com/articles/product-ux-benchmarks/)
