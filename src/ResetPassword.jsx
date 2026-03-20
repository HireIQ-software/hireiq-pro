import { useState } from "react";
import { supabase } from "./supabase";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError("");
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => onDone(), 2500);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const CSS = `
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--ink:#0a0d12;--ink2:#111820;--ink3:#18212c;--line:#1f2d3a;--line2:#243040;--text:#dceaf7;--sub:#5d7a94;--hi:#38bdf8;--hi2:#818cf8;--green:#34d399;--rose:#f87171;--font:'Epilogue',sans-serif;--mono:'JetBrains Mono',monospace;}
    html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}
    .shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--ink);}
    .card{width:100%;max-width:400px;background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,0.4);}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;justify-content:center;}
    .logo-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--hi),var(--hi2));display:flex;align-items:center;justify-content:center;font-size:18px;}
    .logo-text{font:900 20px var(--font);letter-spacing:-0.5px}
    .logo-text em{color:var(--hi);font-style:normal}
    .title{font:700 22px var(--font);margin-bottom:6px;text-align:center}
    .sub{font-size:13px;color:var(--sub);text-align:center;margin-bottom:28px;line-height:1.6}
    .field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
    .label{font:600 11px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
    .inp{background:var(--ink3);border:1px solid var(--line2);border-radius:8px;padding:11px 14px;color:var(--text);font:400 14px var(--font);outline:none;transition:border .15s;}
    .inp:focus{border-color:var(--hi);box-shadow:0 0 0 3px rgba(56,189,248,.06)}
    .inp::placeholder{color:#2e4257}
    .btn{width:100%;padding:13px;margin-top:6px;background:linear-gradient(135deg,var(--hi),var(--hi2));border:none;border-radius:9px;color:#000;font:700 14px var(--font);cursor:pointer;transition:all .2s;}
    .btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.2)}
    .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .error{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--rose);margin-bottom:14px;}
    .success{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:16px;font-size:13px;color:var(--green);text-align:center;line-height:1.6;}
  `;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@700;900&family=JetBrains+Mono:wght@400;600&display=swap');`}{CSS}</style>
      <div className="shell">
        <div className="card">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <div className="logo-text">Hire<em>IQ</em></div>
          </div>

          {success ? (
            <div className="success">
              ✓ Password updated successfully!<br/>
              <span style={{fontSize:12,opacity:.7}}>Redirecting you to sign in...</span>
            </div>
          ) : (
            <>
              <div className="title">Set New Password</div>
              <div className="sub">Choose a strong password for your HireIQ account</div>

              {error && <div className="error">⚠ {error}</div>}

              <div className="field">
                <label className="label">New Password</label>
                <input className="inp" type="password" placeholder="Min 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReset()} />
              </div>

              <div className="field">
                <label className="label">Confirm Password</label>
                <input className="inp" type="password" placeholder="Repeat your password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleReset()} />
              </div>

              <button className="btn" onClick={handleReset} disabled={loading}>
                {loading ? "⟳ Updating..." : "Update Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
