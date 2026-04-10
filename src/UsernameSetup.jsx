import { useState } from "react";
import { supabase } from "./supabase";

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#0a0d12;--ink2:#111820;--ink3:#18212c;--line:#1f2d3a;--line2:#243040;--text:#dceaf7;--sub:#5d7a94;--dim:#2e4257;--hi:#38bdf8;--hi2:#818cf8;--green:#34d399;--rose:#f87171;--font:'Epilogue',sans-serif;--mono:'JetBrains Mono',monospace;}
html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}
.shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--ink)}
.card{width:100%;max-width:420px;background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,0.4);display:flex;flex-direction:column;gap:16px}
.logo{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:4px}
.logo-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--hi),var(--hi2));display:flex;align-items:center;justify-content:center;font-size:18px}
.logo-text{font:900 20px var(--font);letter-spacing:-0.5px}
.logo-text em{color:var(--hi);font-style:normal}
.title{font:700 22px var(--font);text-align:center}
.sub{font-size:13px;color:var(--sub);text-align:center;line-height:1.6}
.field{display:flex;flex-direction:column;gap:6px}
.label{font:600 11px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
.label-hint{font:400 10px var(--mono);color:var(--dim);margin-left:6px;text-transform:none;letter-spacing:0}
.inp-wrap{position:relative}
.prefix{position:absolute;left:14px;top:50%;transform:translateY(-50%);font:400 14px var(--mono);color:var(--sub);pointer-events:none}
.inp{background:var(--ink3);border:1px solid var(--line2);border-radius:8px;padding:11px 14px 11px 28px;color:var(--text);font:400 14px var(--font);outline:none;transition:border .15s;width:100%}
.inp:focus{border-color:var(--hi);box-shadow:0 0 0 3px rgba(56,189,248,.06)}
.inp::placeholder{color:var(--dim)}
.status{font-size:11px;margin-top:4px}
.btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--hi),var(--hi2));border:none;border-radius:9px;color:#000;font:700 14px var(--font);cursor:pointer;transition:all .2s}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.2)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.error{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--rose)}
`;

export default function UsernameSetup({ session, onDone }) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState(null); // null | checking | available | taken
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkUsername = async (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    if (clean.length < 3) { setStatus(null); return; }
    setStatus("checking");
    try {
      const { data } = await supabase
        .from('profiles').select('id').eq('username', clean).maybeSingle();
      setStatus(data ? "taken" : "available");
    } catch {
      setStatus("available");
    }
  };

  const handleSave = async () => {
    if (!username || username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (status === "taken") { setError("That username is taken. Try another."); return; }
    if (status === "checking") { setError("Still checking — please wait."); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        username,
      }, { onConflict: 'id' });
      if (error) throw error;
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&display=swap');`}{CSS}</style>
      <div className="shell">
        <div className="card">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <div className="logo-text">Hire<em>IQ</em></div>
          </div>
          <div className="title">One last thing 👋</div>
          <div className="sub">Choose a username for your HireIQ account. This is how teammates can find and invite you.</div>

          {error && <div className="error">⚠ {error}</div>}

          <div className="field">
            <label className="label">
              Username
              <span className="label-hint">letters, numbers, underscore only</span>
            </label>
            <div className="inp-wrap">
              <span className="prefix">@</span>
              <input className="inp" placeholder="yourhandle"
                value={username} onChange={e => checkUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus/>
            </div>
            {status === "checking" && <div className="status" style={{color:"var(--sub)"}}>Checking...</div>}
            {status === "available" && <div className="status" style={{color:"var(--green)"}}>✓ @{username} is available</div>}
            {status === "taken" && <div className="status" style={{color:"var(--rose)"}}>✗ @{username} is already taken</div>}
          </div>

          <button className="btn" onClick={handleSave}
            disabled={loading || !username || status !== "available"}>
            {loading ? "⟳ Saving..." : "Set Username & Continue →"}
          </button>
        </div>
      </div>
    </>
  );
}
