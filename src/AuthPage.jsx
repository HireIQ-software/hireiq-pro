import { useState } from "react";
import { supabase } from "./supabase";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@300;400;500;700&display=swap');`;

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#0a0d12;--ink2:#111820;--ink3:#18212c;--line:#1f2d3a;--line2:#243040;--text:#dceaf7;--sub:#5d7a94;--dim:#2e4257;--hi:#38bdf8;--hi2:#818cf8;--green:#34d399;--amber:#fbbf24;--rose:#f87171;--font:'Epilogue',sans-serif;--mono:'JetBrains Mono',monospace;}
html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}
.auth-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--ink);background-image:radial-gradient(ellipse at 20% 50%,rgba(56,189,248,.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(129,140,248,.04) 0%,transparent 60%)}
.auth-card{width:100%;max-width:420px;background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,.4)}
.auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;justify-content:center}
.auth-logo-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--hi),var(--hi2));display:flex;align-items:center;justify-content:center;font-size:18px}
.auth-logo-text{font:900 20px var(--font);letter-spacing:-.5px}
.auth-logo-text em{color:var(--hi);font-style:normal}
.auth-title{font:700 22px var(--font);margin-bottom:6px;text-align:center}
.auth-sub{font-size:13px;color:var(--sub);text-align:center;margin-bottom:28px;line-height:1.6}
.auth-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.auth-label{font:600 11px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
.auth-label-hint{font:400 10px var(--mono);color:var(--dim);margin-left:6px;text-transform:none;letter-spacing:0}
.auth-inp{background:var(--ink3);border:1px solid var(--line2);border-radius:8px;padding:11px 14px;color:var(--text);font:400 14px var(--font);outline:none;transition:border .15s;width:100%}
.auth-inp:focus{border-color:var(--hi);box-shadow:0 0 0 3px rgba(56,189,248,.06)}
.auth-inp::placeholder{color:var(--dim)}
.auth-inp.taken{border-color:var(--rose)}
.auth-btn{width:100%;padding:13px;margin-top:6px;background:linear-gradient(135deg,var(--hi),var(--hi2));border:none;border-radius:9px;color:#000;font:700 14px var(--font);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center}
.auth-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.2)}
.auth-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.auth-divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--dim);font-size:12px}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--line)}
.google-btn{width:100%;padding:12px;background:var(--ink3);border:1px solid var(--line2);border-radius:9px;color:var(--text);font:600 13px var(--font);cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:10px}
.google-btn:hover{border-color:var(--hi);background:var(--ink2)}
.auth-switch{text-align:center;margin-top:20px;font-size:13px;color:var(--sub)}
.auth-switch button{background:none;border:none;color:var(--hi);font:600 13px var(--font);cursor:pointer}
.auth-switch button:hover{text-decoration:underline}
.auth-error{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--rose);margin-bottom:14px;line-height:1.5}
.auth-success{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--green);margin-bottom:14px;line-height:1.5}
.forgot-link{background:none;border:none;color:var(--sub);font:400 12px var(--font);cursor:pointer;text-align:right;margin-top:-8px;margin-bottom:10px;display:block;transition:.15s}
.forgot-link:hover{color:var(--hi)}
.u-wrap{position:relative;display:flex;align-items:center}
.u-at{position:absolute;left:14px;color:var(--sub);font:400 14px var(--mono);pointer-events:none;z-index:1}
.u-inp{padding-left:28px !important}
.u-status{font-size:11px;margin-top:4px}
`;

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [uStatus, setUStatus] = useState(null); // null | checking | ok | taken
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checkUsername = async (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    if (clean.length < 3) { setUStatus(null); return; }
    setUStatus("checking");
    const { data } = await supabase.from('profiles').select('id').eq('username', clean).maybeSingle();
    setUStatus(data ? "taken" : "ok");
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email.trim() || !password) { setError("Please fill in all fields."); return; }
    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your name."); return; }
      if (username.length < 3) { setError("Username must be at least 3 characters."); return; }
      if (uStatus === "taken") { setError("That username is taken. Try another."); return; }
      if (uStatus === "checking") { setError("Still checking username, please wait."); return; }
    }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), username } }
        });
        if (signUpErr) throw signUpErr;
        // Immediately save username to profiles
        if (data?.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email.trim(),
            full_name: name.trim(),
            username,
            analyses_used: 0,
            analyses_limit: 10,
            plan: 'free',
            last_reset_month: new Date().getMonth(),
            last_reset_year: new Date().getFullYear(),
          }, { onConflict: 'id' });
        }
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      } else {
        // Sign out stale session first
        await supabase.auth.signOut();
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(), password
        });
        if (signInErr) throw signInErr;
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
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" } // Fix 3: force account picker
      }
    });
    if (error) setError(error.message);
  };

  const handleReset = async () => {
    setError(""); setSuccess("");
    if (!email.trim()) { setError("Enter your email first."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess("Reset link sent! Check your inbox.");
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const reset = (newMode) => { setMode(newMode); setError(""); setSuccess(""); };

  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">🎯</div>
            <div className="auth-logo-text">Hire<em>IQ</em></div>
          </div>

          <div className="auth-title">
            {mode==="login"?"Welcome back":mode==="signup"?"Create your account":"Reset Password"}
          </div>
          <div className="auth-sub">
            {mode==="login"?"Sign in to your HireIQ account"
            :mode==="signup"?"Start scoring candidates with AI — free"
            :"We'll send a reset link to your email"}
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}

          {mode==="signup" && <>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-inp" placeholder="e.g. Alex Johnson"
                value={name} onChange={e=>setName(e.target.value)}/>
            </div>
            <div className="auth-field">
              <label className="auth-label">
                Username
                <span className="auth-label-hint">letters, numbers, _ only</span>
              </label>
              <div className="u-wrap">
                <span className="u-at">@</span>
                <input className={`auth-inp u-inp ${uStatus==="taken"?"taken":""}`}
                  placeholder="yourhandle"
                  value={username}
                  onChange={e=>checkUsername(e.target.value)}/>
              </div>
              {uStatus==="checking" && <div className="u-status" style={{color:"var(--sub)"}}>Checking...</div>}
              {uStatus==="ok" && <div className="u-status" style={{color:"var(--green)"}}>✓ @{username} is available</div>}
              {uStatus==="taken" && <div className="u-status" style={{color:"var(--rose)"}}>✗ @{username} is taken</div>}
            </div>
          </>}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-inp" type="email" placeholder="you@company.com"
              value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&(mode==="reset"?handleReset():handleSubmit())}/>
          </div>

          {mode!=="reset" && (
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input className="auth-inp" type="password" placeholder="Min 6 characters"
                value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
            </div>
          )}

          {mode==="login" && (
            <button className="forgot-link" onClick={()=>reset("reset")}>Forgot password?</button>
          )}

          {mode==="reset"
            ? <button className="auth-btn" onClick={handleReset} disabled={loading}>{loading?"⟳ Sending...":"Send Reset Link"}</button>
            : <button className="auth-btn" onClick={handleSubmit} disabled={loading}>{loading?"⟳ Please wait...":mode==="login"?"Sign In":"Create Account"}</button>
          }

          {mode!=="reset" && <>
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
          </>}

          <div className="auth-switch">
            {mode==="login" && <>Don't have an account? <button onClick={()=>reset("signup")}>Sign up free</button></>}
            {mode==="signup" && <>Already have an account? <button onClick={()=>reset("login")}>Sign in</button></>}
            {mode==="reset" && <>Remember it? <button onClick={()=>reset("login")}>Back to Sign In</button></>}
          </div>
        </div>
      </div>
    </>
  );
}
