# Deploying Chess AI on Render

This guide walks you through deploying the Chess AI app as a **Static Site** on [Render](https://render.com). No backend is required for the base app — Render hosts the built React files directly.

---

## Prerequisites

- A [Render account](https://render.com) (free tier works)
- Your project pushed to a GitHub or GitLab repository
- At least one API key (`VITE_ANTHROPIC_API_KEY` or `VITE_GEMINI_API_KEY`)

---

## Step 1 — Push Your Project to GitHub

```bash
git init
git add .
git commit -m "initial chess ai commit"
git remote add origin https://github.com/YOUR_USERNAME/chess-ai.git
git push -u origin main
```

Make sure your `.env` file is in `.gitignore` (never commit API keys):

```
# .gitignore
node_modules/
dist/
.env
```

---

## Step 2 — Create a New Static Site on Render

1. Log in to [render.com](https://render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub account and select your `chess-ai` repository
4. Fill in the build settings:

| Field | Value |
|---|---|
| **Name** | `chess-ai` (or any name you like) |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

5. Click **"Create Static Site"**

---

## Step 3 — Add Environment Variables

After creating the site, go to your site's dashboard → **Environment** tab → **Add Environment Variable**:

| Key | Value |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-...` |
| `VITE_GEMINI_API_KEY` | `AIza...` |

Add whichever keys you have. You don't need both.

> ⚠️ **Important:** Vite bakes `VITE_*` variables into the static bundle at build time. After adding or changing keys, you must trigger a **Manual Deploy** for the new values to take effect.

---

## Step 4 — Handle Client-Side Routing

React Router (if you add it later) requires all routes to serve `index.html`. Add a Render rewrite rule:

1. Go to your site → **Redirects/Rewrites** tab
2. Add a new rule:

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

This isn't required for the base app (which has no router), but you'll need it if you add multi-page navigation later.

---

## Step 5 — Set Up Stockfish (Important!)

The Stockfish engine file must be in your `public/stockfish/` folder **before you build**. Render won't run `cp` commands post-install unless you add them to the build command.

Update your build command in Render to:

```
npm install && cp node_modules/stockfish/src/stockfish-nnue-16.js public/stockfish/stockfish.js && npm run build
```

Or, if the NNUE file isn't available, try:

```
npm install && cp node_modules/stockfish/src/stockfish.js public/stockfish/stockfish.js && npm run build
```

This ensures the Stockfish Web Worker is bundled into the `dist/` output. If the file copy fails, the app falls back to the built-in heuristic AI automatically.

---

## Step 6 — COOP / COEP Headers for Stockfish WASM

Stockfish uses `SharedArrayBuffer` (for WASM threads), which requires two HTTP headers. Render lets you set custom headers via a `render.yaml` config file.

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: chess-ai
    env: static
    buildCommand: npm install && cp node_modules/stockfish/src/stockfish-nnue-16.js public/stockfish/stockfish.js && npm run build
    staticPublishPath: dist
    headers:
      - path: /*
        name: Cross-Origin-Opener-Policy
        value: same-origin
      - path: /*
        name: Cross-Origin-Embedder-Policy
        value: require-corp
```

Commit and push this file. Render will detect it automatically on the next deploy.

> **Note:** These headers are set by Vite's dev server locally (via `vite.config.js`), but you need `render.yaml` to replicate them in production.

---

## Triggering Deploys

Render auto-deploys on every push to `main`. You can also:

- Trigger a manual deploy from the Render dashboard → **Manual Deploy** → **Deploy latest commit**
- View build logs in real-time under the **Logs** tab

---

## Free Tier Limits

Render's free static site hosting has no bandwidth or request limits. The only constraint is that build minutes are shared across your account (750 free minutes/month on the free plan — more than enough for this project).

---

## Production Checklist

- [ ] `.env` is in `.gitignore` — never commit API keys
- [ ] Environment variables added in Render dashboard
- [ ] `render.yaml` committed with COOP/COEP headers
- [ ] Build command includes the Stockfish `cp` step
- [ ] Triggered a deploy after adding environment variables

---

## Optional: Add a Backend for Game History

If you want to persist game history and user stats, add a Node.js/Express backend as a separate **Web Service** on Render:

1. Create `server/` directory with your Express app
2. Add a new **Web Service** in Render pointing to the same repo
3. Set **Root Directory** to `server/`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `node index.js`
6. Update your frontend's API calls to point to the Render web service URL

Render's free web services spin down after 15 minutes of inactivity (cold starts ~30s). Upgrade to a paid plan to keep them always-on.
