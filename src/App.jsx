import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

/* ─── FONTS ─────────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@300;400;500;700&display=swap');`;

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --ink:#0a0d12;
  --ink2:#111820;
  --ink3:#18212c;
  --line:#1f2d3a;
  --line2:#243040;
  --text:#dceaf7;
  --sub:#5d7a94;
  --dim:#2e4257;
  --hi:#38bdf8;
  --hi2:#818cf8;
  --green:#34d399;
  --amber:#fbbf24;
  --rose:#f87171;
  --violet:#a78bfa;
  --font:'Epilogue',sans-serif;
  --mono:'JetBrains Mono',monospace;
}
html,body,#root{height:100%;background:var(--ink);color:var(--text);font-family:var(--font)}

/* scrollbar */
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px}

/* layout */
.shell{display:flex;flex-direction:column;height:100vh;overflow:hidden}

/* ── NAV ── */
.nav{
  display:flex;align-items:center;gap:0;
  background:var(--ink2);border-bottom:1px solid var(--line);
  height:52px;padding:0 20px;flex-shrink:0;
}
.nav-brand{
  font-size:17px;font-weight:900;letter-spacing:-0.5px;
  margin-right:32px;white-space:nowrap;
}
.nav-brand em{color:var(--hi);font-style:normal}
.nav-tabs{display:flex;gap:2px;flex:1}
.nav-tab{
  display:flex;align-items:center;gap:7px;
  padding:6px 14px;border-radius:6px;border:none;
  background:none;color:var(--sub);
  font:500 12px/1 var(--font);letter-spacing:.5px;
  cursor:pointer;transition:all .15s;white-space:nowrap;
}
.nav-tab:hover{color:var(--text);background:var(--ink3)}
.nav-tab.active{color:var(--hi);background:rgba(56,189,248,.08)}
.nav-tab .dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--line2);flex-shrink:0;transition:.15s;
}
.nav-tab.active .dot{background:var(--hi)}
.nav-right{display:flex;align-items:center;gap:10px;margin-left:auto}
.cand-count{
  font:500 11px var(--mono);
  background:rgba(56,189,248,.1);color:var(--hi);
  border:1px solid rgba(56,189,248,.2);
  padding:3px 10px;border-radius:20px;
}

/* ── VIEWS ── */
.view{flex:1;overflow:hidden;display:none}
.view.active{display:flex}

/* ── ANALYZE VIEW ── */
.analyze-layout{flex:1;display:grid;grid-template-columns:380px 1fr;overflow:hidden}
.left-col{
  display:flex;flex-direction:column;
  border-right:1px solid var(--line);
  background:var(--ink2);overflow:hidden;
}
.right-col{display:flex;flex-direction:column;overflow:hidden;background:var(--ink)}

/* panel heads */
.phead{
  padding:14px 20px;border-bottom:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
}
.phead-title{font:700 11px var(--mono);letter-spacing:2px;text-transform:uppercase;color:var(--sub)}
.phead-action{
  font:500 11px var(--mono);color:var(--hi);
  background:none;border:none;cursor:pointer;
  display:flex;align-items:center;gap:5px;
}
.phead-action:hover{opacity:.7}

/* form */
.form-scroll{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:14px}
.field{display:flex;flex-direction:column;gap:6px}
.label{font:500 10px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--hi)}
.inp,.sel{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:7px;padding:10px 12px;
  color:var(--text);font:400 13px var(--font);
  outline:none;width:100%;transition:border .15s;
}
.inp:focus,.sel:focus{border-color:var(--hi);box-shadow:0 0 0 3px rgba(56,189,248,.06)}
.inp::placeholder{color:var(--dim)}
textarea.inp{resize:none;line-height:1.65;min-height:110px}
.sel option{background:var(--ink3)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}

/* mic area */
.mic-row{display:flex;gap:8px;align-items:flex-start}
.mic-btn{
  flex-shrink:0;width:38px;height:38px;border-radius:8px;border:1px solid var(--line2);
  background:var(--ink3);color:var(--sub);font-size:16px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;margin-top:0;
}
.mic-btn:hover{border-color:var(--hi);color:var(--hi)}
.mic-btn.recording{border-color:var(--rose);color:var(--rose);animation:micPulse 1s infinite}
@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.4)}50%{box-shadow:0 0 0 6px rgba(248,113,113,0)}}

/* skill dots */
.skill-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.skill-chip{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:7px;padding:9px 11px;
  display:flex;align-items:center;justify-content:space-between;
}
.skill-chip-name{font-size:11px;color:var(--text)}
.dots{display:flex;gap:3px}
.d{
  width:7px;height:7px;border-radius:50%;
  background:var(--line2);cursor:pointer;transition:.1s;
}
.d.on-1{background:var(--rose)}
.d.on-2{background:var(--amber)}
.d.on-3{background:var(--amber)}
.d.on-4{background:var(--green)}
.d.on-5{background:var(--green)}

/* analyze btn */
.analyze-btn{
  margin:0 20px 16px;padding:13px;
  background:linear-gradient(135deg,var(--hi),var(--hi2));
  border:none;border-radius:9px;
  color:#000;font:700 14px var(--font);letter-spacing:.3px;
  cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;
}
.analyze-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.2)}
.analyze-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}

/* results */
.results-scroll{flex:1;overflow-y:auto;padding:20px}
.empty{
  height:100%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:12px;color:var(--sub);text-align:center;
}
.empty-icon{font-size:44px;opacity:.3}
.empty-h{font:700 16px var(--font);color:var(--text);opacity:.2}
.empty-p{font-size:12px;max-width:220px;line-height:1.6;opacity:.6}

