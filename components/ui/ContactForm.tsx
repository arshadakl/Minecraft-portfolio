"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("Failed — try email instead.");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !body?.ok) {
        setErrorMsg(body?.error ?? "Failed — try email instead.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setErrorMsg("Network error — try email instead.");
      setStatus("error");
    }
  };

  const inputClass =
    "pointer-events-auto w-full border-2 border-[#8a6a3e] bg-[#f4e9cd] px-2 py-1.5 font-pixel-body text-[16px] text-[#3a2a18] placeholder-[#a08a60] outline-none focus:border-[#4c6b2f]";

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className={inputClass}
        />
      </div>
      <input name="subject" placeholder="Subject" className={inputClass} />
      <textarea
        name="message"
        required
        placeholder="Message"
        rows={3}
        className={`${inputClass} resize-none`}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="pointer-events-auto border-2 border-[#4c6b2f] bg-[#6f9143] px-4 py-1.5 font-pixel text-[9px] text-[#f4f0dd] transition-colors hover:bg-[#5d7d36] disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send ✉"}
        </button>
        {status === "sent" && (
          <span className="font-pixel-body text-[15px] text-[#4c6b2f]">
            Delivered! I&apos;ll get back to you.
          </span>
        )}
        {status === "error" && (
          <span className="font-pixel-body text-[15px] text-[#a33d2e]">
            {errorMsg}
          </span>
        )}
      </div>
    </form>
  );
}
