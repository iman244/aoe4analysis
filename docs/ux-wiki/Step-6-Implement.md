**Goal:** Ship, measure against targets, and feed results into the next cycle.

**Start when:** No severity 3-4 issues remain open.

**Done when:** every output below meets its definition of done.

**Tip:** The benchmark report closes the loop and starts the next cycle at Step 1.

## Outputs

| # | Output | Goal | Inputs from | Feeds into | NN/g template |
|---|---|---|---|---|---|
| 33 | [Design specs and handoff file](33-Design-specs-and-handoff-file) | Give developers everything needed to build exactly what was tested. | #32 | #34, #35, #36, #37 | Partial |
| 34 | [Design system components](34-Design-system-components) | Reusable, consistent UI parts. | #2, #33 | #37 | None |
| 35 | [QA report](35-QA-report) | Confirm the build matches the design and works. (No dedicated NN/g article.) | #33 | #37 | Partial |
| 36 | [Accessibility (WCAG) report](36-Accessibility-WCAG-report) | Make the product usable for people with disabilities and legally compliant. | #33 | #37 | None |
| 37 | [Live product](37-Live-product) | Real users using the real product. | #30, #33, #34, #35, #36 | #38, #39, #40 | None |
| 38 | [Analytics data](38-Analytics-data) | Track real usage at scale against your metrics. | #9, #13, #37 | #6, #41 | None |
| 39 | [A/B test results](39-A-B-test-results) | Prove which design version performs better with real traffic. | #13, #37 | #32, #41 | None |
| 40 | [Survey scores (SUS, NPS)](40-Survey-scores-SUS-NPS) | Measure perceived usability and satisfaction. | #13, #37 | #13, #41 | None |
| 41 | [Benchmark report](41-Benchmark-report) | Compare UX metrics before/after or against competitors to prove improvement and ROI. | #6, #7, #11, #13, #25, #38, #39, #40 | #1, #13 | None |

[← Back to home](Home)