/* loading */
.loading{
  height:100%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:18px;
}
.spin-ring{
  width:60px;height:60px;border-radius:50%;
  border:2px solid var(--line2);border-top-color:var(--hi);
  animation:spin 1s linear infinite;font-size:22px;
  display:flex;align-items:center;justify-content:center;
}
@keyframes spin{to{transform:rotate(360deg)}}
.load-label{font:500 12px var(--mono);color:var(--hi);letter-spacing:1px}
.load-steps{display:flex;flex-direction:column;gap:6px}
.ls{font:400 11px var(--mono);color:var(--sub);opacity:0;animation:fadeUp .4s forwards}
.ls:nth-child(1){animation-delay:.3s}.ls:nth-child(2){animation-delay:.9s}
.ls:nth-child(3){animation-delay:1.5s}.ls:nth-child(4){animation-delay:2.1s}
.ls:nth-child(5){animation-delay:2.7s}
@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:.8;transform:none}}

/* result blocks */
.rblock{margin-bottom:18px;animation:riseIn .35s ease both}
@keyframes riseIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.rblock:nth-child(2){animation-delay:.08s}
.rblock:nth-child(3){animation-delay:.16s}
.rblock:nth-child(4){animation-delay:.24s}
.rblock:nth-child(5){animation-delay:.32s}
.rblock:nth-child(6){animation-delay:.40s}
.rblock:nth-child(7){animation-delay:.48s}

.rlabel{
  font:700 10px var(--mono);letter-spacing:2px;text-transform:uppercase;
  color:var(--sub);margin-bottom:8px;display:flex;align-items:center;gap:8px;
}
.rlabel::after{content:'';flex:1;height:1px;background:var(--line)}

/* hero score */
.hero-score{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:12px;padding:18px 20px;
  display:flex;align-items:center;gap:18px;
}
.score-ring{
  width:76px;height:76px;border-radius:50%;flex-shrink:0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font:900 26px var(--font);border:3px solid;
}
.score-ring.hi{color:var(--green);border-color:var(--green);background:rgba(52,211,153,.06)}
.score-ring.mid{color:var(--amber);border-color:var(--amber);background:rgba(251,191,36,.06)}
.score-ring.lo{color:var(--rose);border-color:var(--rose);background:rgba(248,113,113,.06)}
.score-sub{font:500 9px var(--mono);opacity:.5;margin-top:2px}
.score-right{flex:1}
.verdict{font:700 17px var(--font);margin-bottom:5px}
.summary{font-size:12.5px;color:var(--sub);line-height:1.65}

/* bias alert */
.bias-alert{
  background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);
  border-radius:10px;padding:12px 16px;
  display:flex;gap:12px;align-items:flex-start;
}
.bias-icon{font-size:18px;flex-shrink:0;margin-top:1px}
.bias-text{font-size:12px;color:var(--amber);line-height:1.6}
.bias-text strong{display:block;margin-bottom:3px;font-weight:700}

/* contradiction alert */
.contra-alert{
  background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2);
  border-radius:10px;padding:12px 16px;
  display:flex;gap:12px;align-items:flex-start;
}
.contra-text{font-size:12px;color:var(--rose);line-height:1.6}
.contra-text strong{display:block;margin-bottom:3px;font-weight:700}

/* card */
.card{background:var(--ink2);border:1px solid var(--line);border-radius:10px;padding:16px}

/* skill bars */
.bar-list{display:flex;flex-direction:column;gap:10px}
.bar-item{display:flex;flex-direction:column;gap:4px}
.bar-head{display:flex;justify-content:space-between}
.bar-name{font-size:12px}
.bar-val{font:500 11px var(--mono);color:var(--hi)}
.bar-track{height:3px;background:var(--line);border-radius:2px;overflow:hidden}
.bar-fill{height:100%;border-radius:2px;transition:width 1.2s cubic-bezier(.2,1,.4,1)}

/* bullet lists */
.blist{list-style:none;display:flex;flex-direction:column;gap:9px}
.blist li{font-size:12.5px;line-height:1.6;display:flex;gap:10px;align-items:flex-start}
.bl{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:5px}
.bl.g{background:var(--green)}.bl.r{background:var(--rose)}.bl.a{background:var(--amber)}

