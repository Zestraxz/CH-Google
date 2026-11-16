# Architecture page: Google Workspace AI pages

**What it is.** `architecture.html` is the architecture page for Google Workspace AI pages, generated from `architecture.json`. It holds an animated diagram across 4 lanes (Authoring, Review gate, Repository, Hosting and readers), a captioned step-through, and the flow and component tables, cadences and risks. Edit `architecture.json` only; never edit the HTML.

**Privacy class:** public-safe (generic component names only). The repo is public and GitHub Pages serves its main branch root, so this page is public once pushed. The owner approved that on 2026-11-16.

**Rebuild,** from the Brain repo (`.CH-Claude-Persistent-Brain`):

```
python scripts/07-visualize/build-architecture-page.py --spec "<CH-Google>/artifacts/architecture/architecture.json" --out "<CH-Google>/artifacts/architecture/architecture.html"
```

Add `--check` to confirm that a page re-renders byte-identically.

**Sources and verification:** every node and edge in the spec cites its evidence (`evidence.sources` lists what was read). Claim check: 2026-11-16. Items that stay open are marked `unverified` in the spec. The page footer carries the spec hash and the generator version.

**Published:** yes, on the owner's approval of 2026-11-16: https://zestraxz.github.io/CH-Google/artifacts/architecture/architecture.html (GitHub Pages serves the main branch root, so it is reachable after the push deploys).
