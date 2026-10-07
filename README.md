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

5. **Editable team chart + message alerts.** Run [`supabase/002_team_and_notifications.sql`](supabase/002_team_and_notifications.sql)
   in the SQL Editor the same way. Then set up the email function (below).

6. **Team member bios.** Run [`supabase/003_team_bio.sql`](supabase/003_team_bio.sql) the same way. It adds the
   **About** text shown in the pop-up card on the Team page.

### Email alerts for new messages

When a contact message is saved, the database calls the `notify-new-message` Edge Function, which emails every
admin who has alerts switched on (**Site settings → Email alerts** in the CMS). Alerts are sent from a Gmail account.

1. **Create a Gmail app password.** Signed in to the sending Gmail account, turn on 2-Step Verification
   (myaccount.google.com → Security), then open myaccount.google.com/apppasswords, create one named "DevHub website"
   and copy the 16-character password.
2. **Create the function.** Supabase → **Edge Functions → Deploy a new function → Via Editor**. Name it exactly
   `notify-new-message`, replace the sample code with [`supabase/functions/notify-new-message/index.ts`](supabase/functions/notify-new-message/index.ts),
   and click **Deploy**.
3. **Turn off JWT verification** for it: open the function → **Details**, switch off **Enforce JWT verification** (or
   "Verify JWT") and save. The database trigger calls it without a login token; the function is safe without one
   because it only ever emails about a real, not-yet-notified message.
4. **Add the secrets.** **Edge Functions → Secrets**, add:
   - `SMTP_USER`: the Gmail address (for example `devhubresearchlimited@gmail.com`)
   - `SMTP_PASS`: the app password from step 1 (spaces don't matter)
   - `SITE_URL`: the live site address, for the "Open messages" link in the email
5. **Test.** Send a message from the contact page. Admins should get an email within a minute; replying to it
   replies to the sender. If nothing arrives, check **Edge Functions → notify-new-message → Logs**.

With the Supabase CLI instead of the dashboard: `npx supabase functions deploy notify-new-message --no-verify-jwt --project-ref zavfbkbmehevejwlladp`.

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
| **Team** | Both organogram charts. Add a person, set their job title, photo and a short **About** profile, and choose who they **report to**. Visitors see the profile in a pop-up card when they hover over (or tap) that person. That choice sets their place in the chart. **+ Report** adds someone directly under a person; the arrows reorder colleagues who share a manager. Removing someone moves their direct reports up to that person's own manager. |
| **Messages** | Enquiries from the contact form. Reply by email, mark as read, delete. |
| **Site settings** | Your own email-alert switch, the home page headline and numbers, and the contact address, email and phone used across the site. |

Photos are resized in the browser before upload (max 2000px), so photos straight from a phone are fine.

## Where content lives

- **Editable in the CMS (Supabase):** posts, projects, gallery, team charts, contact details, home headline and
  numbers, messages.
- **In code ([`src/app/data/site-content.ts`](src/app/data/site-content.ts)):** About text, services and expertise,
  compliance, codes of conduct and the CEO bio. These change rarely; edit the file and redeploy.
