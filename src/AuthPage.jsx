import { useState } from "react";
import { supabase } from "./supabase";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@300;400;500;700&display=swap');`;

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --ink:#0a0d12;--ink2:#111820;--ink3:#18212c;
  --line:#1f2d3a;--line2:#243040;
  --text:#dceaf7;--sub:#5d7a94;--dim:#2e4257;
  --hi:#38bdf8;--hi2:#818cf8;--green:#34d399;
  --amber:#fbbf24;--rose:#f87171;
  --font:'Epilogue',sans-serif;--mono:'JetBrains Mono',monospace;
}
html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}

.auth-shell{
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:var(--ink);
  background-image:radial-gradient(ellipse at 20% 50%, rgba(56,189,248,0.04) 0%, transparent 60%),
                   radial-gradient(ellipse at 80% 20%, rgba(129,140,248,0.04) 0%, transparent 60%);
}

.auth-card{
  width:100%;max-width:420px;
  background:var(--ink2);border:1px solid var(--line);
  border-radius:16px;padding:40px;
  box-shadow:0 24px 64px rgba(0,0,0,0.4);
}

.auth-logo{
  display:flex;align-items:center;gap:10px;
  margin-bottom:32px;justify-content:center;
}
.auth-logo-icon{
  width:36px;height:36px;border-radius:9px;
  background:linear-gradient(135deg,var(--hi),var(--hi2));
  display:flex;align-items:center;justify-content:center;font-size:18px;
}
.auth-logo-text{font:900 20px var(--font);letter-spacing:-0.5px}
.auth-logo-text em{color:var(--hi);font-style:normal}

.auth-title{font:700 22px var(--font);margin-bottom:6px;text-align:center}
.auth-sub{font-size:13px;color:var(--sub);text-align:center;margin-bottom:28px;line-height:1.6}

.auth-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.auth-label{font:600 11px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
.auth-inp{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:8px;padding:11px 14px;
  color:var(--text);font:400 14px var(--font);
  outline:none;transition:border .15s;
}
.auth-inp:focus{border-color:var(--hi);box-shadow:0 0 0 3px rgba(56,189,248,.06)}
.auth-inp::placeholder{color:var(--dim)}

.auth-btn{
  width:100%;padding:13px;margin-top:6px;
  background:linear-gradient(135deg,var(--hi),var(--hi2));
  border:none;border-radius:9px;
  color:#000;font:700 14px var(--font);
  cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:8px;
}
.auth-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.2)}
.auth-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

.auth-divider{
  display:flex;align-items:center;gap:12px;
  margin:18px 0;color:var(--dim);font-size:12px;
}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--line)}

.google-btn{
  width:100%;padding:12px;
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:9px;color:var(--text);
  font:600 13px var(--font);cursor:pointer;
  transition:all .15s;display:flex;align-items:center;justify-content:center;gap:10px;
}
.google-btn:hover{border-color:var(--hi);background:var(--ink2)}

.auth-switch{
  text-align:center;margin-top:20px;
  font-size:13px;color:var(--sub);
}
.auth-switch button{
  background:none;border:none;color:var(--hi);
  font:600 13px var(--font);cursor:pointer;
}
.auth-switch button:hover{text-decoration:underline}

.auth-error{
  background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);
  border-radius:8px;padding:10px 14px;
  font-size:12px;color:var(--rose);margin-bottom:14px;line-height:1.5;
}
.auth-success{
  background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);
  border-radius:8px;padding:10px 14px;
  font-size:12px;color:var(--green);margin-bottom:14px;line-height:1.5;
}
`;

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailAuth = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  };

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎯</div>
            <div className="auth-logo-text">Hire<em>IQ</em></div>
          </div>

          <div className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</div>
          <div className="auth-sub">
            {mode === "login"
              ? "Sign in to your HireIQ account"
              : "Start with 10 free AI scorecards per month"}
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}

          {mode === "signup" && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-inp" placeholder="e.g. Alex Johnson" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-inp" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEmailAuth()} />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-inp" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEmailAuth()} />
          </div>

          <button className="auth-btn" onClick={handleEmailAuth} disabled={loading}>
            {loading ? "⟳ Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <div className="auth-divider">or</div>

          <button className="google-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => { setMode("signup"); setError(""); }}>Sign up free</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
