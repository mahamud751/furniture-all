"use client";

import { useState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/fields";
import { apiSend } from "@/lib/http";
import { useSite } from "@/lib/site";

const empty = { firstName: "", lastName: "", phone: "", email: "", message: "" };

export default function ContactForm() {
  const { contact } = useSite();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const onChange = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || form.phone.replace(/\D/g, "").length < 11) {
      setError("Enter your name and an 11-digit phone number.");
      return;
    }
    if (!form.email.includes("@") || form.message.trim().length < 5) {
      setError("Enter a valid email and a short message.");
      return;
    }
    setError("");
    setPending(true);
    try {
      await apiSend("/messages", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone,
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The message could not be sent.");
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    const body = `${form.firstName} ${form.lastName}\n${form.phone}\n${form.email}\n\n${form.message.trim()}`;
    const mailto = `mailto:${contact.email}?subject=${encodeURIComponent("Furniture enquiry")}&body=${encodeURIComponent(body)}`;
    return (
      <div className="rounded-xl bg-white p-6 lg:p-8">
        <h2 className="text-xl font-medium">Thank you, {form.firstName}.</h2>
        <p className="mt-3 text-sm leading-6 text-(--secondary)">
          Call {contact.phone} or email {contact.email}. {contact.hours}.
        </p>
        <a href={mailto} className={`${primaryButtonClass} mt-6`}>
          Email this message
        </a>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setForm(empty);
          }}
          className="mt-4 w-full text-sm font-medium underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>First Name</span>
          <input className={fieldClass} value={form.firstName} onChange={onChange("firstName")} autoComplete="given-name" />
        </label>
        <label className="block">
          <span className={labelClass}>Last Name</span>
          <input className={fieldClass} value={form.lastName} onChange={onChange("lastName")} autoComplete="family-name" />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Phone Number</span>
        <input className={fieldClass} value={form.phone} onChange={onChange("phone")} inputMode="tel" autoComplete="tel" />
      </label>
      <label className="block">
        <span className={labelClass}>Email</span>
        <input className={fieldClass} type="email" value={form.email} onChange={onChange("email")} autoComplete="email" />
      </label>
      <label className="block">
        <span className={labelClass}>Message</span>
        <textarea
          className={`${fieldClass} h-32 py-3`}
          value={form.message}
          onChange={onChange("message")}
        />
      </label>
      {error && <p className="text-sm text-(--quinary)">{error}</p>}
      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
