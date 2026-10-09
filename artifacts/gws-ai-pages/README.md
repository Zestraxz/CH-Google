# GWS + AI pages (public site artifact)

Three self-contained HTML one-pagers on Google Workspace standardization + AI readiness, hosted
publicly via GitHub Pages.

| Published file | Source (untracked, D-14) | Page title |
|---|---|---|
| `gws-collaboration.html` | `.resource/GWS+AI/GWS official work collaboration.html` | Top-Down Management Agreement — Google Workspace as Corporate Environment |
| `gws-standardization-infographic.html` | `.resource/GWS+AI/gws_standardization_infographic_dark.html` | Google Workspace Standardization & AI Readiness Infographic |
| `gws-ai-ecosystem.html` | `.resource/GWS+AI/GWS+AI ecosystem.html` | Google Workspace Standardization & AI Readiness Infographic (ecosystem view) |
| `future-ai-google-ecosystem.html` | authored in-repo 2026-10-08 (no `.resource/` source) | Future AI-Google Ecosystem — It Starts in Google Chat (one-page slide; qualitative by design — no figures, BR-06) |
| `aivc_milestones_and_4.0_roadmap_slide.html` | byte-identical copy of the owner's original in `.CH-AIVC\artifacts\aivc-milestones-roadmap\` (private project holds the canonical + full figure basis) | AIVC Capability Evolution: 2.0 Glove Defect → 3.0 Former & Holder Defect → 4.0 Chain Defect. **Published verbatim at the owner's explicit direction, 2026-10-09 — original layout and data content, no modifications.** A sanitized derivative existed briefly the same day and was removed at the owner's request. Update path: owner supplies a new original; publish it unmodified |

- **Published URL:** `https://zestraxz.github.io/CH-Google/` (landing page = repo-root `index.html`;
  each page under `artifacts/gws-ai-pages/<name>.html`). Pages serves branch `main`, folder `/ (root)`.
- **How to update:** edit/replace the file here (keep the web-safe filename), commit, push — Pages
  redeploys automatically in ~1 minute. If a new export lands in `.resource/GWS+AI/`, copy it over
  the published file; the published copy is the source of truth for the site (build templates are
  not kept — owner rule 2026-09-14).
- **Dependencies:** public CDNs only (Tailwind Play CDN, Chart.js via jsdelivr, Font Awesome via
  cdnjs) — no build step, files render as-is.
- **Verification basis:** pre-publish scan 2026-09-21 — no employer names, personal emails, or
  secret-shaped strings in these files (grep over the three files; repo-wide L-011 sweep done the
  same day before the first push).
