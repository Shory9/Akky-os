import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

export type EnquiryKind = "demo" | "quote" | "project" | "support";

type Props = { kind: EnquiryKind; subject: string; productSlug?: string; onClose: () => void };

const titles: Record<EnquiryKind, string> = {
  demo: "Request a demo", quote: "Get a quote", project: "Discuss your project", support: "Request a support quote",
};

export default function EnquiryModal({ kind, subject, productSlug, onClose }: Props) {
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (fullName.trim().length < 2) return setError("Please enter your full name.");
    if (!phone.trim() && !email.trim()) return setError("Please enter a phone number or email address.");
    setSaving(true);
    try {
      let productId: string | null = null;
      if (productSlug) {
        const { data } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle();
        productId = data?.id ?? null;
      }
      const requestMessage = [`${titles[kind]}: ${subject}`, message.trim()].filter(Boolean).join("\n\n");
      const { error: insertError } = await supabase.from("leads").insert({
        product_id: productId, full_name: fullName.trim(), business_name: businessName.trim() || null,
        email: email.trim() || null, phone: phone.trim() || null, message: requestMessage,
        source: `website_${kind}`, status: "new",
      });
      if (insertError) throw insertError;
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request save nahi hui. Please try again.");
    } finally { setSaving(false); }
  };

  return <div className="enquiry-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
      <button className="enquiry-close" type="button" onClick={onClose} aria-label="Close">×</button>
      {saved ? <div className="enquiry-success"><span>✓</span><p>REQUEST RECEIVED</p><h2>Thank you, {fullName.split(" ")[0]}.</h2><small>Your request for <b>{subject}</b> is saved. Our team will contact you shortly.</small><button className="primary-cta" type="button" onClick={onClose}>Done</button></div> : <>
        <div className="enquiry-heading"><p>AKKYOS · BUSINESS ENQUIRY</p><h2 id="enquiry-title">{titles[kind]}</h2><span>{subject}</span></div>
        <form className="enquiry-form" onSubmit={submit}>
          <label>Full name *<input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoFocus /></label>
          <label>Business name<input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Company or business" /></label>
          <div className="enquiry-row"><label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" inputMode="tel" /></label><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" type="email" /></label></div>
          <label>Requirement<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us briefly what you need" rows={4} /></label>
          <small className="enquiry-help">Phone ya email me se kam se kam ek zaroor bharein.</small>
          {error && <p className="enquiry-error" role="alert">{error}</p>}
          <button className="primary-cta enquiry-submit" disabled={saving} type="submit">{saving ? "Saving request..." : "Submit request"}<span>↗</span></button>
        </form>
      </>}
    </section>
  </div>;
}
