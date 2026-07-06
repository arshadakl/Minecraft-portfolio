import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// nodemailer needs Node APIs — opt out of the Edge runtime.
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape user text before dropping it into the HTML email body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Contact form endpoint. Sends the message to GMAIL_USER via Gmail SMTP
 * using a Google App Password (GMAIL_APP_PASSWORD), with the sender's
 * address set as Reply-To so replies go straight back to them.
 */
export async function POST(req: Request) {
  const data = (await req.json().catch(() => null)) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  } | null;

  const name = data?.name?.trim();
  const email = data?.email?.trim();
  const subject = data?.subject?.trim();
  const message = data?.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Name, email and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "That email address doesn't look right." },
      { status: 400 }
    );
  }
  if (name.length > 120 || (subject?.length ?? 0) > 200 || message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "One of the fields is too long." },
      { status: 400 }
    );
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("[contact] GMAIL_USER / GMAIL_APP_PASSWORD not set");
    return NextResponse.json(
      { ok: false, error: "Email isn't configured on the server yet." },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const heading = subject ? `${subject} — ${name}` : `New message — ${name}`;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${user}>`,
      to: user,
      replyTo: `"${name}" <${email}>`,
      subject: `[Portfolio] ${heading}`,
      text: `From: ${name} <${email}>\nSubject: ${subject || "(none)"}\n\n${message}`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.5">
          <p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
          <p><strong>Subject:</strong> ${esc(subject || "(none)")}</p>
          <hr />
          <p style="white-space:pre-wrap">${esc(message)}</p>
        </div>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't send right now — please email me directly." },
      { status: 502 }
    );
  }
}
