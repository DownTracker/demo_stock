# Bantay Stock

A phone-friendly inventory & DENR compliance app, built with Next.js and
Supabase. This README doubles as a first-timer's guide to the whole stack —
read it top to bottom the first time.

---

## 1. What you're actually looking at (Next.js in 2 minutes)

Next.js is a framework on top of React. The one thing to understand before
anything else: **folders inside `app/` become URLs.**

```
app/
  page.js                    ->  yoursite.com/
  login/page.js              ->  yoursite.com/login
  (app)/dashboard/page.js    ->  yoursite.com/dashboard
  (app)/history/page.js      ->  yoursite.com/history
  (app)/reports/page.js      ->  yoursite.com/reports
  (app)/admin/page.js        ->  yoursite.com/admin
  api/create-staff/route.js  ->  yoursite.com/api/create-staff (a backend endpoint, not a page)
```

A folder named in `(parentheses)` — like `(app)` — is a "route group." It
lets `dashboard`, `history`, `reports`, and `admin` share one layout
(header + bottom nav + login check) without the word "app" showing up in
the URL. Open `app/(app)/layout.js` to see that shared shell.

Other things worth knowing:
- `"use client"` at the top of a file means "this runs in the browser" —
  needed for anything with buttons, state, or `useEffect`. Files without it
  run on the server.
- `components/` holds pieces reused across pages (the modal, the nav bar,
  the stock card).
- `lib/` holds plain logic/helpers — no UI.
- `app/api/.../route.js` files are backend endpoints your frontend calls
  with `fetch()`. They're the only place allowed to use secret keys.

---

## 2. Run it locally

You'll need [Node.js](https://nodejs.org) installed (v20 or newer).

```bash
cd bantay-stock
npm install
cp .env.local.example .env.local   # then fill it in — see step 3
npm run dev
```

Open **http://localhost:3000**. Changes you make to files save and appear
instantly — no restart needed.

---

## 3. Set up Supabase (your database + login system)

1. Go to [supabase.com](https://supabase.com), create a free project.
2. Open **SQL Editor** in the sidebar, paste in everything from
   `supabase.sql` in this project, and click **Run**. This creates your
   tables (`items`, `transactions`, `profiles`) and seeds starting stock.
3. Go to **Settings -> API**. Copy:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key -> `SUPABASE_SERVICE_ROLE_KEY` (keep this one
     secret — never share it or put it in frontend code)
4. Paste all three into your `.env.local` file.
5. Create the owner login: **Authentication -> Users -> Add user**. Use
   any email format (it doesn't need to be real — e.g.
   `owner@bantaystock.local`) and a password.
6. Copy that new user's UID (shown in the users table), then back in the
   SQL Editor run:
   ```sql
   insert into profiles (id, name, role, status)
   values ('paste-the-uid-here', 'Owner Account', 'Owner', 'active');
   ```
7. Restart `npm run dev` and log in with that email/password at
   `/login`. From there, use the **Admin** tab in the app to create staff
   accounts — you won't need to touch SQL again.

**Why service_role is separate:** the browser only ever gets the `anon`
key, which is deliberately limited by the Row Level Security rules in
`supabase.sql`. The `service_role` key can do anything, so it's only used
once, inside `app/api/create-staff/route.js`, which runs on Vercel's
servers — never sent to a visitor's phone.

---

## 4. Put it on GitHub

If this is your first time with Git:

```bash
cd bantay-stock
git init
git add .
git commit -m "Initial commit"
```

Then on [github.com](https://github.com), click **New repository**, leave
it empty (no README/license), and copy the commands it shows you — they'll
look like:

```bash
git remote add origin https://github.com/your-username/bantay-stock.git
git branch -M main
git push -u origin main
```

Your `.env.local` file will **not** be uploaded — it's in `.gitignore` on
purpose, since it holds secret keys. That's exactly what you want.

---

## 5. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. **Add New -> Project**, pick your `bantay-stock` repo, click **Import**.
3. Before deploying, open **Environment Variables** and add the same three
   from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. A couple minutes later you'll get a live URL like
   `bantay-stock.vercel.app` — that's what goes on your aunt's phone.
5. Every time you `git push` to `main` after this, Vercel automatically
   redeploys. No manual re-upload, ever.

---

## 6. Where to make changes later

| Want to change... | Edit this file |
|---|---|
| Stock items, units, reorder thresholds | Supabase table `items` (or `supabase.sql` for the seed list) |
| Dashboard layout / big buttons | `app/(app)/dashboard/page.js` |
| What counts as "low stock" | `lib/stock.js` -> `statusOf()` |
| Colors, fonts | `app/globals.css` |
| The DENR report table | `app/(app)/reports/page.js` |
| Who can create/revoke staff | `app/(app)/admin/page.js` + `app/api/create-staff/route.js` |

Roadmap items still worth doing when you're ready:
- Swap the report preview table for a real filled PDF (e.g. `pdf-lib` or
  `pdfkit`, run inside an API route so the secret keys stay server-side).
- Point the domain at a custom name once you're happy with it (Vercel ->
  Project -> Settings -> Domains).
