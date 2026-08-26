# Coverage Map â€” Self-Critic (.CH-Google)

> **This file is the Radar's memory.** A scheduled run starts with zero context; everything it knows
> about what has already been swept, tried, or ruled out, it learns here. Keep it current or the
> Radar re-proposes dead ideas.
>
> Bound from `.Critic/Critic-Radar.md` â†’ *Project binding*. Companion: `REFUTED-LEDGER.md`.
>
> ðŸ”§ **SEEDED STUB â€” edit before the first scheduled run.** Replace Â§B/Â§C/Â§D with this project's real
> areas. An unedited stub makes the Radar sweep a fictional surface, which is worse than not running.

- **Repo:** .CH-Google
- **Created:** 2026-08-26
- **Cadence:** weekly â€” see `SOP-AUTONOMOUS-SELF-CRITIC.md`
- **Bar:** â‰¥ 90 adjudicated, zero open CRITICAL/MAJOR (`.Critic/Critic-Agent-Loop.md`)
- **Provability floor:** *(TODO â€” the smallest effect this project can actually measure. If none
  applies, write "none" explicitly; a blank invites the Radar to invent one.)*

---

## Â§A â€” What this project is (so a zero-context agent can orient)

*(TODO: 3â€“6 lines. What it does, who uses it, what "good" means here. A zero-context agent reads only
this to build its mental model â€” vagueness here degrades every finding downstream.)*

---

## Â§B â€” Coverage matrix

Status: âœ… covered/verified Â· ðŸŸ¡ partial Â· âŒ untried Â· ðŸš« ruled out (â†’ ledger)

| # | Layer | Area | Status | Evidence / note |
|---|---|---|---|---|
| B1 | core | *(TODO)* | âŒ | |
| B2 | core | *(TODO)* | âŒ | |
| B3 | interface | *(TODO)* | âŒ | |
| B4 | scheduling | Scheduler has fired end-to-end at least once | âŒ | Prove it â€” SOP Â§4 |
| B5 | portability | Binding section edited for this project | âŒ | `.Critic/Critic-Radar.md` bottom |

---

## Â§C â€” Ranked backlog (expected value / cost)

| # | Finding | Layer | Cheapest first measurement | Nearest refuted class + distinction |
|---|---|---|---|---|
| C1 | Binding + coverage map are unedited stubs, so the Radar has no real surface to sweep. | portability | Fill Â§A/Â§B/Â§D and the binding section | None â€” setup debt. |
| C2 | Scheduler installed but never fired. | scheduling | One manual `workflow_dispatch` run | **L-ONDEMAND**. Distinction: this is its *fix*, unverified â€” not a re-proposal. |

---

## Â§D â€” Layer definitions

*(TODO: name this project's layers. The layer check is the Radar's sharpest tool â€” mature projects
over-generalise their laws, and an entire untouched layer can hide behind a rule borrowed from
elsewhere. Pick layers that could each independently be the place nobody has looked.)*

| Layer | What lives here | Never-tried question to ask each run |
|---|---|---|
| core | *(TODO)* | *(TODO)* |
| interface | *(TODO)* | *(TODO)* |
| ops | *(TODO)* | *(TODO)* |

> **Layer rule:** a hard-won rule in one layer must not veto another.

---

## Â§E â€” Reports

> Newest first. Each scheduled run appends one dated block (â‰¤60 lines). Human triage rejections stay
> here **with reasons** â€” the next run reads them and must not re-raise without new evidence.

### 2026-08-27 — /critic Microscope run on the Google establishment (tracked evidence record)

Target: the two `.resource/` founding blueprints (immutable Gemini chat exports) + the repo docs
establishing them. Bar ≥ 90, min-of-panel binding. **Pass 1:** STRATEGIC 41 / FIDELITY 40 /
TECHNICAL 36 → adjudicated **36**; 15 verified clusters (2 CRITICAL + 7 MAJOR), 0 refuted, 3
not_actioned (owner/Google-side). Fixes: commits `caefbc9` (pre-fix baseline) → `9ecd4d0` →
`825155b` (audit batch 1b; audit verdict PASS_WITH_NOTES). **Pass 2:** STRATEGIC 56 (T3=72) /
FIDELITY 54 (T3=86) / TECHNICAL 41 (T3=81) → adjudicated **41**; 14 new verified findings
(W1–W14), 0 refuted. Key external verifications (2026-08-27, reproduced by two panels + fixer):
`gemini-3.7/3.6/3.5-flash` current on ai.google.dev models page; `gemini-1.5-flash` retired;
no "20 RPD" free-tier figure locatable; `Slide.duplicate()` inserts after the original.
Structural note: the panel minimum binds on the immutable exports — the adjudicated verdict has a
hard ceiling regardless of repo quality; per-target T3 trajectory is the meaningful metric
(41/40/36 → 72/86/81). Full pass logs: session-local `_runs/critic_google-establishment_pass<N>.json`
(git-ignored); durable summary: `docs/01-session/SESSION-2026-08-27-critic-google-establishment.md`.

### 2026-08-26 â€” Setup (baseline, not a Radar run)

Self-Critic kit installed and bound to .CH-Google. No sweep has run yet.

**Executive summary (5 lines):**
1. *Best new opportunity:* n/a â€” no sweep yet.
2. *Most dangerous gap:* the binding and this map are unedited stubs (**C1**).
3. *Most dangerous over-broad claim:* none recorded yet.
4. *Now obsolete in the queue:* n/a.
5. *Recalibrate:* set a real provability floor after run 3.

