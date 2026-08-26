# CH-Google - Project Artifact

> **Living intelligence record** - the project's memory, learning record, evidence, results,
> and portfolio source. Update on meaningful events (discovery, decision, milestone, failure,
> result, direction change) - never "at completion". Owner: Chan Hoe.
>
> Rules: results not activities (ACTION -> RESULT -> LEARNING -> IMPACT) / separate
> FACT / ASSUMPTION / INFERENCE / DECISION / RESULT / LESSON / every number carries its basis
> or says `not measured` - never fabricate metrics, users, savings, or impact.

---

## 1. Executive summary

Google Workspace-native AI automation for the owner's recurring work: a **DWR Agent** (Gemini Gem
"DWR Commander" + Workspace Studio Flow — daily 5 PM work-report generation, sheet logging,
two-tier email) and a **Research Engine** (Apps Script + Gemini API — scout-score-research-
synthesize pipeline producing weekly executive decks). Designed 2026-08-16 in Gemini sessions;
established in this repo and hardened by a `/critic` loop on 2026-08-27. Current status: designs
corrected and captured (v3.1 script in `src/apps-script/`); **no deployment evidence captured yet**
— headline result: `not measured`.

## 2. Problem / opportunity & context

Daily working reports and recurring market/supply-chain research were manual, repetitive owner
tasks scattered across Gmail/Chat/Calendar/Drive. The org runs on Google Workspace (cutover June
2026 — see Brain pack CH-Power-Automate), so Workspace-native automation (Gems, Studio Flows, Apps
Script) needs zero new infrastructure and no new vendor. ASSUMPTION (unverified): a daily
auto-generated DWR is acceptable to the manager as a reporting medium once human-reviewed.

## 3. Research & key findings

- FACT: the founding blueprints are **Gemini chat exports** (untracked `.resource/`, D-014) — not
  verified sources. The same lesson stands in the Brain's CH-Research pack.
- FACT (verified 2026-08-27 against ai.google.dev/gemini-api/docs/models): `gemini-3.7-flash`,
  `gemini-3.6-flash`, `gemini-3.5-flash` are real current stable models; `gemini-1.5-flash` is
  retired — the blueprint's cascade tail was dead weight.
- FACT: the blueprint's v3.0 script promised web scanning but sent bare `generateContent` calls
  with no grounding tool — its "market intelligence" was model priors (critic finding V2,
  CRITICAL; fixed in v3.1).
- FACT: the blueprint's "20 requests/day free-tier cap" figure has no basis and could not be
  located in official docs — recorded as unsupported, real limits `not measured` until read from
  the AI Studio dashboard.
- INFERENCE: both systems as originally designed fail silently (catch-log-continue; no failure
  branches; 1-year schedule end) — absence-of-output was the only failure signal.

## 4. Decisions & why

| Date | Decision | Why | Rejected alternative | Why not |
| ---- | -------- | --- | -------------------- | ------- |
| 2026-08-16 | Two-layer DWR: Gem brain + Studio Flow orchestrator | Reasoning stays in the Gem; scheduling/distribution in the no-code flow | Single Apps Script for everything | Flow gives native Workspace actions + UI-managed schedule |
| 2026-08-16 | Research engine: Apps Script + Gemini API, zero paid infra | Lives entirely in Workspace; free/subscription tiers | External runner/VPS | Cost + credential surface |
| 2026-08-27 | Repo (not the chat exports) is the system of record; corrected v3.1 script is canonical | `.resource/` is untracked and immutable; critic pass 1 found the v3.0 listing defective | Treat PDFs as the record | Violates the portfolio's evidence/durability rules; exports are unfixable |
| 2026-08-27 | Manager-facing DWR is **Draft-only, never auto-Send** | Unreviewed LLM output + prompt-injection surface → reputational risk | Full autonomy per blueprint | One bad send to a superior outweighs the 30s saved |

## 5. Architecture / solution design

See [02_active/ARCHITECTURE.md](02_active/ARCHITECTURE.md) (diagrams + the D1–D8 flow corrections
and the v3.1 delta table pointer). Code: [src/apps-script/Code.gs](src/apps-script/Code.gs).
Runbook: [src/apps-script/README.md](src/apps-script/README.md).

## 6. Implementation progress

| Date | Milestone (ACTION -> RESULT -> LEARNING -> IMPACT) | Commit |
| ---- | -------------------------------------------------- | ------ |
| 2026-08-16 | Designed both systems in Gemini sessions -> exported blueprints to `.resource/` -> LEARNING: chat exports are not a durable or verified record | (pre-repo) |
| 2026-08-27 | Ran `/critic` pass 1 (3-lens panel) -> adjudicated 36/100, 2 CRITICAL + 7 MAJOR verified -> rewrote establishment docs + corrected script v3.1 -> IMPACT: repo now actually records the work; script defects fixed before deployment | first commit, this date |
| 2026-08-27 | Completed the loop: passes 2-3 + fix batches 2/2b/3, each independently audited -> terminal adjudicated 39 (bound by the immutable exports; honest stop), establishment sub-score 82/82/79 (up from 41/40/36), fresh-clone rebuild test passed -> LEARNING: min-of-panel over immutable inputs caps the verdict — track the per-target trajectory -> IMPACT: deployable corrected record + named owner actions (live-flow check, remote, validation protocol) | `9ecd4d0`..`c786b38` |

## 7. Experiments, tests & failures

- 2026-08-27 — Node `new Function` parse check on `src/apps-script/Code.gs`: **pass**
  (V8-compatible syntax; re-run after audit fix batch 1b: pass). Runtime behavior NOT yet
  exercised — Apps Script execution requires the owner's Google account.
