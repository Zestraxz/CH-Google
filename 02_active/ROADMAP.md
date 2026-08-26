# CH-Google — Roadmap

> Phases, milestones, dependencies. Updated as the project moves.

---

## Now / Next / Later

### Now (this week)

- **Owner, incident-priority: verify the live DWR flow's actual state.** The "[have Done]" tag
  means an uncorrected flow (auto-send to manager, no injection guard, 1-year expiry) may be
  running daily at 5 PM **today** — assume live until verified off. Either turn it off / confirm
  it was never activated, or apply D2 (Draft-only) + the injection guard immediately (a ~10-minute
  Studio UI action). Record the verified state in STATUS.md.
- Finish the `/critic` loop on the establishment (fix → audit → re-score to the bar or an honest stop).
- Configure git remote and push (owner: name/visibility, D-016 identity check; if naming stalls,
  push to a private placeholder now — D-016 requires identity verification before push, not
  name-perfection before backup).

### Next (1–4 weeks)

- Owner: deploy corrected `Code.gs` v3.1 into the live Apps Script project; run the validation
  protocol (`src/apps-script/README.md` §3) **including the §1.7 grounding-schema check**; capture
  evidence into `docs/` and PROJECT_ARTIFACT §12.
- Owner: apply the remaining flow corrections D1–D8 in the Workspace Studio UI (whatever wasn't
  done in the incident-priority pass); re-run the blueprint's Phase-4 validation; capture evidence.
- Record real quota limits (AI Studio dashboard) with basis in the runbook.
- Resolve open questions: Studio "Ask a Gem" source access; Studio failed-run behavior;
  DWR_Master schema decision (D4).

### Later (1–6 months)

- Measure results with basis (DWR authoring time; briefings produced) and fill PROJECT_ARTIFACT §8.
- Evaluate merging the Research Engine with CH-Research's radar layer (overlapping
  scout → score → deep-research ladder — one engine, two frontends).
- Extract the DWR Commander Gem prompt (+ injection guard) as a reusable portfolio asset via the
  Brain EXCHANGE queue.

---

## Phases

### Phase A — Establishment (current)

**Goal:** the repo durably records both systems, corrected.
**Exit criteria:** critic loop closed (bar or honest stop); first commit + remote + push; docs
canonical over the `.resource/` exports.

### Phase B — Evidenced deployment

**Goal:** both systems live, validated, with captured evidence.
**Exit criteria:** validation protocols run and recorded; STATUS matrix rows flip to ✅ with
evidence links; failure alerts proven to fire (forced-failure test).

### Phase C — Measured operation

**Goal:** results with basis; sustained unattended operation.
**Exit criteria:** PROJECT_ARTIFACT §8 has real numbers with period/denominator/scope; one month
of operation with zero silent gaps (every miss has an alert).

---

## Dependencies

| Phase | Depends on | Blocks |
| ----- | ---------- | ------ |
| B     | A (corrected code/docs) + owner Google-account actions | C |
| C     | B | portfolio/deck claims |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Ungrounded output reaches management (grounding regression or Studio Gem lacks web access) | Med | High | Validation §3 grounding spot-check; Draft-only manager email |
| Silent pipeline death (model retirement, quota change, trigger expiry) | Med | Med | v3.1 email alerts; maintenance checklist; no "Ends: 1 year" schedule |
| Prompt injection via inbound email/chat into the Gem | Low-Med | High | Gem injection guard + human review of the manager draft |
| Knowledge loss (repo local-only) | Med until remote exists | High | First commit done; remote + push is the top Next item |

---

## Out of scope

- Any web app / hosted service (the `apps/`, docker, localhost scaffold is template baseline, not roadmap).
- Auto-sending anything to the manager without human review.
- Metered API usage beyond the free/subscription tiers without explicit owner approval (D-008).
