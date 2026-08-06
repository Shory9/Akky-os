import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";

type AdminLoginProps = {
  onClose: () => void;
  onAdminAuthenticated: (name: string) => void;
};

export default function AdminLogin({ onClose, onAdminAuthenticated }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", data.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have AkkyOS admin access.");
      setLoading(false);
      return;
    }

    onAdminAuthenticated(profile.full_name || data.user.email || "AkkyOS Admin");
    setLoading(false);
  };

  const resetPassword = async () => {
    setError("");
    if (!email.trim()) {
      setError("Password reset ke liye pehle email enter karein.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/`,
    });
    setLoading(false);
    setError(resetError ? resetError.message : "Password reset email bhej diya gaya hai.");
  };

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
      <section className="auth-scene" aria-hidden="true">
        <div className="gateway-copy">
          <p><span /> AKKYOS IDENTITY LAYER</p>
          <h2>One key.<br /><em>Total control.</em></h2>
          <small>Your secure passage into products, leads, customers and orders.</small>
        </div>
        <div className="gateway-stage">
          <div className="gateway-orbit orbit-outer" />
          <div className="gateway-orbit orbit-inner" />
          <div className="identity-cube">
            <span className="cube-face cube-front">A</span>
            <span className="cube-face cube-back">OS</span>
            <span className="cube-face cube-right">01</span>
            <span className="cube-face cube-left">AK</span>
            <span className="cube-face cube-top">∞</span>
            <span className="cube-face cube-bottom">ID</span>
          </div>
          <span className="scan-line" />
        </div>
        <div className="gateway-status"><i /><span>IDENTITY NETWORK ONLINE</span><b>256-BIT SESSION</b></div>
      </section>
      <div className="auth-panel">
        <button className="auth-close" onClick={onClose} aria-label="Close login">×</button>
        <div className="auth-brand"><span>A</span><div><strong>AKKYOS</strong><small>SECURE ADMIN GATEWAY</small></div></div>
        <p className="auth-kicker">AUTHORISED ACCESS ONLY · NODE 01</p>
        <h2 id="admin-login-title">Enter the<br />control room.</h2>
        <p className="auth-intro">Products, prices, leads, customers aur orders manage karne ke liye sign in karein.</p>

        <form onSubmit={signIn}>
          <label>
            <span>Admin email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="name@akkyos.in" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required minLength={8} placeholder="Enter secure password" />
          </label>
          {error && <p className="auth-message">{error}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Verifying…" : "Enter Admin Console"}<i>↗</i></button>
          <button className="reset-link" type="button" onClick={resetPassword} disabled={loading}>Forgot password?</button>
        </form>
        <div className="auth-security"><i /><span>Protected by Supabase Auth and Row Level Security</span></div>
      </div>
    </div>
  );
}
