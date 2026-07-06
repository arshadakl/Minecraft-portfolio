import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Upstream contact endpoint + source tag come from env only — never hardcoded.
// Local: .env.local (gitignored). Production: Cloudflare secret/var.
const SOURCE = process.env.CONTACT_SOURCE ?? "portfolio";

/**
 * Contact form endpoint. Validates input, then forwards to the main
 * portfolio's contact API so the message is delivered there. Runs on the
 * Cloudflare Workers runtime — no SMTP/nodemailer, just an outbound fetch.
 * A source tag is prefixed to the subject/message so replies are traceable
 * back to the Minecraft site.
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

  const upstream = process.env.CONTACT_UPSTREAM_URL;
  if (!upstream) {
    console.error("[contact] CONTACT_UPSTREAM_URL not set");
    return NextResponse.json(
      { ok: false, error: "Contact isn't configured on the server yet." },
      { status: 500 }
    );
  }

  // Tag the source so the received mail is clearly from the Minecraft site.
  const taggedSubject = `[from ${SOURCE}] ${subject || "New message"}`;
  const taggedMessage = `(sent via ${SOURCE})\n\n${message}`;

  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        subject: taggedSubject,
        message: taggedMessage,
      }),
    });

    if (!res.ok) {
      console.error("[contact] upstream returned", res.status);
      return NextResponse.json(
        { ok: false, error: "Couldn't send right now — please email me directly." },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] forward failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't send right now — please email me directly." },
      { status: 502 }
    );
  }
}