- Recorded failure (design-time, caught by critic before deployment): v3.0's first run on a fresh
  tracker crashes on empty Next-Run cells; v3.0 decks render slides in reverse order with
  "Bullet point 2/3" residue. Neither was ever caught by a test because no test run was recorded.
- Pending: the 5-step validation protocol in `src/apps-script/README.md` §3 (fresh-tracker run,
  grounding spot-check, forced-failure alert, synthesis dry run, evidence capture).

## 8. Results / metrics

| Metric | Before | After | Basis (period, denominator, scope) |
| ------ | ------ | ----- | ---------------------------------- |
| DWR authoring time | — | — | `not measured` |
| Research briefings produced | — | — | `not measured` |
| Pipeline failure visibility | silent (log-only) | email-alert designed | design property, unverified in production |

## 9. Business / operational impact

`not measured`. Projection (labeled as projection): daily DWR authoring and weekly research
synthesis become review-only tasks once both systems run with evidence.

## 10. Reusable knowledge extracted

- **Model fallback cascade + JSON sanitizer** pattern for Apps Script → Gemini API
  (`src/apps-script/Code.gs`) — with the v3.1 corrections (fail-fast classification, header auth,
  grounding flag). Staged for Brain promotion via `EXCHANGE/PC2_TO_SHARED/`.
- **DWR Commander Gem prompt** (blueprint pp. 5–9): CONFIRMED/INFERRED/UNKNOWN epistemics,
  cross-source consolidation, fixed 12-section format — reusable beyond this project (add the §4
  injection guard from the runbook before reuse).

## 11. Current status, gaps & next actions

- **Status:** establishment complete in-repo; corrected code parse-checked; nothing deployed with
  evidence.
- **Known gaps:** no deployment evidence for either system ("[have Done]" is an owner claim); no
  git remote (L-008); Studio Flow step semantics (source access, failure behavior) unverified;
  DWR_Master schema decision (D4) open.
- **Next 3 actions:** (1) owner: paste v3.1 into the live Apps Script project and run the §3
  validation protocol, capturing evidence into `docs/`; (2) owner: apply D1–D8 in the Studio UI
  (Draft-only on the manager-email step first — blueprint Step 6 / corrected-table Step 7);
  (3) configure git remote per D-016, then push.
- **Future opportunities:** merge with CH-Research's radar layer (overlapping scout→score→research
  ladder — one engine, two frontends); extract the Gem prompt as a portfolio asset.

## 12. Evidence

| Claim | Evidence (commit / file / screenshot / test run / dashboard) |
| ----- | ------------------------------------------------------------ |
| Blueprints exist (2026-08-16) | `.resource/` PDFs 1 & 4 (untracked; cited in prose per D-014) |
| Critic pass 1 verdict 36/100, findings verified | git-ignored `_runs/critic_google-establishment_pass1.json` + session ledger `docs/01-session/SESSION-2026-08-27-critic-google-establishment.md` |
| v3.1 script parses | Node `new Function` parse check, 2026-08-27 — recorded in session ledger §2 |
| Model IDs current / 1.5-flash retired | WebFetch of ai.google.dev/gemini-api/docs/models, 2026-08-27 — recorded in session ledger §2 + `_runs/critic_google-establishment_pass1.json` |
| DWR deployed | **none — unevidenced owner claim** |

_No evidence, no portfolio claim._

## 13. Portfolio / Deck Intelligence

- **Problem & why it mattered:** daily reporting + recurring research consumed owner time on
  repetitive synthesis across six Workspace surfaces.
- **Starting point:** two Gemini-authored blueprints, one claimed deployed, zero repo capture.
- **Insight / key innovation:** Workspace-native automation needs zero infrastructure — but
  chat-authored blueprints ship confident, untested defects; a critic loop before deployment
  caught 2 CRITICAL + 7 MAJOR issues including a core capability (web grounding) that didn't exist.
- **Solution in one paragraph:** a Gem-brain/Flow-orchestrator DWR agent (human-gated manager
  draft) plus a three-layer Apps Script research engine with grounded Gemini calls, fail-fast
  error classification, and email-alert failure visibility — established, corrected, and
  version-controlled in this repo.
- **Before -> after:** untracked chat exports with silent-failure designs → tracked, corrected,
  parse-checked canonical system with an evidence-gated status ledger.
- **Measurable impact:** `not measured` (deployment evidence pending).
- **Lessons learned:** see §10 + ISSUES_AND_LEARNINGS; headline — *"generated by an AI that
  describes itself" is not "verified": the blueprint claimed web scanning its own code never
  requested.*
- **Reusable methodology:** critic-loop-before-deployment on AI-generated blueprints.
- **Visual opportunities:** two architecture diagrams (in ARCHITECTURE.md), before/after defect
  table, critic-loop flow.
- **Executive takeaway:** AI-generated automation blueprints are drafts, not deliverables — an
  adversarial review loop turned two plausible-but-defective exports into a deployable, observable
  system before any executive saw a wrong number.

## 14. Completion gate

_Implementation finished != project complete. Before marking COMPLETE:_

- [x] Brain pack + index row exist (`PROJECTS/CH-Google/PROJECT.md`, added 2026-08-27)
- [x] artifact current - [x] exec summary - [x] findings - [x] decisions - [x] architecture
- [ ] results (with basis) - [x] lessons - [x] evidence linked - [x] portfolio section filled
- [x] STATUS.md updated - [x] future opportunities named - [ ] deck-ready story exists (needs
      deployment evidence for the demo/results slides)
- **Named gaps:** results `not measured`; deployment evidence absent; remote unconfigured.

_Unmet items are named gaps - a project with gaps is not COMPLETE._
