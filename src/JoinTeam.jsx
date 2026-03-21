import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#0a0d12;--ink2:#111820;--ink3:#18212c;--line:#1f2d3a;--line2:#243040;--text:#dceaf7;--sub:#5d7a94;--dim:#2e4257;--hi:#38bdf8;--hi2:#818cf8;--green:#34d399;--rose:#f87171;--font:'Epilogue',sans-serif;--mono:'JetBrains Mono',monospace;}
html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}
.shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--ink);background-image:radial-gradient(ellipse at 30% 50%, rgba(56,189,248,0.05) 0%, transparent 60%)}
.card{width:100%;max-width:440px;background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:40px;box-shadow:0 24px 64px rgba(0,0,0,0.4);display:flex;flex-direction:column;gap:16px}
.logo{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:8px}
.logo-icon{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--hi),var(--hi2));display:flex;align-items:center;justify-content:center;font-size:18px}
.logo-text{font:900 20px var(--font);letter-spacing:-0.5px}
.logo-text em{color:var(--hi);font-style:normal}
.team-badge{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.2);border-radius:10px;padding:14px 18px;text-align:center}
.team-name{font:900 20px var(--font);color:var(--hi);margin-bottom:4px}
.team-sub{font-size:12px;color:var(--sub)}
.title{font:700 20px var(--font);text-align:center}
.sub{font-size:13px;color:var(--sub);text-align:center;line-height:1.6}
.field{display:flex;flex-direction:column;gap:6px}
.label{font:600 11px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
.inp{background:var(--ink3);border:1px solid var(--line2);border-radius:8px;padding:11px 14px;color:var(--text);font:400 14px var(--font);outline:none;transition:border .15s}
.inp:focus{border-color:var(--hi);box-shadow:0 0 0 3px rgba(56,189,248,.06)}
.inp::placeholder{color:var(--dim)}
.btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--hi),var(--hi2));border:none;border-radius:9px;color:#000;font:700 14px var(--font);cursor:pointer;transition:all .2s}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.2)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.error{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--rose)}
.success{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:16px;font-size:13px;color:var(--green);text-align:center;line-height:1.6}
`;

export default function JoinTeam({ teamId, onDone }) {
  const [teamInfo, setTeamInfo] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load team info
    const loadTeam = async () => {
      const { data } = await supabase.from('teams').select('name').eq('id', teamId).single();
      if (data) setTeamInfo(data);
    };
    if (teamId) loadTeam();
  }, [teamId]);

  const handleJoin = async () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      // Update user profile with name and password
      const { error: pwErr } = await supabase.auth.updateUser({ password });
      if (pwErr) throw pwErr;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update profile
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: name.trim(),
        plan: 'free',
        analyses_used: 0,
        analyses_limit: 10,
      }, { onConflict: 'id' });

      // Add to team
      if (teamId) {
        await supabase.from('team_members').upsert({
          team_id: teamId,
          user_id: user.id,
          role: 'member',
        }, { onConflict: 'team_id,user_id' });

        await supabase.from('profiles')
          .update({ team_id: teamId })
          .eq('id', user.id);
      }

      setSuccess(true);
      setTimeout(() => onDone(), 2000);
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

          {teamInfo && (
            <div className="team-badge">
              <div className="team-name">👥 {teamInfo.name}</div>
              <div className="team-sub">You've been invited to join this team</div>
            </div>
          )}

          {success ? (
            <div className="success">
              ✓ Welcome to the team!<br/>
              <span style={{fontSize:12,opacity:.7}}>Taking you to HireIQ...</span>
            </div>
          ) : (
            <>
              <div className="title">Complete Your Account</div>
              <div className="sub">Set your name and password to join {teamInfo?.name || "the team"}</div>

              {error && <div className="error">⚠ {error}</div>}

              <div className="field">
                <label className="label">Your Name</label>
                <input className="inp" placeholder="e.g. Alex Johnson"
                  value={name} onChange={e => setName(e.target.value)}/>
              </div>

              <div className="field">
                <label className="label">Set Password</label>
                <input className="inp" type="password" placeholder="Min 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleJoin()}/>
              </div>

              <button className="btn" onClick={handleJoin} disabled={loading}>
                {loading ? "⟳ Joining..." : "Join Team →"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
