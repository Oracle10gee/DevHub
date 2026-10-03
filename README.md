# DevHub Research Limited website

Public website plus a small CMS at `/admin`, built with Angular 17 and Supabase.

## Run locally

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/dev-hub/browser
```

## One-time Supabase setup

1. **Create the database.** In the Supabase dashboard open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. Then do the same with
   [`supabase/seed.sql`](supabase/seed.sql) to load the projects, gallery, settings and a welcome post.
2. **Create the first admin.**
   - **Authentication → Users → Add user → Create new user**: enter the admin's email and a password, and tick
     **Auto Confirm User**.
   - Back in the **SQL Editor**, run (with their email):
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'admin@example.com';
     ```
   Repeat both steps for every additional admin. To remove someone, delete their row from `admins` (or the user).
3. **Turn off public sign-ups.** **Authentication → Sign In / Providers → Email**: switch off
   **Allow new users to sign up**. (Only accounts in the `admins` table can edit anything, but this keeps the
   user list clean.)
4. **Allow password-reset links.** **Authentication → URL Configuration**: set **Site URL** to the live address
   (for example `https://devhubresearch.com`) and add `https://<your-domain>/admin/reset-password` and
   `http://localhost:4200/admin/reset-password` to **Redirect URLs**.

The project URL and publishable key live in [`src/environments/environment.ts`](src/environments/environment.ts).
The publishable key is safe to ship; never put the `service_role`/secret key in this repo.

## Deploy (Vercel)

Import the repository in Vercel. [`vercel.json`](vercel.json) already sets the build command, output folder and
the rewrite that lets deep links like `/projects/lagos-commuter-survey` load. Add the custom domain under
**Project → Settings → Domains**.

## Admin guide

Sign in at **`/admin`**.

| Section | What you can do |
|---|---|
| **Posts** | Write news and field stories. Add a cover image, format the body (headings, lists, quotes, links, images), then set **Status → Published**. A future publish date schedules the post. Drafts are never visible on the site. |
| **Projects** | Add or edit projects, including client, timeline, phases and a full write-up. **Feature on home page** adds a project to the home page timeline; untick **Visible on website** to hide it without deleting it. Use the arrows on the list to set the order. |
| **Gallery** | Upload several photos at once, edit captions (saved when you click away), reorder with the arrows, delete. |
| **Messages** | Enquiries from the contact form. Reply by email, mark as read, delete. |
| **Site settings** | Home page headline, the four headline numbers, and the contact address, email and phone used across the site. |

Photos are resized in the browser before upload (max 2000px), so photos straight from a phone are fine.

## Where content lives

- **Editable in the CMS (Supabase):** posts, projects, gallery, contact details, home headline and numbers, messages.
- **In code ([`src/app/data/site-content.ts`](src/app/data/site-content.ts)):** About text, services and expertise,
  compliance, codes of conduct, the CEO bio and the team chart. These change rarely; edit the file and redeploy.
