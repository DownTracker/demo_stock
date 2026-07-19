# DemoStock

An inventory, point-of-sale, and DENR compliance app for aggregates &
hardware suppliers — built with Next.js and Supabase. Works on phones and
on desktop. This README doubles as a guide to the stack — read it top to
bottom the first time.

---

## 1. What's in this version

- **Dashboard** — traffic-light stock levels, a stock-levels chart, ADD
  STOCK, and a per-item "Adjust" action for non-sale corrections (loss,
  damage, recounts).
- **New Sale (POS)** — search items, add to cart, edit quantity and unit
  price per line (for bulk discounts), require a buyer name, optional cash
  tendered with change calculated, then a printable receipt.
- **History** — toggle between the raw stock log and a list of past sales;
  tap any sale to reopen and reprint its receipt.
- **Reports** (Owner only) — today/month revenue, a 14-day revenue chart,
  and the DENR Self-Monitoring Report generator.
- **Admin** (Owner only) — add staff accounts, revoke/restore access.
- **Desktop layout** — a sidebar nav replaces the phone's bottom tabs
  above the `md` breakpoint; pages use the extra width for charts and
  multi-column grids instead of stretching a phone layout.

---

## 2. How Next.js routing works (if this is new to you)

Folders inside `app/` become URLs:

```
app/
  page.js                    ->  yoursite.com/            (marketing landing page)
  login/page.js              ->  yoursite.com/login
  (app)/dashboard/page.js    ->  yoursite.com/dashboard
  (app)/pos/page.js          ->  yoursite.com/pos
  (app)/history/page.js      ->  yoursite.com/history
  (app)/reports/page.js      ->  yoursite.com/reports
  (app)/admin/page.js        ->  yoursite.com/admin
  api/create-staff/route.js  ->  yoursite.com/api/create-staff (backend only)
```

`(app)` in parentheses is a "route group" — dashboard/pos/history/reports/
admin all share one layout (`app/(app)/layout.js`, the sidebar + bottom
nav + login check) without "app" appearing in the URL.

- `"use client"` at the top of a file = runs in the browser (needed for
  buttons, state, `useEffect`).
- `components/` = reusable UI pieces.
- `lib/` = plain logic/helpers, no UI.
- `app/api/.../route.js` = backend endpoints, the only place secret keys
  are allowed.

---

## 3. Run it locally

```bash
cd demo-stock
npm install
cp .env.local.example .env.local   # fill in — see step 4
npm run dev
```

Open **http://localhost:3000**.

---

## 4. Set up Supabase

**Brand-new project:**

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste everything from `supabase.sql` in this repo →
   Run. This creates all tables (including `sales`/`sale_items` for POS)
   and seeds sample items with prices.
3. **Settings → API** → copy the **Project URL**, **anon public** (or
   *Publishable*) key, and **service_role** (or *Secret*) key into
   `.env.local`. Supabase recently renamed these — Publishable =
   old anon key, Secret = old service_role key. Either naming works the
   same way in this project.
4. **Authentication → Users → Add user** to create the owner login.
5. Copy that user's UID, then in **SQL Editor**:
   ```sql
   insert into profiles (id, name, role, status)
   values ('paste-the-uid-here', 'Owner Account', 'Owner', 'active');
   ```
6. Log in at `/login`. Create staff accounts from the **Admin** tab from
   here on — no more SQL needed for that.

**Already had the pre-POS version running?** Don't re-run the whole
`supabase.sql` file — it would try to recreate tables that already exist.
Instead, run only the commented block at the bottom of `supabase.sql`
titled `MIGRATING AN EXISTING PROJECT` — it adds the `price` column and
the new `sales`/`sale_items` tables without touching your existing data.

**Security note:** the `service_role`/Secret key can bypass every access
rule — never put it in front-end code or commit it to Git. It's only
used inside `app/api/create-staff/route.js`, which runs on the server.

---

## 5. Git & GitHub

```bash
cd demo-stock
git init
git add .
git status   # confirm node_modules/ and .env.local are NOT listed
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/demo-stock.git
git push -u origin main
```

Always commit from the command line (or GitHub Desktop), not the "drag
files into the browser" uploader — that uploader ignores `.gitignore` and
will happily upload `node_modules` and your secret keys if they're
sitting in the folder.

---

## 6. Deploy to Vercel

1. [vercel.com](https://vercel.com) → sign in with GitHub → **Add New →
   Project** → import your repo.
2. Before deploying, add **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Deploy**. Every `git push` to `main` after this redeploys
   automatically.

If you add or change environment variables *after* the first deploy, go
to **Deployments → (latest) → ⋯ → Redeploy** — Vercel doesn't pick up new
env vars on an already-built deployment on its own.

---

## 7. Reselling this as a template

The current setup is "one deploy per client": each business gets its own
copy of this repo, its own Supabase project, and its own Vercel project.
Nothing in the code needs to change to do this again for a new client —
just repeat steps 4–6 with a fresh Supabase project and a new Vercel
import, then customize:

| Want to change for a new client... | Edit this file |
|---|---|
| Business name / branding | `components/Sidebar.js`, `components/AppHeader.js`, `app/login/page.js`, `app/page.js`, `app/layout.js` (metadata) |
| Colors | `app/globals.css` (`:root` variables) |
| Stock items, units, prices, thresholds | Supabase table `items` |
| What counts as "low stock" | `lib/stock.js` → `statusOf()` |
| POS behavior (discounts, cash/change) | `app/(app)/pos/page.js` |
| The DENR report table | `app/(app)/reports/page.js` |
| Staff permissions | `app/(app)/admin/page.js`, `app/api/create-staff/route.js` |

Later, if you'd rather run one shared app that many businesses log into
(instead of separate deploys), that's a bigger change — every table
would need a "which business" column and the Row Level Security policies
in `supabase.sql` would need to filter by it. Worth planning deliberately
if you ever go that direction, rather than retrofitting it.

Still on the roadmap:
- Swap the DENR report preview table for an actual filled PDF (`pdf-lib`
  or `pdfkit`, inside an API route so keys stay server-side).
- Custom domain per client (Vercel → Project → Settings → Domains).
