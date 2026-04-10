import { useState } from "react";
import { supabase } from "./supabase";

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#0a0d12;--ink2:#111820;--ink3:#18212c;--line:#1f2d3a;--line2:#243040;--text:#dceaf7;--sub:#5d7a94;--dim:#2e4257;--hi:#38bdf8;--hi2:#818cf8;--green:#34d399;--rose:#f87171;--font:'Epilogue',sans-serif;--mono:'JetBrains Mono',monospace;}
html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}
.shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--ink)}
.card{width:100%;max-width:420px;background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,.4);display:flex;flex-direction:column;gap:16px}
.logo{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:8px}
.logo-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--hi),var(--hi2));display:flex;align-items:center;justify-content:center;font-size:18px}
.logo-text{font:900 20px var(--font);letter-spacing:-.5px}
.logo-text em{color:var(--hi);font-style:normal}
.title{font:700 20px var(--font);text-align:center}
.sub{font-size:13px;color:var(--sub);text-align:center;line-height:1.6}
.field{display:flex;flex-direction:column;gap:6px}
.label{font:600 11px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
.wrap{position:relative;display:flex;align-items:center}
.at{position:absolute;left:14px;color:var(--sub);font:400 14px var(--mono);pointer-events:none}
.inp{background:var(--ink3);border:1px solid var(--line2);border-radius:8px;padding:11px 14px 11px 28px;color:var(--text);font:400 14px var(--font);outline:none;transition:border .15s;width:100%}
.inp:focus{border-color:var(--hi)}
.inp::placeholder{color:var(--dim)}
.btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--hi),var(--hi2));border:none;border-radius:9px;color:#000;font:700 14px var(--font);cursor:pointer;transition:all .2s}
.btn:disabled{opacity:.5;cursor:not-allowed}
.error{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--rose)}
.hint{font-size:11px;margin-top:4px}
`;

export default function SetupUsername({ session, onDone }) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkUsername = async (val) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(clean);
    if (clean.length < 3) { setStatus(null); return; }
    setStatus("checking");
    const { data } = await supabase.from('profiles').select('id').eq('username', clean).maybeSingle();
    setStatus(data ? "taken" : "ok");
  };

  const handleSave = async () => {
    setError("");
    if (username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (status === "taken") { setError("That username is taken."); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.from('profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
        username,
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 10,
        last_reset_month: new Date().getMonth(),
        last_reset_year: new Date().getFullYear(),
      }, { onConflict: 'id' });
      if (err) throw err;
      onDone();
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;700;900&family=JetBrains+Mono:wght@400&display=swap');`}{CSS}</style>
      <div className="shell">
        <div className="card">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <div className="logo-text">Hire<em>IQ</em></div>
          </div>
          <div className="title">One last step!</div>
          <div className="sub">
            Choose a username for your HireIQ account. This lets teammates find and invite you by @username.
          </div>
          {error && <div className="error">⚠ {error}</div>}
          <div className="field">
            <label className="label">Username</label>
            <div className="wrap">
              <span className="at">@</span>
              <input className="inp" placeholder="yourhandle"
                value={username} onChange={e => checkUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus/>
            </div>
            {status === "checking" && <div className="hint" style={{color:"var(--sub)"}}>Checking...</div>}
            {status === "ok" && <div className="hint" style={{color:"var(--green)"}}>✓ @{username} is available</div>}
            {status === "taken" && <div className="hint" style={{color:"var(--rose)"}}>✗ @{username} is taken</div>}
          </div>
          <button className="btn" onClick={handleSave} disabled={loading || status !== "ok"}>
            {loading ? "⟳ Saving..." : "Set Username & Continue →"}
          </button>
        </div>
      </div>
    </>
  );
}