/* JD match bar */
.jd-match{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.jd-match-label{font:700 28px var(--font)}
.jd-match-sub{font-size:12px;color:var(--sub);line-height:1.5}

/* email */
.email-card{background:var(--ink2);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.email-tabs{display:flex;border-bottom:1px solid var(--line)}
.etab{
  flex:1;padding:10px 8px;background:none;border:none;
  font:600 10px var(--mono);letter-spacing:1px;text-transform:uppercase;
  color:var(--sub);cursor:pointer;transition:.15s;
}
.etab.on{color:var(--hi);background:rgba(56,189,248,.05);border-bottom:2px solid var(--hi)}
.email-body{padding:14px 16px;font-size:12.5px;line-height:1.8;color:var(--text);white-space:pre-wrap;max-height:200px;overflow-y:auto}
.email-foot{padding:8px 14px 12px;display:flex;gap:8px}
.copy-btn{
  padding:6px 14px;background:none;border:1px solid var(--line2);
  border-radius:6px;color:var(--sub);font:500 10px var(--mono);
  letter-spacing:1px;cursor:pointer;transition:.15s;
}
.copy-btn:hover{border-color:var(--hi);color:var(--hi)}
.copy-btn.copied{border-color:var(--green);color:var(--green)}

/* save btn */
.save-btn{
  padding:7px 16px;background:rgba(52,211,153,.1);
  border:1px solid rgba(52,211,153,.25);
  border-radius:6px;color:var(--green);font:600 11px var(--mono);
  letter-spacing:.5px;cursor:pointer;transition:.15s;
}
.save-btn:hover{background:rgba(52,211,153,.18)}

/* ── COMPARE VIEW ── */
.compare-view{flex:1;display:flex;flex-direction:column;overflow:hidden}
.compare-head{padding:16px 24px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.compare-title{font:700 13px var(--mono);letter-spacing:2px;text-transform:uppercase;color:var(--sub)}
.compare-grid{flex:1;overflow:auto;padding:20px 24px;display:flex;flex-direction:column;gap:20px}

.compare-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--sub)}

.cand-cards{display:grid;gap:16px}
.cand-card{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:12px;overflow:hidden;transition:.2s;
}
.cand-card:hover{border-color:var(--line2)}
.cand-card.winner{border-color:rgba(52,211,153,.4)}
.ccard-head{
  padding:14px 18px;display:flex;align-items:center;gap:14px;
  border-bottom:1px solid var(--line);
}
.ccard-avatar{
  width:40px;height:40px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font:700 16px var(--font);flex-shrink:0;
}
.ccard-info{flex:1}
.ccard-name{font:700 15px var(--font)}
.ccard-role{font-size:11px;color:var(--sub);margin-top:2px}
.ccard-score-badge{
  font:900 22px var(--font);
  width:52px;height:52px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;border:2px solid;flex-shrink:0;
}
.winner-crown{font-size:13px;margin-bottom:-2px}

.ccard-body{padding:14px 18px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mini-bars{display:flex;flex-direction:column;gap:6px}
.mini-bar{display:flex;align-items:center;gap:8px}
.mini-bar-name{font-size:11px;color:var(--sub);width:90px;flex-shrink:0}
.mini-bar-track{flex:1;height:3px;background:var(--line);border-radius:2px;overflow:hidden}
.mini-bar-fill{height:100%;border-radius:2px}
.mini-bar-val{font:500 10px var(--mono);color:var(--sub);width:24px;text-align:right;flex-shrink:0}

.ccard-meta{display:flex;flex-direction:column;gap:8px}
.meta-row{display:flex;justify-content:space-between;align-items:center}
.meta-key{font-size:11px;color:var(--sub)}
.meta-val{font:600 12px var(--mono)}
.verdict-chip{
  display:inline-block;padding:2px 8px;border-radius:4px;
  font:700 10px var(--mono);letter-spacing:.5px;
}

/* ── PIPELINE VIEW ── */
.pipeline-view{flex:1;overflow:auto;padding:20px 24px;display:flex;flex-direction:column;gap:20px}
.pipeline-head{display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.pipeline-title{font:700 13px var(--mono);letter-spacing:2px;text-transform:uppercase;color:var(--sub)}
.pipeline-table{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:12px;overflow:hidden;
}
.ptable{width:100%;border-collapse:collapse}
.ptable th{
  padding:11px 16px;text-align:left;
  font:700 10px var(--mono);letter-spacing:1.5px;text-transform:uppercase;color:var(--sub);
  border-bottom:1px solid var(--line);background:var(--ink3);
}
.ptable td{
  padding:12px 16px;font-size:13px;
  border-bottom:1px solid var(--line);
}
.ptable tr:last-child td{border-bottom:none}
.ptable tr:hover td{background:var(--ink3)}
.status-chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;border-radius:20px;
  font:600 10px var(--mono);letter-spacing:.5px;
}

/* score number */
.score-num{font:700 14px var(--mono)}

/* toast */
.toast{
  position:fixed;bottom:24px;right:24px;z-index:9999;
  background:var(--ink2);border:1px solid var(--line2);
  border-radius:10px;padding:12px 18px;
  font:500 13px var(--font);color:var(--text);
  display:flex;align-items:center;gap:10px;
  box-shadow:0 8px 32px rgba(0,0,0,.4);
  animation:toastIn .3s ease;
}
@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

/* misc */
.tag{
  display:inline-block;padding:2px 8px;border-radius:4px;
  font:600 10px var(--mono);
}
.divider{height:1px;background:var(--line);margin:4px 0}

/* ── SKILLS EDITOR ── */
.skills-preset-row{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
.preset-btn{
  padding:3px 10px;border-radius:20px;border:1px solid var(--line2);
  background:none;color:var(--sub);font:500 10px var(--mono);
  letter-spacing:.5px;cursor:pointer;transition:.15s;text-transform:uppercase;
}
.preset-btn:hover{border-color:var(--hi);color:var(--hi)}
.preset-btn.active{border-color:var(--hi);color:var(--hi);background:rgba(56,189,248,.08)}
.skill-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.skill-tag{
  display:flex;align-items:center;gap:5px;
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:6px;padding:5px 10px;
  font-size:12px;color:var(--text);
}
.skill-tag-dots{display:flex;gap:3px;margin-left:4px}
.skill-tag-remove{
  background:none;border:none;color:var(--dim);
  cursor:pointer;font-size:14px;line-height:1;
  padding:0 0 0 4px;transition:.15s;
}
.skill-tag-remove:hover{color:var(--rose)}
.add-skill-row{display:flex;gap:6px}
.add-skill-inp{
  flex:1;background:var(--ink3);border:1px solid var(--line2);
  border-radius:6px;padding:7px 10px;
  color:var(--text);font:400 12px var(--font);outline:none;
  transition:border .15s;
}
.add-skill-inp:focus{border-color:var(--hi)}
.add-skill-inp::placeholder{color:var(--dim)}
.add-skill-btn{
  padding:7px 12px;background:rgba(56,189,248,.1);
  border:1px solid rgba(56,189,248,.25);border-radius:6px;
  color:var(--hi);font:600 12px var(--mono);cursor:pointer;
  transition:.15s;white-space:nowrap;
}
.add-skill-btn:hover{background:rgba(56,189,248,.18)}
.clarify-note{
  font:400 10px var(--mono);color:var(--dim);
  background:var(--ink3);border:1px solid var(--line);
  border-radius:6px;padding:7px 10px;line-height:1.6;margin-top:2px;
}
.clarify-note strong{color:var(--sub)}
`;

/* ─── CONSTANTS ─────────────────────────────────────────────────────────── */
const DEFAULT_SKILLS = ["Communication","Technical","Problem Solving","Culture Fit","Leadership","Adaptability"];

const ROLE_SKILL_PRESETS = {
  "engineering":  ["Technical","Problem Solving","Communication","System Design","Code Quality","Adaptability"],
  "design":       ["Creativity","Communication","User Empathy","Technical","Attention to Detail","Culture Fit"],
  "sales":        ["Communication","Persuasion","Resilience","Product Knowledge","Culture Fit","Leadership"],
  "marketing":    ["Creativity","Communication","Analytical Thinking","Culture Fit","Adaptability","Leadership"],
  "management":   ["Leadership","Communication","Strategic Thinking","Culture Fit","Decision Making","Empathy"],
  "data":         ["Technical","Analytical Thinking","Communication","Problem Solving","Attention to Detail","Adaptability"],
  "custom":       [...DEFAULT_SKILLS],
};

const VERDICT_COLORS = {
  "Strong Hire":  { bg:"rgba(52,211,153,.1)",  border:"rgba(52,211,153,.3)",  text:"var(--green)" },
  "Lean Hire":    { bg:"rgba(56,189,248,.08)", border:"rgba(56,189,248,.25)", text:"var(--hi)" },
  "Borderline":   { bg:"rgba(251,191,36,.08)", border:"rgba(251,191,36,.25)", text:"var(--amber)" },
  "Lean No Hire": { bg:"rgba(248,113,113,.08)",border:"rgba(248,113,113,.25)",text:"var(--rose)" },
  "No Hire":      { bg:"rgba(248,113,113,.1)", border:"rgba(248,113,113,.3)", text:"var(--rose)" },
};

const AVATARS = ["🧑‍💼","👩‍💻","🧑‍🔬","👨‍🎨","👩‍🚀","🧑‍⚕️","👨‍🏫","👩‍🔧"];
const AV_BG   = ["#1e3a5f","#1a3a2a","#3a1a3a","#3a2a1a","#1a2a3a","#2a1a3a","#1a3a35","#3a1a1a"];

function scoreClass(s){ return s>=75?"hi":s>=50?"mid":"lo" }
function barColor(s){ return s>=75?"var(--green)":s>=50?"var(--amber)":"var(--rose)" }

/* ─── MAIN ──────────────────────────────────────────────────────────────── */
export default function HireIQPro({ session }) {
  const [tab, setTab] = useState("analyze");
  const [form, setForm] = useState({
    role:"", jd:"", candidate:"", notes:"", seniority:"mid"
  });
  const [skillsList, setSkillsList] = useState([...DEFAULT_SKILLS]);
  const [skills, setSkills] = useState(Object.fromEntries(DEFAULT_SKILLS.map(s=>[s,0])));
  const [activePreset, setActivePreset] = useState("custom");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emailTab, setEmailTab] = useState("advance");
  const [copied, setCopied] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [toast, setToast] = useState(null);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [profile, setProfile] = useState(null);

  // Load user profile + usage
  useEffect(() => {
    if (!session) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) setProfile(data);
    };
    loadProfile();
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const incrementUsage = async () => {
    if (!session) return;
    const newCount = (profile?.analyses_used || 0) + 1;
    await supabase.from('profiles').update({ analyses_used: newCount }).eq('id', session.user.id);
    setProfile(p => ({ ...p, analyses_used: newCount }));
  };

  const isLimitReached = () => {
    if (!profile) return false;
    return (profile.analyses_used || 0) >= (profile.analyses_limit || 10);
  };

  /* mic transcription */
  const toggleMic = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast("⚠️ Mic not supported in this browser");
      return;
    }
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = "en-US";
      r.onresult = e => {
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        }
        if (final) setForm(f => ({ ...f, notes: f.notes + final }));
      };
      r.onerror = () => setRecording(false);
      r.onend = () => setRecording(false);
      recognitionRef.current = r;
      r.start();
      setRecording(true);
    }
  }, [recording]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const setSkill = (name, val) => setSkills(s=>({...s,[name]:val===s[name]?0:val}));

  const applyPreset = (presetKey) => {
    const list = ROLE_SKILL_PRESETS[presetKey] || DEFAULT_SKILLS;
    setSkillsList([...list]);
    setSkills(Object.fromEntries(list.map(s=>[s,0])));
    setActivePreset(presetKey);
  };

  const addSkill = () => {
    const name = newSkillInput.trim();
    if (!name || skillsList.includes(name)) return;
    setSkillsList(l=>[...l, name]);
    setSkills(s=>({...s,[name]:0}));
    setNewSkillInput("");
    setActivePreset("custom");
  };

  const removeSkill = (name) => {
    setSkillsList(l=>l.filter(s=>s!==name));
    setSkills(s=>{ const n={...s}; delete n[name]; return n; });
  };

  /* ── ANALYZE ── */
  const analyze = async () => {
    if (!form.notes.trim() || !form.role.trim()) return;
    if (isLimitReached()) { showToast("⚠️ Monthly limit reached — upgrade to continue"); return; }
    setLoading(true); setResult(null);

    const ratingsText = skillsList.map(s=>`${s}: ${skills[s]||0}/5 (recruiter gut rating)`).join(", ");
    const skillsJson = skillsList.map(s=>`"${s}":<0-100>`).join(",");

    const prompt = `You are a senior recruiting analyst. Analyze this interview and return ONLY valid JSON, no markdown.

Role: ${form.role}
Seniority: ${form.seniority}
Candidate: ${form.candidate || "Unknown"}
Job Description: ${form.jd || "Not provided"}
Recruiter gut ratings (1-5): ${ratingsText}
Interview Notes:
${form.notes}

The skillScores are YOUR objective AI scores (0-100) from evidence in notes — not the recruiter ratings.

Return EXACTLY this JSON:
{
  "overallScore": <0-100>,
  "jdMatchScore": <0-100 or null>,
  "verdict": "<Strong Hire|Lean Hire|Borderline|Lean No Hire|No Hire>",
  "summary": "<2-3 sentence assessment>",
  "strengths": ["s1","s2","s3"],
  "concerns": ["c1","c2"],
  "contradictions": [],
  "biasFlags": [],
  "skillScores": {${skillsJson}},
  "gutVsAiFlags": [],
  "nextSteps": ["s1","s2","s3"],
  "advanceEmail": "<advance email>",
  "rejectEmail": "<rejection email>",
  "holdEmail": "<hold email>",
  "followUpQuestions": ["q1","q2","q3"]
}`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      await incrementUsage();
    } catch(e) {
      setResult({error:true});
    }
    setLoading(false);
  };

  const saveCandidate = () => {
    if (!result || result.error) return;
    const idx = candidates.findIndex(c=>c.name===form.candidate && c.role===form.role);
    const entry = {
      name: form.candidate || `Candidate ${candidates.length+1}`,
      role: form.role,
      score: result.overallScore,
      verdict: result.verdict,
      jdMatch: result.jdMatchScore,
      skillScores: result.skillScores,
      summary: result.summary,
      savedAt: new Date().toLocaleTimeString(),
      avatarIdx: (candidates.length) % AVATARS.length,
    };
    if (idx>=0) { const nc=[...candidates]; nc[idx]=entry; setCandidates(nc); }
    else setCandidates(c=>[...c, entry]);
    showToast(`✓ ${entry.name} saved to pipeline`);
  };

  const copyEmail = () => {
    const emails = {advance:result?.advanceEmail, reject:result?.rejectEmail, hold:result?.holdEmail};
    navigator.clipboard.writeText(emails[emailTab]||"");
    setCopied(emailTab); setTimeout(()=>setCopied(""),2000);
  };

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{FONTS}{CSS}</style>
      <div className="shell">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-brand">Hire<em>IQ</em> <span style={{fontWeight:300,fontSize:12,color:"var(--sub)"}}>Pro</span></div>
          <div className="nav-tabs">
            {[
              {id:"analyze", label:"Analyze Interview", icon:"⚡"},
              {id:"compare", label:"Compare Candidates", icon:"⚖️"},
              {id:"pipeline",label:"Pipeline", icon:"📊"},
            ].map(t=>(
              <button key={t.id} className={`nav-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
                <span className="dot"/>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            {candidates.length>0 && (
              <div className="cand-count">{candidates.length} candidate{candidates.length!==1?"s":""} tracked</div>
            )}
            {profile && (
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{
                  fontFamily:"var(--mono)",fontSize:11,
                  background: isLimitReached() ? "rgba(248,113,113,.1)" : "rgba(56,189,248,.08)",
                  color: isLimitReached() ? "var(--rose)" : "var(--hi)",
                  border: `1px solid ${isLimitReached() ? "rgba(248,113,113,.25)" : "rgba(56,189,248,.2)"}`,
                  padding:"3px 10px",borderRadius:20,
                }}>
                  {isLimitReached() ? "⚠ Limit reached" : `${profile.analyses_used||0}/${profile.analyses_limit||10} analyses`}
                </div>
                <div style={{fontSize:11,color:"var(--sub)",fontFamily:"var(--mono)"}}>
                  {session?.user?.email?.split("@")[0]}
                </div>
                <button onClick={signOut} style={{
                  background:"none",border:"1px solid var(--line2)",
                  borderRadius:6,padding:"4px 10px",
                  color:"var(--sub)",fontFamily:"var(--mono)",fontSize:10,
                  cursor:"pointer",letterSpacing:1,transition:".15s"
                }}
                onMouseOver={e=>e.target.style.color="var(--rose)"}
                onMouseOut={e=>e.target.style.color="var(--sub)"}
                >SIGN OUT</button>
              </div>
            )}
          </div>
        </nav>

        {/* ── ANALYZE ── */}
        <div className={`view active`} style={{display: tab==="analyze"?"flex":"none"}}>
          <div className="analyze-layout">

            {/* LEFT */}
            <div className="left-col">
              <div className="phead">
                <span className="phead-title">Interview Input</span>
                <button className="phead-action" onClick={()=>{setForm({role:"",jd:"",candidate:"",notes:"",seniority:"mid"});setSkillsList([...DEFAULT_SKILLS]);setSkills(Object.fromEntries(DEFAULT_SKILLS.map(s=>[s,0])));setActivePreset("custom");setResult(null);}}>↺ Reset</button>
              </div>
              <div className="form-scroll">

                <div className="row2">
                  <div className="field">
                    <label className="label">Role</label>
                    <input className="inp" placeholder="e.g. Sr. Engineer" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}/>
                  </div>
                  <div className="field">
                    <label className="label">Seniority</label>
                    <select className="sel inp" value={form.seniority} onChange={e=>setForm(f=>({...f,seniority:e.target.value}))}>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead / Staff</option>
                      <option value="exec">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Candidate Name</label>
                  <input className="inp" placeholder="e.g. Alex Chen" value={form.candidate} onChange={e=>setForm(f=>({...f,candidate:e.target.value}))}/>
                </div>

                <div className="field">
                  <label className="label">Job Description <span style={{color:"var(--dim)",fontWeight:400}}>(optional — enables JD match score)</span></label>
                  <textarea className="inp" placeholder="Paste the job description here for a fit % score..." style={{minHeight:70}} value={form.jd} onChange={e=>setForm(f=>({...f,jd:e.target.value}))}/>
                </div>

                <div className="field">
                  <label className="label">Skills to Evaluate
                    <span style={{fontWeight:400,color:"var(--dim)",marginLeft:6}}>— your gut rating (AI scores independently)</span>
                  </label>
                  <div className="clarify-note">
                    <strong>Dots = your gut feeling (1–5).</strong> The AI generates its own objective score from your notes. Both are shown side-by-side in results.
                  </div>
                  <div className="skills-preset-row" style={{marginTop:8}}>
                    {Object.keys(ROLE_SKILL_PRESETS).map(p=>(
                      <button key={p} className={`preset-btn ${activePreset===p?"active":""}`} onClick={()=>applyPreset(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="skill-tags">
                    {skillsList.map(name=>(
                      <div key={name} className="skill-tag">
                        <span>{name}</span>
                        <div className="skill-tag-dots">
                          {[1,2,3,4,5].map(i=>(
                            <div key={i} className={`d ${i<=(skills[name]||0)?`on-${skills[name]||0}`:""}`}
                              onClick={()=>setSkill(name,i)}/>
                          ))}
                        </div>
                        <button className="skill-tag-remove" onClick={()=>removeSkill(name)} title="Remove skill">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="add-skill-row">
                    <input
                      className="add-skill-inp"
                      placeholder="Add custom skill (e.g. Negotiation)..."
                      value={newSkillInput}
                      onChange={e=>setNewSkillInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addSkill()}
                    />
                    <button className="add-skill-btn" onClick={addSkill}>+ Add</button>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Interview Notes</label>
                  <div className="mic-row">
                    <div style={{flex:1}}>
                      <textarea className="inp" style={{minHeight:130}}
                        placeholder="Paste notes or use 🎤 to speak them. Include candidate responses, observations, red flags, highlights..."
                        value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                    </div>
                    <button className={`mic-btn ${recording?"recording":""}`} onClick={toggleMic} title={recording?"Stop recording":"Start voice input"}>
                      {recording?"⏹":"🎤"}
                    </button>
                  </div>
                  {recording && <div style={{font:"500 10px var(--mono)",color:"var(--rose)",letterSpacing:1}}>● RECORDING — speak your notes</div>}
                </div>

              </div>
              <button className="analyze-btn" onClick={analyze} disabled={loading||!form.notes.trim()||!form.role.trim()}>
                {loading ? "⟳ Analyzing..." : "⚡ Generate Full Scorecard"}
              </button>
            </div>

            {/* RIGHT */}
            <div className="right-col">
              <div className="phead">
                <span className="phead-title">AI Scorecard</span>
                {result && !result.error && (
                  <button className="save-btn" onClick={saveCandidate}>+ Save to Pipeline</button>
                )}
              </div>
              <div className="results-scroll">

                {!loading && !result && (
                  isLimitReached() ? (
                    <div className="empty">
                      <div className="empty-icon">🔒</div>
                      <div className="empty-h">Free Limit Reached</div>
                      <div className="empty-p" style={{maxWidth:260}}>
                        You've used all {profile?.analyses_limit||10} free analyses this month.
                        Upgrade to Pro for unlimited scorecards.
                      </div>
                      <a href="mailto:hireiqpro@gmail.com?subject=Upgrade to Pro"
                        style={{
                          marginTop:8,padding:"10px 24px",
                          background:"linear-gradient(135deg,var(--hi),var(--hi2))",
                          borderRadius:8,color:"#000",fontWeight:700,fontSize:13,
                          textDecoration:"none",display:"inline-block"
                        }}>
                        Upgrade to Pro — $49/mo
                      </a>
                    </div>
                  ) : (
                    <div className="empty">
                      <div className="empty-icon">🎯</div>
                      <div className="empty-h">Awaiting Analysis</div>
                      <div className="empty-p">Fill in interview details on the left and click Generate to get your AI scorecard</div>
                    </div>
                  )
                )}

                {loading && (
                  <div className="loading">
                    <div className="spin-ring">🤖</div>
                    <div className="load-label">DEEP ANALYSIS RUNNING</div>
                    <div className="load-steps">
                      <div className="ls">▸ Parsing interview notes...</div>
                      <div className="ls">▸ Scoring competency signals...</div>
                      <div className="ls">▸ Detecting contradictions & bias...</div>
                      <div className="ls">▸ Matching against job description...</div>
                      <div className="ls">▸ Generating recommendation & emails...</div>
                    </div>
                  </div>
                )}

                {result?.error && (
                  <div className="empty">
                    <div className="empty-icon">⚠️</div>
                    <div className="empty-h">Analysis Failed</div>
                    <div className="empty-p">Something went wrong. Please try again.</div>
                  </div>
                )}

                {result && !result.error && (() => {
                  const vc = VERDICT_COLORS[result.verdict] || VERDICT_COLORS["Borderline"];
                  return (
                    <>
                      {/* Hero */}
                      <div className="rblock">
                        <div className="rlabel">Hiring Recommendation</div>
                        <div className="hero-score">
                          <div className={`score-ring ${scoreClass(result.overallScore)}`}>
                            {result.overallScore}
                            <span className="score-sub">/100</span>
                          </div>
                          <div className="score-right">
                            <div className="verdict">
                              <span className="verdict-chip" style={{background:vc.bg,border:`1px solid ${vc.border}`,color:vc.text}}>
                                {result.verdict}
                              </span>
                            </div>
                            <div className="summary" style={{marginTop:8}}>{result.summary}</div>
                          </div>
                        </div>
                      </div>

                      {/* JD Match */}
                      {result.jdMatchScore != null && (
                        <div className="rblock">
                          <div className="rlabel">JD Fit Score</div>
                          <div className="card">
                            <div className="jd-match">
                              <div className="jd-match-label" style={{color:barColor(result.jdMatchScore)}}>{result.jdMatchScore}%</div>
                              <div className="jd-match-sub">match against provided job description</div>
                            </div>
                            <div className="bar-track" style={{height:6,borderRadius:3}}>
                              <div className="bar-fill" style={{width:`${result.jdMatchScore}%`,background:barColor(result.jdMatchScore),height:"100%",borderRadius:3}}/>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bias & Contradictions */}
                      {result.biasFlags?.length > 0 && (
                        <div className="rblock">
                          <div className="rlabel">⚠ Bias Flags Detected</div>
                          {result.biasFlags.map((b,i)=>(
                            <div key={i} className="bias-alert" style={{marginBottom:6}}>
                              <span className="bias-icon">⚠️</span>
                              <div className="bias-text"><strong>Potential Bias Detected</strong>{b}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {result.contradictions?.length > 0 && (
                        <div className="rblock">
                          <div className="rlabel">🔍 Contradictions Found</div>
                          {result.contradictions.map((c,i)=>(
                            <div key={i} className="contra-alert" style={{marginBottom:6}}>
                              <span className="bias-icon">🔍</span>
                              <div className="contra-text"><strong>Inconsistency Flagged</strong>{c}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skill Scores */}
                      <div className="rblock">
                        <div className="rlabel">Competency Breakdown <span style={{fontWeight:400,fontSize:9,color:"var(--dim)"}}>AI SCORE vs YOUR GUT</span></div>
                        <div className="card">
                          <div className="bar-list">
                            {Object.entries(result.skillScores||{}).map(([k,v])=>{
                              const gutRaw = skills[k]||0;
                              const gutPct = gutRaw * 20;
                              const diff = Math.abs(v - gutPct);
                              const flagged = diff >= 30 && gutRaw > 0;
                              return (
                                <div key={k} className="bar-item">
                                  <div className="bar-head">
                                    <span className="bar-name">{k} {flagged && <span title="AI and your rating differ significantly" style={{color:"var(--amber)",fontSize:10}}>⚠</span>}</span>
                                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                                      {gutRaw>0 && <span style={{font:"400 10px var(--mono)",color:"var(--sub)"}}>you:{gutRaw}/5</span>}
                                      <span className="bar-val">{v}</span>
                                    </div>
                                  </div>
                                  <div className="bar-track">
                                    <div className="bar-fill" style={{width:`${v}%`,background:barColor(v)}}/>
                                  </div>
                                  {flagged && <div style={{font:"400 10px var(--mono)",color:"var(--amber)",marginTop:2}}>⚠ Your gut ({gutRaw}/5) differs from AI score ({v}/100) — worth discussing</div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Concerns */}
                      <div className="rblock">
                        <div className="rlabel">Strengths</div>
                        <div className="card">
                          <ul className="blist">
                            {(result.strengths||[]).map((s,i)=><li key={i}><span className="bl g"/>{s}</li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="rblock">
                        <div className="rlabel">Concerns</div>
                        <div className="card">
                          <ul className="blist">
                            {(result.concerns||[]).map((c,i)=><li key={i}><span className="bl r"/>{c}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* Follow-up Questions */}
                      {result.followUpQuestions?.length > 0 && (
                        <div className="rblock">
                          <div className="rlabel">Suggested Follow-up Questions</div>
                          <div className="card">
                            <ul className="blist">
                              {result.followUpQuestions.map((q,i)=><li key={i}><span className="bl a"/>{q}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      <div className="rblock">
                        <div className="rlabel">Next Steps</div>
                        <div className="card">
                          <ul className="blist">
                            {(result.nextSteps||[]).map((s,i)=><li key={i}><span className="bl" style={{background:"var(--hi)"}}/>{s}</li>)}
                          </ul>
                        </div>
                      </div>

                      {/* Emails */}
                      <div className="rblock">
                        <div className="rlabel">Follow-up Emails</div>
                        <div className="email-card">
                          <div className="email-tabs">
                            {["advance","reject","hold"].map(t=>(
                              <button key={t} className={`etab ${emailTab===t?"on":""}`} onClick={()=>setEmailTab(t)}>
                                {t==="advance"?"✓ Advance":t==="reject"?"✕ Reject":"⏸ Hold"}
                              </button>
                            ))}
                          </div>
                          <div className="email-body">
                            {emailTab==="advance"?result.advanceEmail:emailTab==="reject"?result.rejectEmail:result.holdEmail}
                          </div>
                          <div className="email-foot">
                            <button className={`copy-btn ${copied===emailTab?"copied":""}`} onClick={copyEmail}>
                              {copied===emailTab?"✓ Copied":"⎘ Copy"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPARE ── */}
        <div className={`view`} style={{display:tab==="compare"?"flex":"none",flexDirection:"column",overflow:"hidden"}}>
          <div className="compare-view">
            <div className="compare-head">
              <span className="compare-title">Candidate Comparison</span>
              <span style={{font:"400 12px var(--font)",color:"var(--sub)"}}>
                {candidates.length} candidate{candidates.length!==1?"s":""} · Save from Analyze tab to compare
              </span>
            </div>

            {candidates.length === 0 ? (
              <div className="compare-empty">
                <div style={{fontSize:44,opacity:.2}}>⚖️</div>
                <div style={{font:"700 16px var(--font)",opacity:.2}}>No Candidates Yet</div>
                <div style={{fontSize:12,maxWidth:220,textAlign:"center",lineHeight:1.6,opacity:.5}}>
                  Analyze interviews and click "Save to Pipeline" to compare candidates here
                </div>
              </div>
            ) : (
              <div className="compare-grid">
                {/* Winner banner */}
                {candidates.length >= 2 && (() => {
                  const top = [...candidates].sort((a,b)=>b.score-a.score)[0];
                  return (
                    <div style={{background:"rgba(52,211,153,.07)",border:"1px solid rgba(52,211,153,.25)",borderRadius:10,padding:"12px 18px",display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:24}}>👑</span>
                      <div>
                        <div style={{font:"700 14px var(--font)",color:"var(--green)"}}>Top Candidate: {top.name}</div>
                        <div style={{font:"400 12px var(--font)",color:"var(--sub)",marginTop:2}}>Highest overall score at {top.score}/100 — {top.verdict}</div>
                      </div>
                    </div>
                  );
                })()}

                <div className="cand-cards" style={{gridTemplateColumns:`repeat(${Math.min(candidates.length,2)},1fr)`}}>
                  {[...candidates].sort((a,b)=>b.score-a.score).map((c,i)=>{
                    const isWinner = i===0 && candidates.length>=2;
                    const vc = VERDICT_COLORS[c.verdict] || VERDICT_COLORS["Borderline"];
                    return (
                      <div key={i} className={`cand-card ${isWinner?"winner":""}`}>
                        <div className="ccard-head">
                          <div className="ccard-avatar" style={{background:AV_BG[c.avatarIdx],fontSize:20}}>
                            {AVATARS[c.avatarIdx]}
                          </div>
                          <div className="ccard-info">
                            <div className="ccard-name">{c.name} {isWinner && <span style={{color:"var(--green)",fontSize:12}}>👑</span>}</div>
                            <div className="ccard-role">{c.role}</div>
                          </div>
                          <div className="ccard-score-badge" style={{color:vc.text,borderColor:vc.border,background:vc.bg}}>
                            {isWinner && <div className="winner-crown">👑</div>}
                            {c.score}
                          </div>
                        </div>
                        <div className="ccard-body">
                          <div className="mini-bars">
                            {Object.entries(c.skillScores||{}).map(([k,v])=>(
                              <div key={k} className="mini-bar">
                                <span className="mini-bar-name">{k}</span>
                                <div className="mini-bar-track">
                                  <div className="mini-bar-fill" style={{width:`${v}%`,background:barColor(v),height:"100%"}}/>
                                </div>
                                <span className="mini-bar-val">{v}</span>
                              </div>
                            ))}
                          </div>
                          <div className="ccard-meta">
                            <div className="meta-row">
                              <span className="meta-key">Overall</span>
                              <span className="meta-val" style={{color:barColor(c.score)}}>{c.score}/100</span>
                            </div>
                            {c.jdMatch != null && (
                              <div className="meta-row">
                                <span className="meta-key">JD Match</span>
                                <span className="meta-val" style={{color:barColor(c.jdMatch)}}>{c.jdMatch}%</span>
                              </div>
                            )}
                            <div className="meta-row">
                              <span className="meta-key">Verdict</span>
                              <span className="verdict-chip" style={{background:vc.bg,color:vc.text,fontSize:9}}>{c.verdict}</span>
                            </div>
                            <div className="divider"/>
                            <div style={{font:"400 11px var(--font)",color:"var(--sub)",lineHeight:1.5,marginTop:2}}>
                              {c.summary?.slice(0,120)}{c.summary?.length>120?"…":""}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PIPELINE ── */}
        <div style={{display:tab==="pipeline"?"flex":"none",flexDirection:"column",overflow:"hidden",flex:1}}>
          <div className="pipeline-view">
            <div className="pipeline-head">
              <span className="pipeline-title">Hiring Pipeline</span>
              <span style={{font:"400 12px var(--font)",color:"var(--sub)"}}>{candidates.length} total candidates</span>
            </div>

            {candidates.length === 0 ? (
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"var(--sub)"}}>
                <div style={{fontSize:44,opacity:.2}}>📊</div>
                <div style={{font:"700 16px var(--font)",opacity:.2}}>Pipeline Empty</div>
                <div style={{fontSize:12,maxWidth:220,textAlign:"center",lineHeight:1.6,opacity:.5}}>Analyze and save candidates to build your hiring pipeline</div>
              </div>
            ) : (
              <div className="pipeline-table">
                <table className="ptable">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Role</th>
                      <th>Score</th>
                      <th>JD Fit</th>
                      <th>Verdict</th>
                      <th>Comm</th>
                      <th>Technical</th>
                      <th>Culture</th>
                      <th>Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...candidates].sort((a,b)=>b.score-a.score).map((c,i)=>{
                      const vc = VERDICT_COLORS[c.verdict] || VERDICT_COLORS["Borderline"];
                      return (
                        <tr key={i}>
                          <td>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <span style={{fontSize:18}}>{AVATARS[c.avatarIdx]}</span>
                              <span style={{fontWeight:600}}>{c.name}</span>
                            </div>
                          </td>
                          <td style={{color:"var(--sub)",fontSize:12}}>{c.role}</td>
                          <td><span className="score-num" style={{color:barColor(c.score)}}>{c.score}</span></td>
                          <td style={{color:c.jdMatch!=null?barColor(c.jdMatch):"var(--dim)"}}>
                            {c.jdMatch!=null?`${c.jdMatch}%`:"—"}
                          </td>
                          <td>
                            <span className="status-chip" style={{background:vc.bg,color:vc.text,border:`1px solid ${vc.border}`}}>
                              {c.verdict}
                            </span>
                          </td>
                          <td style={{color:barColor(c.skillScores?.Communication||0),font:"600 12px var(--mono)"}}>{c.skillScores?.Communication||"—"}</td>
                          <td style={{color:barColor(c.skillScores?.Technical||0),font:"600 12px var(--mono)"}}>{c.skillScores?.Technical||"—"}</td>
                          <td style={{color:barColor(c.skillScores?.["Culture Fit"]||0),font:"600 12px var(--mono)"}}>{c.skillScores?.["Culture Fit"]||"—"}</td>
                          <td style={{color:"var(--sub)",fontSize:11,fontFamily:"var(--mono)"}}>{c.savedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* TOAST */}
        {toast && <div className="toast">✓ {toast}</div>}
      </div>
    </>
  );
}
