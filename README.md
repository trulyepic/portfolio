# Kenneth Nwoye Portfolio

A static, interaction-focused software engineering portfolio covering production product work, backend systems, mobile delivery, secure AI tooling, and career progression.

## Local development

Run all commands from this `portfolio` directory.

```powershell
npm run check
npm run serve
```

Then open `http://127.0.0.1:4180/`.

## Structure

- `index.html` contains the homepage, project shell, metadata, and dialogs.
- `data.js` is the content source for project chapters and evidence.
- `app.js` renders project journeys, deep links, and interactions.
- `styles.css` contains the responsive visual system.
- `assets/` contains the resume, product evidence, icon, and social preview.
- `_headers` defines Cloudflare Pages security and cache headers.
- `scripts/check-site.mjs` validates local references and production metadata.

## Deployment

This repository is configured as a zero-build Cloudflare Pages project. Use `npm run check` as the build command and `.` as the output directory. Pull requests receive preview deployments when the repository is connected through Cloudflare Pages.

