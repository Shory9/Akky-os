import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type CustomerPortalProps = {
  onClose: () => void;
  onAdminAccess: () => void;
};

type License = {
  id: string;
  license_status: string;
  customer_brand_name: string | null;
  custom_domain: string | null;
  activated_at: string | null;
  expires_at: string | null;
  products: { name: string; category: string | null; logo_url: string | null } | null;
};

export default function CustomerPortal({ onClose, onAdminAccess }: CustomerPortalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);

  const loadCustomer = async (activeUser: User) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", activeUser.id)
      .single();

    if (profile?.role === "admin") {
      await supabase.auth.signOut();
      setMessage("Yeh admin account hai. Neeche Admin Control Room use karein.");
      setUser(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("product_licenses")
      .select("id, license_status, customer_brand_name, custom_domain, activated_at, expires_at, products(name, category, logo_url)")
      .eq("user_id", activeUser.id)
      .order("created_at", { ascending: false });

    setUser(activeUser);
    setName(profile?.full_name || activeUser.user_metadata?.full_name || "AkkyOS Customer");
    setLicenses((data as unknown as License[]) || []);
    setMessage(error ? "Products load nahi ho paaye. Dobara try karein." : "");
    setLoading(false);
  };

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) void loadCustomer(data.session.user);
      else setLoading(false);
    });
  }, []);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setMessage(error?.message || "Login failed. Email aur password check karein.");
      setLoading(false);
      return;
    }
    await loadCustomer(data.user);
  };

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (fullName.trim().length < 2) {
      setMessage("Apna poora naam enter karein.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session?.user) {
      await loadCustomer(data.session.user);
      return;
    }
    setPassword("");
    setMode("signin");
    setMessage("Account ban gaya. Email verify karke Sign In karein.");
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setMessage("Password reset ke liye email enter karein.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    setMessage(error ? error.message : "Password reset email bhej diya gaya hai.");
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setLicenses([]);
    setPassword("");
  };

  return (
    <div className="client-gateway" role="dialog" aria-modal="true" aria-labelledby="client-title">
      <button className="client-close" onClick={onClose} aria-label="Close customer portal">×</button>

      <section className="client-world" aria-hidden="true">
        <div className="client-world-copy">
          <p><span /> YOUR AKKYOS UNIVERSE</p>
          <h2>Everything you own.<br /><em>One living space.</em></h2>
          <small>Products, licenses, branding aur support — ek secure identity ke andar.</small>
        </div>
        <div className="client-core">
          <div className="client-ring ring-alpha" />
          <div className="client-ring ring-beta" />
          <div className="customer-cube">
            <span className="customer-face customer-front">A</span>
            <span className="customer-face customer-back">MY</span>
            <span className="customer-face customer-right">01</span>
            <span className="customer-face customer-left">ID</span>
            <span className="customer-face customer-top">∞</span>
            <span className="customer-face customer-bottom">OS</span>
          </div>
          <b className="client-node node-one">PRODUCTS</b>
          <b className="client-node node-two">LICENSES</b>
          <b className="client-node node-three">SUPPORT</b>
        </div>
        <div className="client-network"><i /> CUSTOMER IDENTITY NETWORK <b>ONLINE</b></div>
      </section>

      <section className="client-panel">
        {!user ? (
          <div className="client-login">
            <div className="client-brand"><span>A</span><div><strong>MY AKKYOS</strong><small>CLIENT PORTAL</small></div></div>
            <p className="client-kicker">ONE ACCOUNT · EVERY PRODUCT</p>
            <h2 id="client-title">{mode === "signin" ? <>Enter your<br />product universe.</> : <>Create your<br />AkkyOS identity.</>}</h2>
            <p className="client-intro">{mode === "signin" ? "Apne purchased software, license aur account ko securely manage karein." : "Ek secure account banayein. Product purchase ke baad isi account mein milega."}</p>
            <div className="client-auth-tabs" role="tablist" aria-label="Customer account options">
              <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>Sign In</button>
              <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create Account</button>
            </div>
            <form onSubmit={mode === "signin" ? signIn : createAccount}>
              {mode === "signup" && <label><span>Full name</span><input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} autoComplete="name" placeholder="Your full name" /></label>}
              <label><span>Customer email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@company.com" /></label>
              <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder={mode === "signin" ? "Enter secure password" : "Minimum 8 characters"} /></label>
              {message && <p className="client-message">{message}</p>}
              <button className="client-submit" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Enter My AkkyOS" : "Create My Account"}<i>↗</i></button>
              {mode === "signin" && <button className="client-reset" type="button" onClick={resetPassword} disabled={loading}>Forgot password?</button>}
            </form>
            <button className="admin-switch" onClick={onAdminAccess}>AkkyOS owner? <strong>Open Admin Control Room →</strong></button>
          </div>
        ) : (
          <div className="client-dashboard">
            <header><div><p>WELCOME BACK</p><h2>{name}</h2><span>{user.email}</span></div><button onClick={signOut}>Sign out</button></header>
            <div className="client-summary"><article><span>{licenses.length.toString().padStart(2, "0")}</span><small>Products owned</small></article><article><span>{licenses.filter((item) => item.license_status === "active").length.toString().padStart(2, "0")}</span><small>Active licenses</small></article></div>
            <div className="owned-products">
              <p>YOUR PRODUCTS</p>
              {licenses.length === 0 ? (
                <div className="empty-vault"><span>◇</span><h3>Your product vault is ready.</h3><p>Purchase approve hone ke baad product yahan automatically dikhega.</p><button onClick={onClose}>Explore products</button></div>
              ) : licenses.map((license) => (
                <article key={license.id} className="owned-product">
                  <div className="owned-icon">{license.products?.logo_url ? <img src={license.products.logo_url} alt="" /> : "A"}</div>
                  <div><small>{license.products?.category || "AKKYOS PRODUCT"}</small><h3>{license.products?.name || "Licensed product"}</h3><p>{license.customer_brand_name || "Brand setup pending"}</p></div>
                  <span className={`license-state ${license.license_status}`}>{license.license_status}</span>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
