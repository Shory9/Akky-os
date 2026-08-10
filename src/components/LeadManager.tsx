import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
type Lead = {
  id: string; product_id: string | null; full_name: string; business_name: string | null;
  email: string | null; phone: string | null; message: string | null; source: string;
  status: LeadStatus; next_follow_up_at: string | null; admin_notes: string | null;
  created_at: string; products: { name: string } | null;
};
type ProductOption = { id: string; name: string };
type LeadDraft = Pick<Lead, "full_name" | "business_name" | "email" | "phone" | "message" | "source" | "product_id">;

const emptyDraft: LeadDraft = { full_name: "", business_name: "", email: "", phone: "", message: "", source: "manual", product_id: null };
const stages: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" }, { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" }, { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" }, { value: "lost", label: "Lost" },
];
const leadSelect = "id, product_id, full_name, business_name, email, phone, message, source, status, next_follow_up_at, admin_notes, created_at, products(name)";
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not scheduled";
const cleanPhone = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "");

export default function LeadManager({ onClose }: { onClose: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LeadDraft>(emptyDraft);

  const loadLeads = async () => {
    setLoading(true); setMessage("");
    const [{ data, error }, productResult] = await Promise.all([
      supabase.from("leads").select(leadSelect).order("created_at", { ascending: false }),
      supabase.from("products").select("id, name").order("name"),
    ]);
    if (error) setMessage(error.message);
    else {
      const rows = (data || []) as unknown as Lead[];
      setLeads(rows);
      setSelectedId((current) => current && rows.some((lead) => lead.id === current) ? current : rows[0]?.id || null);
    }
    if (!productResult.error) setProducts((productResult.data || []) as ProductOption[]);
    setLoading(false);
  };
  useEffect(() => { void loadLeads(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => (stage === "all" || lead.status === stage) && (!term ||
      [lead.full_name, lead.business_name, lead.email, lead.phone, lead.products?.name, lead.source]
        .some((value) => value?.toLowerCase().includes(term))));
  }, [leads, search, stage]);
  const selected = leads.find((lead) => lead.id === selectedId) || null;
  const due = leads.filter((lead) => lead.next_follow_up_at && new Date(lead.next_follow_up_at) <= new Date() && !["won", "lost"].includes(lead.status)).length;
  const stageCounts = Object.fromEntries(stages.map((item) => [item.value, leads.filter((lead) => lead.status === item.value).length])) as Record<LeadStatus, number>;

  const saveLead = async (changes: Partial<Lead>) => {
    if (!selected) return false;
    setSaving(true); setMessage("");
    const { data, error } = await supabase.from("leads").update(changes).eq("id", selected.id).select(leadSelect).single();
    if (error) setMessage(error.message);
    else { setLeads((current) => current.map((lead) => lead.id === selected.id ? data as unknown as Lead : lead)); setMessage("Lead saved successfully."); }
    setSaving(false); return !error;
  };

  const createLead = async () => {
    if (draft.full_name.trim().length < 2) return setMessage("Lead name is required.");
    if (!draft.email?.trim() && !draft.phone?.trim()) return setMessage("Email or phone number is required.");
    setSaving(true); setMessage("");
    const payload = { ...draft, full_name: draft.full_name.trim(), business_name: draft.business_name?.trim() || null, email: draft.email?.trim() || null, phone: draft.phone?.trim() || null, message: draft.message?.trim() || null, source: draft.source.trim() || "manual", status: "new" as const };
    const { data, error } = await supabase.from("leads").insert(payload).select(leadSelect).single();
    if (error) setMessage(error.message);
    else { const lead = data as unknown as Lead; setLeads((current) => [lead, ...current]); setSelectedId(lead.id); setDraft(emptyDraft); setShowCreate(false); setMessage("New lead added successfully."); }
    setSaving(false);
  };

  const deleteLead = async () => {
    if (!selected || !window.confirm(`Delete ${selected.full_name}? This cannot be undone.`)) return;
    setSaving(true); setMessage("");
    const { error } = await supabase.from("leads").delete().eq("id", selected.id);
    if (error) setMessage(error.message);
    else { const remaining = leads.filter((lead) => lead.id !== selected.id); setLeads(remaining); setSelectedId(remaining[0]?.id || null); setMessage("Lead deleted."); }
    setSaving(false);
  };

  const startEdit = () => {
    if (!selected) return;
    setDraft({ full_name: selected.full_name, business_name: selected.business_name || "", email: selected.email || "", phone: selected.phone || "", message: selected.message || "", source: selected.source, product_id: selected.product_id });
    setEditing(true);
  };
  const commitEdit = async () => {
    if (!draft.email?.trim() && !draft.phone?.trim()) return setMessage("Email or phone number is required.");
    const ok = await saveLead({ ...draft, full_name: draft.full_name.trim(), business_name: draft.business_name?.trim() || null, email: draft.email?.trim() || null, phone: draft.phone?.trim() || null, message: draft.message?.trim() || null });
    if (ok) setEditing(false);
  };

  const form = (mode: "create" | "edit") => <div className="lead-form-grid">
    <label><span>Lead name *</span><input value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} /></label>
    <label><span>Business name</span><input value={draft.business_name || ""} onChange={(e) => setDraft({ ...draft, business_name: e.target.value })} /></label>
    <label><span>Phone</span><input value={draft.phone || ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label>
    <label><span>Email</span><input type="email" value={draft.email || ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
    <label><span>Interested product</span><select value={draft.product_id || ""} onChange={(e) => setDraft({ ...draft, product_id: e.target.value || null })}><option value="">General enquiry</option>{products.map((p) => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    <label><span>Source</span><input value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></label>
    <label className="lead-form-wide"><span>Requirement / message</span><textarea value={draft.message || ""} onChange={(e) => setDraft({ ...draft, message: e.target.value })} /></label>
    <div className="lead-form-wide lead-form-actions"><button onClick={() => mode === "create" ? void createLead() : void commitEdit()} disabled={saving}>{saving ? "Saving..." : mode === "create" ? "Add lead" : "Save profile"}</button><button className="muted" onClick={() => mode === "create" ? setShowCreate(false) : setEditing(false)}>Cancel</button></div>
  </div>;

  return <section className="lead-console">
    <header className="lead-console-head"><div><p>AKKYOS CRM · ADMIN</p><h1>Lead Command Center</h1><span>Every enquiry, next action and deal stage in one focused workspace.</span></div><div><button onClick={() => setShowCreate(true)}>+ Add lead</button><button onClick={() => void loadLeads()} disabled={loading}>Refresh</button><button className="lead-close" onClick={onClose}>Back to website</button></div></header>
    <div className="lead-metrics"><article><span>Total leads</span><strong>{leads.length}</strong><small>All captured enquiries</small></article><article><span>New</span><strong>{stageCounts.new}</strong><small>Needs first contact</small></article><article><span>Follow-ups due</span><strong>{due}</strong><small>Action required</small></article><article><span>Won</span><strong>{stageCounts.won}</strong><small>Converted business</small></article></div>
    <div className="lead-pipeline">{stages.map((item) => <button key={item.value} onClick={() => setStage(item.value)}><span>{item.label}</span><strong>{stageCounts[item.value]}</strong><i style={{ width: `${leads.length ? Math.max(5, stageCounts[item.value] / leads.length * 100) : 0}%` }} /></button>)}</div>
    {showCreate && <div className="lead-create"><div><p>NEW OPPORTUNITY</p><h2>Add lead</h2></div>{form("create")}</div>}
    <div className="lead-toolbar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, business, phone, email, product or source" /><select value={stage} onChange={(e) => setStage(e.target.value as LeadStatus | "all")}><option value="all">All stages</option>{stages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
    {message && <p className="lead-alert">{message}</p>}
    <div className="lead-workspace"><div className="lead-list">{loading ? <div className="lead-empty">Loading leads...</div> : filtered.length === 0 ? <div className="lead-empty">No matching leads yet.</div> : filtered.map((lead) => <button className={selectedId === lead.id ? "active" : ""} onClick={() => { setSelectedId(lead.id); setEditing(false); }} key={lead.id}><span className={`lead-stage stage-${lead.status}`}>{lead.status}</span><strong>{lead.full_name}</strong><small>{lead.business_name || lead.products?.name || "General enquiry"}</small><i>{lead.phone || lead.email || "Contact not supplied"}</i></button>)}</div>
      <aside className="lead-detail">{!selected ? <div className="lead-empty">Select a lead to see full details.</div> : editing ? <>{form("edit")}</> : <>
        <div className="lead-person"><div>{selected.full_name.slice(0, 1).toUpperCase()}</div><span><small>LEAD PROFILE</small><h2>{selected.full_name}</h2><p>{selected.business_name || "Individual enquiry"}</p></span><button className="lead-edit" onClick={startEdit}>Edit profile</button></div>
        <div className="lead-contact-grid"><article><small>Phone</small><strong>{selected.phone || "Not supplied"}</strong></article><article><small>Email</small><strong>{selected.email || "Not supplied"}</strong></article><article><small>Interested product</small><strong>{selected.products?.name || "General enquiry"}</strong></article><article><small>Source / received</small><strong>{selected.source} · {formatDate(selected.created_at)}</strong></article></div>
        {selected.message && <div className="lead-enquiry"><small>CUSTOMER MESSAGE</small><p>{selected.message}</p></div>}
        <label className="lead-field"><span>Deal stage</span><select value={selected.status} disabled={saving} onChange={(e) => void saveLead({ status: e.target.value as LeadStatus })}>{stages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="lead-field"><span>Next follow-up</span><input type="datetime-local" value={selected.next_follow_up_at?.slice(0, 16) || ""} disabled={saving} onChange={(e) => void saveLead({ next_follow_up_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>
        <label className="lead-field"><span>Admin notes / call result</span><textarea key={`${selected.id}-${selected.admin_notes}`} defaultValue={selected.admin_notes || ""} placeholder="Requirement, call result and next action..." onBlur={(e) => { if (e.target.value !== (selected.admin_notes || "")) void saveLead({ admin_notes: e.target.value.trim() || null }); }} /></label>
        <div className="lead-actions">{selected.phone && <a href={`tel:${selected.phone}`}>Call</a>}{selected.phone && <a target="_blank" rel="noreferrer" href={`https://wa.me/${cleanPhone(selected.phone)}`}>WhatsApp</a>}{selected.email && <a href={`mailto:${selected.email}`}>Email</a>}<button className="lead-delete" onClick={() => void deleteLead()} disabled={saving}>Delete</button><span>{saving ? "Saving..." : "Auto-save active"}</span></div>
      </>}</aside></div>
  </section>;
}
