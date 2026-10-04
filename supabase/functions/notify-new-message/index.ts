// Emails every admin (with alerts switched on) when a contact message arrives.
// Called by the contact_messages_notify database trigger with { id }.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   SMTP_USER  the Gmail address that sends the alerts
//   SMTP_PASS  a Google "app password" for that address (not the normal password)
//   SITE_URL   the live website address, used for the "open in CMS" link
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// Calling this with a made-up id does nothing, and each message is claimed
// before sending, so a message is never emailed twice. That is why the
// function can run without JWT verification.

import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.16';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });

  let id: unknown;
  try {
    ({ id } = await req.json());
  } catch {
    return json(400, { error: 'Expected a JSON body' });
  }
  if (typeof id !== 'string' || !UUID.test(id)) return json(400, { error: 'Expected a message id' });

  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPass = Deno.env.get('SMTP_PASS');
  if (!smtpUser || !smtpPass) return json(500, { error: 'SMTP_USER / SMTP_PASS secrets are not set' });
  const siteUrl = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // Claim the message: only the first call for a given id gets a row back.
  const { data: msg, error: claimError } = await db
    .from('contact_messages')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', id)
    .is('notified_at', null)
    .select('id, name, email, organization, message, created_at')
    .maybeSingle();
  if (claimError) return json(500, { error: claimError.message });
  if (!msg) return json(200, { sent: false, reason: 'unknown or already notified' });

  const { data: admins, error: adminError } = await db.from('admins').select('user_id').eq('notify', true);
  if (adminError) return json(500, { error: adminError.message });

  const emails: string[] = [];
  for (const { user_id } of admins ?? []) {
    const { data } = await db.auth.admin.getUserById(user_id);
    if (data.user?.email) emails.push(data.user.email);
  }
  if (!emails.length) return json(200, { sent: false, reason: 'no admins have alerts switched on' });

  const org = msg.organization ? ` (${msg.organization})` : '';
  const link = siteUrl ? `${siteUrl}/admin/messages` : '';
  const text = [
    `New message from the DevHub website`,
    ``,
    `From: ${msg.name}${org}`,
    `Email: ${msg.email}`,
    ``,
    msg.message,
    ``,
    `Reply to this email to answer ${msg.name} directly.`,
    link ? `See all messages: ${link}` : '',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#1d0b3b">
      <div style="background:#300066;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
        <strong style="font-size:18px">New message from the website</strong>
      </div>
      <div style="border:1px solid #e3ddeb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
        <p style="margin:0 0 4px"><strong>${escapeHtml(msg.name)}</strong>${escapeHtml(org)}</p>
        <p style="margin:0 0 20px"><a href="mailto:${escapeHtml(msg.email)}" style="color:#1e73be">${escapeHtml(msg.email)}</a></p>
        <div style="white-space:pre-wrap;line-height:1.6;padding:16px;background:#f6f3fa;border-radius:8px">${escapeHtml(msg.message)}</div>
        <p style="margin:20px 0 0;color:#7a7090;font-size:13px">
          Reply to this email to answer ${escapeHtml(msg.name)} directly.
          ${link ? `<br><a href="${link}" style="color:#300066">Open messages in the CMS</a>` : ''}
        </p>
      </div>
    </div>`;

  try {
    const transport = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOST') ?? 'smtp.gmail.com',
      port: Number(Deno.env.get('SMTP_PORT') ?? 465),
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transport.sendMail({
      from: `"DevHub Website" <${smtpUser}>`,
      to: emails.join(', '),
      replyTo: `"${msg.name.replace(/"/g, '')}" <${msg.email}>`,
      subject: `New enquiry from ${msg.name}${org}`,
      text,
      html,
    });
  } catch (e) {
    // Release the claim so a later call can retry.
    await db.from('contact_messages').update({ notified_at: null }).eq('id', msg.id);
    return json(502, { error: `Email failed: ${e instanceof Error ? e.message : String(e)}` });
  }

  return json(200, { sent: true, to: emails.length });
});
