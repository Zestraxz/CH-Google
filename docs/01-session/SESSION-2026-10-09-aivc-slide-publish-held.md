# SESSION 2026-10-09 — publish request for a non-GWS slide: resolved outside this repo

> Machine: PC2. The owner asked to publish an additional slide that had been copied into
> `artifacts/gws-ai-pages/`. The pre-publish check (L-009/L-011: per-repo employer-domain care)
> found it was **employer-domain content from another CH project, marked confidential** — so it
> was **not** committed or published here. Details live in that project's own private records,
> not in this public repo (record where a hazard sits, never the value).

## Outcome

- The slide turned out to be an exact duplicate of an artifact already maintained — and already
  published privately via a link-gated page — in its home project. The copy here was also a
  **stale rendering** superseded by that project's corrected version. The duplicate was removed
  from this repo's working tree (original intact in its home project); the owner shares the
  existing private link from its Share menu.
- Standing protection added: `.git/info/exclude` (local-only, never pushed) now ignores
  stray `aivc_*.html` and `*.png` drops in `artifacts/gws-ai-pages/` — **7 untracked screenshots**
  found in that folder are likely to contain names/production data and stay local until each is
  reviewed for publication.

## Update (same day): owner override — sanitized public summary shipped

The owner then explicitly requested a GitHub-hosted link ("ok sanitize it and publish to github").
Shipped `artifacts/gws-ai-pages/aivc-milestones-roadmap.html`: a **sanitized public derivative**
built from the corrected canonical version in its home project (not the stale copy) — speaker
notes, internal source/tool names and machine identifiers removed, no confidentiality marker,
figures limited to the basis-checked set. Verification: grep for the sensitive-token list = 0
hits; live render checked. The canonical slide and its full figure basis remain in the home
project's private records, which also note this derivative and the update path.

## Final state (owner correction, same day)

The owner then corrected course: *"i want my origin layout and data content — please do not
modify without my permission."* The sanitized derivative was **removed** and the owner's original
file published **verbatim** (byte-identical, checksum-verified against his master copy in its home
project). Standing rule recorded (AGENTS.md §14 + assistant memory): his authored artifacts ship
byte-identical; any alteration needs explicit per-item consent to the exact edits beforehand.
The on-record risk acknowledgments live in the home project's private records, not here.

## Reasoning Trail

- **Request:** publish the copied slide like the GWS pages.
- **Check before act:** the publish pattern matched earlier sessions, but the per-repo rule
  required reading the file and its home project's pack first — both flagged it (confidential
  marking + employer-domain fence + the home project's own do-not-quote note on a figure this
  stale copy still displayed).
- **Options:** publish here (rejected — public, crawlable, permanent history); republish fresh
  (rejected — would regress the corrected published version); **point at the existing private
  published page and remove the stale duplicate (chosen, owner-confirmed via the recommended
  option)**.
- **Pivots:** the protective sweep surfaced the unreviewed screenshots; scope widened to protect
  those locally too.
