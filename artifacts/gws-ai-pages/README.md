# GWS + AI pages (public site artifact)

Three self-contained HTML one-pagers on Google Workspace standardization + AI readiness, hosted
publicly via GitHub Pages.

| Published file | Source (untracked, D-14) | Page title |
|---|---|---|
| `gws-collaboration.html` | `.resource/GWS+AI/GWS official work collaboration.html` | Top-Down Management Agreement — Google Workspace as Corporate Environment |
| `gws-standardization-infographic.html` | `.resource/GWS+AI/gws_standardization_infographic_dark.html` | Google Workspace Standardization & AI Readiness Infographic |
| `gws-ai-ecosystem.html` | `.resource/GWS+AI/GWS+AI ecosystem.html` | Google Workspace Standardization & AI Readiness Infographic (ecosystem view) |

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
