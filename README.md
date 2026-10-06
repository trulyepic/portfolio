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

The production site is hosted as a static Cloudflare Pages project:

- Live site: `https://kenneth-nwoye-portfolio.pages.dev/`
- Cloudflare project: `kenneth-nwoye-portfolio`
- Production branch label: `main`
- GitHub source: `https://github.com/trulyepic/portfolio`

### Current connection

GitHub and Cloudflare are not connected by an automatic build integration yet. GitHub stores the source and commit history. Wrangler uploads the checked working tree to Cloudflare Pages as a separate release step.

```text
Local portfolio -> GitHub repository
Local portfolio -> Wrangler -> Cloudflare Pages
```

Pushing to GitHub alone does not update the live site. To release an update, run these commands from this `portfolio` directory:

```powershell
npm run check
git add .
git commit -m "Describe the update"
git push origin main
npx --yes wrangler@latest pages deploy . --project-name kenneth-nwoye-portfolio --branch main --commit-dirty=false
```

Wrangler authentication is stored in Windows Credential Manager. If it expires, run:

```powershell
npx --yes wrangler@latest login --device --use-keyring
```

### Cloudflare dashboard

Sign in to `https://dash.cloudflare.com/` with the Cloudflare account used for ToonRanks. Open **Workers & Pages**, select **Overview**, and choose **kenneth-nwoye-portfolio**. The project page shows production and preview deployments, deployment logs, domains, settings, and rollback controls.

This Pages project is independent of the ToonRanks domain and services. Connecting the GitHub repository in Cloudflare later would make pushes and pull requests deploy automatically; until that connection is explicitly enabled, use the Wrangler command above.
