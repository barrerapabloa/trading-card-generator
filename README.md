# Legendex

Nickname trading card generator (Next.js App Router). Card stats and copy are generated in the **browser**, so the app can ship as a **static site** on **GitHub Pages**.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: with Cloudflare credentials in `.env.local`, `POST /api/portrait` can generate portrait art in dev (`next dev` / `next start`). GitHub Pages is static-only, so the build sets **`NEXT_PUBLIC_SKIP_PORTRAIT`** — no portrait request runs and the card shows the placeholder (no red error).

## Deploy to GitHub Pages (own repo)

1. Create a **new repository** (e.g. `legendex`) and push this project to the `main` branch.
2. **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions**.
3. The workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds with `STATIC_EXPORT=1` and `BASE_PATH=/<repository-name>` so assets resolve under `https://<user>.github.io/<repo>/`.
4. After the first successful run, the site URL is shown on the workflow run and under **Settings → Pages**.

**Note:** `BASE_PATH` must match the repository name. If you use a **user site** (`<user>.github.io` with no subpath), set `BASE_PATH` to empty in the workflow and adjust `next.config.ts` accordingly.

### Manual static build

```bash
npm run build:static
# With project-style base path (replace `legendex` with your repo name):
STATIC_EXPORT=1 BASE_PATH=/legendex npm run build
```

Output is in `out/`. `public/.nojekyll` is included so GitHub Pages serves `_next` correctly.

## Scripts

| Script          | Description                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Development server                               |
| `npm run build` | Production build (SSR / default)                 |
| `npm run build:static` | Static export to `out/` (`STATIC_EXPORT=1`) |
