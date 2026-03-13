# Sigma Editable Table Plugin — Setup & Deploy

## Prerequisites
- Node.js 18+
- A GitHub account and a repo created for this plugin
- Git configured locally

---

## 1. Install dependencies

```bash
cd sigma-editable-table
npm install
```

---

## 2. Develop locally

```bash
npm run dev
# Opens at http://localhost:5173
```

To test inside Sigma, register a plugin pointing to `http://localhost:5173`
(or ask your Org Admin to set up the **Sigma Plugin Dev Playground** pointing at that URL).

---

## 3. Configure your repo name before deploying

Open `vite.config.js` and update `REPO_NAME` to match your GitHub repository name:

```js
const REPO_NAME = 'sigma-editable-table'  // ← change to your repo name
```

This sets Vite's `base` path so assets resolve correctly under:
`https://<you>.github.io/<repo-name>/`

---

## 4. Push to GitHub

```bash
git init
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## 5. Deploy to GitHub Pages

```bash
npm run deploy
```

This runs `vite build` then `gh-pages -d dist`, which pushes the `dist/`
folder to a `gh-pages` branch. GitHub Pages will serve from that branch.

The first deploy may take 1–2 minutes to go live. Your plugin URL will be:

```
https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/
```

---

## 6. Register the plugin in Sigma

1. Go to **Administration → Custom Plugins → Add**
2. Set the **Production URL** to your GitHub Pages URL above
3. Save. The plugin will now appear in the workbook element panel under **Plugins**.

---

## 7. Use the plugin in a workbook

1. Open or create a Sigma workbook
2. Click **+** → **Plugins** → select **Sigma Editable Table**
3. In the element panel, connect a **Data Source** (any table or dataset)
4. Click **⚙ Map columns** in the plugin toolbar to configure:
   - **Primary key column** — used as `__key` in the writeback payload
   - **Target field names** — map each source column to the destination field name
5. Edit cells, add rows, or mark rows for deletion
6. Click **▶ Write back** — the payload is sent to Sigma's output channel
7. Wire the plugin's **Writeback Rows** output to a Sigma **Input Table** or **Writeback** element

---

## Writeback payload shape

Each row in the payload carries:

```json
{
  "__op": "insert" | "update" | "delete",
  "__key": "<primary key value>",
  "<target_field_1>": "<value>",
  "<target_field_2>": "<value>"
}
```

---

## Re-deploying after changes

```bash
npm run deploy
```

That's it — no need to re-register the plugin in Sigma; the URL stays the same.
