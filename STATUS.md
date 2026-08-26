# CH-Google — Status

> Single-glance project state. Update on every meaningful commit.
> Rule: a status claim carries recorded evidence or is labeled **unevidenced** (BR-07).

---

## Snapshot

- **Phase:** Establishment — capturing and correcting the Google-side automation systems in the repo
- **Last updated:** 2026-08-27
- **Last commit:** see `git log -1` — history starts 2026-08-27 (`caefbc9` scaffold baseline → critic-loop fix commits; zero commits existed before that date)
- **Active owner:** Chan Hoe
- **Next milestone:** deploy corrected Research Engine v3.1 + capture DWR validation evidence

## Completion matrix

| Track | Design | Code/Config | Deployed | Evidence captured |
| --- | --- | --- | --- | --- |
| DWR Agent (Gem + Studio Flow) | ✅ blueprint + corrections D1–D8 | n/a (built in Studio UI) | 🟡 owner-claimed "[have Done]" — **unevidenced** | ⬜ |
| Research Engine (Apps Script) | ✅ blueprint + v3.1 delta table | ✅ corrected `src/apps-script/Code.gs` (parse-checked) | ⬜ v3.1 not yet deployed (owner tag "[Doing]" refers to v3.0) | ⬜ |
| Repo establishment (docs) | ✅ | ✅ ARCHITECTURE / ARTIFACT / ROADMAP / README rewritten 2026-08-27 | — | ✅ this repo |
| Scaffold (template baseline) | — | ✅ folders, compose files, CI workflow file, launchers exist | ⬜ CI never run (no remote) | — |

Legend: ✅ done · 🟡 in progress/partial · 🔴 blocked · ⬜ not started · n/a not applicable

> Reconciliation note (2026-08-27): earlier template rows here claimed docker-compose "not started"
> while PHASE1_NOTES marked it done — the files exist in the repo root; this matrix is now
> canonical over PHASE1_NOTES for current state.

## Blockers

- **⚠ Live-flow state unverified (incident-priority):** if "[have Done]" is true, the
  *uncorrected* DWR flow (auto-send to manager, no injection guard) runs daily at 5 PM — assume
  live until the owner verifies off or applies D2 + the guard (ROADMAP → Now, top item). Record
  the verified state here when done: _state: `not verified`_.
- **No git remote** (L-008/D-016): repo is local-only; configure origin (owner decision on
  name/visibility) before any push. The README's OpenSSF badge repo identity is unconfirmed.
- **No deployment evidence**: neither system has a captured test run (screenshots/log exports);
  until then, "[have Done]" stays an owner claim, not a result.

## Recent decisions

- 2026-08-27 — First `/critic` loop completed on the establishment: 3 passes (36 → 41 → 39
  adjudicated; the min-of-panel bound sits on the immutable `.resource/` exports and cannot reach
  the 90 bar — honest stop). The establishment itself (T3) scored 82/82/79 in the final pass, up
  from 41/40/36. 5 fix commits, 3 independent fix audits (all PASS_WITH_NOTES, final one zero
  regressions). See `docs/01-session/SESSION-2026-08-27-critic-google-establishment.md` +
  `docs/04-quality/critic/COVERAGE.md` §E.
- See [docs/04-quality/adr/](docs/04-quality/adr/) for the ADR ledger.

## Notes

- Founding blueprints are Gemini chat exports in untracked `.resource/` (D-014) — cite in prose;
  the corrected, canonical record is `02_active/ARCHITECTURE.md` + `src/apps-script/`.
