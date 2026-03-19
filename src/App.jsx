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
/* ── INTERVIEW SESSION ── */
.interview-shell{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--ink)}
.interview-header{
  padding:16px 24px;border-bottom:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;
  background:var(--ink2);flex-shrink:0;
}
.interview-role-info{display:flex;flex-direction:column;gap:3px}
.interview-role-name{font:700 15px var(--font)}
.interview-candidate{font:400 12px var(--font);color:var(--sub)}
.interview-progress{display:flex;align-items:center;gap:12px}
.progress-bar-wrap{width:160px;height:4px;background:var(--line);border-radius:2px;overflow:hidden}
.progress-bar-fill{height:100%;background:linear-gradient(90deg,var(--hi),var(--hi2));border-radius:2px;transition:width .4s ease}
.progress-label{font:500 11px var(--mono);color:var(--sub);white-space:nowrap}

.interview-body{flex:1;overflow:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px}
.question-card{
  width:100%;max-width:680px;
  background:var(--ink2);border:1px solid var(--line);
  border-radius:16px;padding:32px;
  display:flex;flex-direction:column;gap:24px;
  animation:riseIn .35s ease;
}
.question-meta{display:flex;align-items:center;gap:10px}
.question-num{font:700 11px var(--mono);color:var(--hi);letter-spacing:1px}
.question-skill-tag{
  font:600 10px var(--mono);letter-spacing:.5px;
  background:rgba(129,140,248,.1);color:var(--hi2);
  border:1px solid rgba(129,140,248,.2);padding:2px 8px;border-radius:4px;
}
.question-type-tag{
  font:600 10px var(--mono);letter-spacing:.5px;
  background:var(--ink3);color:var(--sub);
  border:1px solid var(--line2);padding:2px 8px;border-radius:4px;
}
.question-text{font:600 20px var(--font);line-height:1.5;letter-spacing:-.3px}
.question-hint{font:400 12px var(--font);color:var(--sub);line-height:1.6;
  background:var(--ink3);border:1px solid var(--line);border-radius:8px;padding:10px 14px}

.rating-section{display:flex;flex-direction:column;gap:10px}
.rating-label{font:600 11px var(--mono);letter-spacing:1px;text-transform:uppercase;color:var(--sub)}
.rating-buttons{display:flex;gap:8px}
.rating-btn{
  flex:1;padding:14px 8px;
  background:var(--ink3);border:2px solid var(--line2);
  border-radius:10px;cursor:pointer;transition:all .15s;
  display:flex;flex-direction:column;align-items:center;gap:4px;
}
.rating-btn:hover{border-color:var(--hi);background:rgba(56,189,248,.05)}
.rating-btn.selected-1{border-color:var(--rose);background:rgba(248,113,113,.1);color:var(--rose)}
.rating-btn.selected-2{border-color:var(--amber);background:rgba(251,191,36,.08);color:var(--amber)}
.rating-btn.selected-3{border-color:var(--amber);background:rgba(251,191,36,.08);color:var(--amber)}
.rating-btn.selected-4{border-color:var(--green);background:rgba(52,211,153,.08);color:var(--green)}
.rating-btn.selected-5{border-color:var(--green);background:rgba(52,211,153,.1);color:var(--green)}
.rating-num{font:900 18px var(--font)}
.rating-desc{font:500 9px var(--mono);letter-spacing:.5px;text-transform:uppercase;opacity:.7}

.note-area{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:8px;padding:10px 14px;
  color:var(--text);font:400 13px var(--font);
  outline:none;resize:none;line-height:1.6;width:100%;
  transition:border .15s;
}
.note-area:focus{border-color:var(--hi)}
.note-area::placeholder{color:var(--dim)}

.interview-nav{display:flex;gap:10px;justify-content:flex-end}
.next-btn{
  padding:12px 28px;
  background:linear-gradient(135deg,var(--hi),var(--hi2));
  border:none;border-radius:9px;color:#000;font:700 14px var(--font);
  cursor:pointer;transition:all .2s;
}
.next-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(56,189,248,.2)}
.next-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.skip-btn{
  padding:12px 18px;background:none;border:1px solid var(--line2);
  border-radius:9px;color:var(--sub);font:600 13px var(--font);cursor:pointer;
  transition:.15s;
}
.skip-btn:hover{border-color:var(--text);color:var(--text)}

.generating-questions{
  display:flex;flex-direction:column;align-items:center;gap:16px;
  color:var(--sub);text-align:center;
}

/* ── PIPELINE BY ROLE ── */
.pipeline-role-list{display:flex;flex-direction:column;gap:10px}
.pipeline-role-row{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:10px;padding:16px 20px;
  display:flex;align-items:center;justify-content:space-between;
  cursor:pointer;transition:.2s;
}
.pipeline-role-row:hover{border-color:var(--hi);background:rgba(56,189,248,.03)}
.pipeline-role-row.expanded{border-color:var(--line2);border-radius:10px 10px 0 0}
.pipeline-role-name{font:700 15px var(--font)}
.pipeline-role-meta{display:flex;align-items:center;gap:12px}
.pipeline-candidates-table{
  background:var(--ink2);border:1px solid var(--line2);
  border-top:none;border-radius:0 0 10px 10px;
  overflow:hidden;margin-bottom:4px;
}
.pct th{
  padding:10px 16px;text-align:left;
  font:700 10px var(--mono);letter-spacing:1.5px;text-transform:uppercase;
  color:var(--sub);border-bottom:1px solid var(--line);background:var(--ink3);
}
.pct td{padding:11px 16px;font-size:13px;border-bottom:1px solid var(--line)}
.pct tr:last-child td{border-bottom:none}
.pct tr:hover td{background:rgba(56,189,248,.03);cursor:pointer}
.chevron{transition:transform .2s;font-size:12px;color:var(--sub)}
.chevron.open{transform:rotate(90deg)}

/* ── ROLES PAGE ── */
.roles-view{flex:1;overflow:auto;padding:24px;display:flex;flex-direction:column;gap:20px}
.roles-head{display:flex;align-items:center;justify-content:space-between}
.roles-title{font:700 13px var(--mono);letter-spacing:2px;text-transform:uppercase;color:var(--sub)}
.new-role-btn{
  padding:8px 18px;background:linear-gradient(135deg,var(--hi),var(--hi2));
  border:none;border-radius:8px;color:#000;font:700 12px var(--font);
  cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px;
}
.new-role-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(56,189,248,.2)}
.roles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.role-card{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:12px;overflow:hidden;transition:.2s;
}
.role-card:hover{border-color:var(--line2)}
.role-card.archived{opacity:.5}
.role-card-head{
  padding:16px 18px;border-bottom:1px solid var(--line);
  display:flex;align-items:flex-start;justify-content:space-between;gap:10px;
}
.role-card-title{font:700 15px var(--font)}
.role-card-seniority{
  font:600 9px var(--mono);letter-spacing:1px;text-transform:uppercase;
  background:rgba(56,189,248,.1);color:var(--hi);
  border:1px solid rgba(56,189,248,.2);padding:2px 8px;border-radius:4px;
  white-space:nowrap;flex-shrink:0;
}
.role-card-body{padding:14px 18px;display:flex;flex-direction:column;gap:10px}
.role-card-jd{font-size:12px;color:var(--sub);line-height:1.6;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.role-card-meta{display:flex;align-items:center;justify-content:space-between}
.role-card-count{font:500 11px var(--mono);color:var(--sub)}
.role-card-actions{display:flex;gap:6px}
.role-action-btn{
  padding:5px 12px;border-radius:6px;border:1px solid var(--line2);
  background:none;font:600 10px var(--mono);cursor:pointer;transition:.15s;
  letter-spacing:.5px;
}
.role-action-btn.primary{color:var(--hi);border-color:rgba(56,189,248,.3)}
.role-action-btn.primary:hover{background:rgba(56,189,248,.1)}
.role-action-btn.danger{color:var(--rose);border-color:rgba(248,113,113,.2)}
.role-action-btn.danger:hover{background:rgba(248,113,113,.08)}
.role-action-btn.edit{color:var(--sub)}
.role-action-btn.edit:hover{color:var(--text);border-color:var(--line2)}
.roles-empty{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:12px;color:var(--sub);text-align:center;
  padding:60px 0;
}
.roles-section-label{
  font:700 10px var(--mono);letter-spacing:2px;text-transform:uppercase;
  color:var(--dim);margin-bottom:8px;
}

/* ── MODAL ── */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.7);
  display:flex;align-items:center;justify-content:center;
  z-index:1000;padding:20px;
}
.modal{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:14px;padding:28px;width:100%;max-width:500px;
  display:flex;flex-direction:column;gap:16px;
}
.modal-title{font:700 17px var(--font)}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}
.modal-cancel{
  padding:9px 18px;background:none;border:1px solid var(--line2);
  border-radius:8px;color:var(--sub);font:600 13px var(--font);cursor:pointer;
}
.modal-cancel:hover{border-color:var(--text);color:var(--text)}
.modal-save{
  padding:9px 20px;background:linear-gradient(135deg,var(--hi),var(--hi2));
  border:none;border-radius:8px;color:#000;font:700 13px var(--font);cursor:pointer;
}
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
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [interviewMode, setInterviewMode] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentNote, setCurrentNote] = useState("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [expandedPipelineRole, setExpandedPipelineRole] = useState(null);
  const [pipelineCandidates, setPipelineCandidates] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({title:"",seniority:"mid",job_description:""});
  const [roleSkills, setRoleSkills] = useState([...DEFAULT_SKILLS]);
  const [roleSkillInput, setRoleSkillInput] = useState("");

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

  // Load roles
  useEffect(() => {
    if (!session) return;
    const loadRoles = async () => {
      const { data } = await supabase
        .from('roles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setRoles(data);
    };
    loadRoles();
  }, [session]);

  const autoDetectRoleSkills = (title, seniority) => {
    const t = title.toLowerCase();
    const preset = t.includes('engineer')||t.includes('developer')||t.includes('tech') ? 'engineering'
      : t.includes('design') ? 'design'
      : t.includes('sales') ? 'sales'
      : t.includes('market') ? 'marketing'
      : t.includes('manag')||t.includes('director')||t.includes('head') ? 'management'
      : t.includes('data')||t.includes('analyst') ? 'data'
      : 'custom';
    setRoleSkills([...ROLE_SKILL_PRESETS[preset]]);
  };

  const saveRole = async () => {
    if (!roleForm.title.trim()) return;
    if (editingRole) {
      const { data } = await supabase.from('roles').update({
        title: roleForm.title,
        seniority: roleForm.seniority,
        job_description: roleForm.job_description,
        skills: roleSkills,
      }).eq('id', editingRole.id).select().single();
      if (data) setRoles(r => r.map(x => x.id === data.id ? data : x));
    } else {
      const { data } = await supabase.from('roles').insert({
        user_id: session.user.id,
        title: roleForm.title,
        seniority: roleForm.seniority,
        job_description: roleForm.job_description,
        skills: roleSkills,
      }).select().single();
      if (data) setRoles(r => [data, ...r]);
    }
    setShowRoleModal(false);
    setEditingRole(null);
    setRoleForm({title:"",seniority:"mid",job_description:""});
    setRoleSkills([...DEFAULT_SKILLS]);
    showToast("✓ Role saved");
  };

  const archiveRole = async (id) => {
    await supabase.from('roles').update({ status: 'archived' }).eq('id', id);
    setRoles(r => r.map(x => x.id === id ? {...x, status:'archived'} : x));
    showToast("Role archived");
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setForm(f => ({ ...f, role: role.title, seniority: role.seniority, jd: role.job_description || "", candidate: "", notes: "" }));
    // Load role skills if saved, else use preset based on title
    if (role.skills && role.skills.length > 0) {
      setSkillsList(role.skills);
      setSkills(Object.fromEntries(role.skills.map(s=>[s,0])));
    } else {
      // Auto-detect preset from role title
      const t = role.title.toLowerCase();
      const preset = t.includes('engineer')||t.includes('developer')||t.includes('tech') ? 'engineering'
        : t.includes('design') ? 'design'
        : t.includes('sales') ? 'sales'
        : t.includes('market') ? 'marketing'
        : t.includes('manag')||t.includes('director')||t.includes('head') ? 'management'
        : t.includes('data')||t.includes('analyst') ? 'data'
        : 'custom';
      applyPreset(preset);
    }
    setResult(null);
    setTab("analyze");
    showToast(`✓ "${role.title}" loaded — add candidate details`);
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

  /* ── INTERVIEW ── */
  const questionCount = (seniority) => {
    return {junior:5, mid:7, senior:8, lead:10, exec:10}[seniority] || 7;
  };

  const startInterview = async (candidateName) => {
    if (!candidateName.trim() || !selectedRole) return;
    setInterviewCandidate(candidateName);
    setGeneratingQuestions(true);
    setInterviewMode(true);
    setAnswers([]);
    setCurrentQ(0);
    setCurrentRating(0);
    setCurrentNote("");

    const count = questionCount(selectedRole.seniority);
    const skills = (selectedRole.skills && selectedRole.skills.length > 0)
      ? selectedRole.skills.join(", ")
      : skillsList.join(", ");

    const prompt = `You are an expert interviewer. Generate exactly ${count} interview questions for this role.

Role: ${selectedRole.title}
Seniority: ${selectedRole.seniority}
Job Description: ${selectedRole.job_description || "Not provided"}
Skills to evaluate: ${skills}

Rules:
- Mix question types: technical (30%), behavioral (30%), situational (25%), culture/motivation (15%)
- Weight technical questions higher for senior/lead roles
- Each question should target a specific skill
- Questions should be concise and clear — readable aloud in 10 seconds
- Include a short hint for the recruiter (what a good answer looks like)

Return ONLY valid JSON array, no markdown:
[
  {
    "question": "<the question to ask>",
    "skill": "<which skill this evaluates>",
    "type": "<Technical|Behavioral|Situational|Culture>",
    "hint": "<what a strong answer looks like, 1 sentence>"
  }
]`;

    try {
      const res = await fetch("/api/analyze", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})
      });
      const data = await res.json();
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      // Try to parse — data might already be parsed or be raw text
      let parsed;
      try { parsed = typeof data === 'object' && Array.isArray(data) ? data : JSON.parse(text.replace(/```json|```/g,"")); }
      catch { parsed = data; }
      if (Array.isArray(parsed)) {
        setQuestions(parsed);
      } else {
        // fallback questions
        const fallback = Array.from({length:count}, (_,i) => ({
          question: `Tell me about a time you demonstrated ${skills.split(",")[i % skills.split(",").length]?.trim() || "problem solving"} in your previous role.`,
          skill: skills.split(",")[i % skills.split(",").length]?.trim() || "General",
          type: "Behavioral",
          hint: "Look for specific examples with measurable outcomes."
        }));
        setQuestions(fallback);
      }
    } catch(e) {
      console.error(e);
    }
    setGeneratingQuestions(false);
  };

  const submitAnswer = async () => {
    const newAnswers = [...answers, {
      question: questions[currentQ]?.question,
      skill: questions[currentQ]?.skill,
      type: questions[currentQ]?.type,
      rating: currentRating,
      note: currentNote
    }];
    setAnswers(newAnswers);
    setCurrentRating(0);
    setCurrentNote("");

    if (currentQ + 1 >= questions.length) {
      // All questions done — generate scorecard
      await generateScorecardFromInterview(newAnswers);
    } else {
      setCurrentQ(q => q + 1);
    }
  };

  const generateScorecardFromInterview = async (allAnswers) => {
    setInterviewMode(false);
    setLoading(true);
    setResult(null);
    setTab("analyze");

    const answersText = allAnswers.map((a,i) =>
      `Q${i+1} [${a.skill} - ${a.type}]: ${a.question}\nRecruiter rating: ${a.rating}/5${a.note ? "\nNotes: " + a.note : ""}`
    ).join("\n\n");

    const skillsJson = [...new Set(allAnswers.map(a=>a.skill))].map(s=>`"${s}":<0-100>`).join(",");

    const prompt = `You are a senior recruiting analyst. Analyze this structured interview and return ONLY valid JSON, no markdown.

Role: ${selectedRole.title}
Seniority: ${selectedRole.seniority}
Candidate: ${interviewCandidate}
Job Description: ${selectedRole.job_description || "Not provided"}

Interview Q&A (recruiter rated each answer 1-5):
${answersText}

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
  "skillScores": {${skillsJson || '"Overall":<0-100>'}},
  "gutVsAiFlags": [],
  "nextSteps": ["s1","s2","s3"],
  "advanceEmail": "<professional advance email>",
  "rejectEmail": "<professional rejection email>",
  "holdEmail": "<hold email>",
  "followUpQuestions": ["q1","q2","q3"]
}`;

    try {
      const res = await fetch("/api/analyze", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setForm(f=>({...f,candidate:interviewCandidate}));
      await incrementUsage();
      const matchedRole = roles.find(r=>r.title===selectedRole.title&&r.status==='active');
      if (matchedRole) {
        const newCount = (matchedRole.candidates_count||0)+1;
        await supabase.from('roles').update({candidates_count:newCount}).eq('id',matchedRole.id);
        setRoles(r=>r.map(x=>x.id===matchedRole.id?{...x,candidates_count:newCount}:x));
      }
      // Save to pipeline candidates in DB
      await supabase.from('pipeline_candidates').insert({
        user_id: session.user.id,
        role_id: matchedRole?.id,
        role_title: selectedRole.title,
        candidate_name: interviewCandidate,
        score: data.overallScore,
        verdict: data.verdict,
        jd_match: data.jdMatchScore,
        skill_scores: data.skillScores,
        summary: data.summary,
      });
    } catch(e) {
      setResult({error:true});
    }
    setLoading(false);
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
      // Increment role candidate count if a role is loaded
      const matchedRole = roles.find(r => r.title === form.role && r.status === 'active');
      if (matchedRole) {
        const newCount = (matchedRole.candidates_count || 0) + 1;
        await supabase.from('roles').update({ candidates_count: newCount }).eq('id', matchedRole.id);
        setRoles(r => r.map(x => x.id === matchedRole.id ? {...x, candidates_count: newCount} : x));
      }
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
              {id:"roles",   label:"Open Roles", icon:"📋"},
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

        {/* ── INTERVIEW MODE ── */}
        {interviewMode && (
          <div className="view active" style={{display:"flex"}}>
            <div className="interview-shell">
              <div className="interview-header">
                <div className="interview-role-info">
                  <div className="interview-role-name">{selectedRole?.title} · {selectedRole?.seniority}</div>
                  <div className="interview-candidate">Interviewing: {interviewCandidate}</div>
                </div>
                <div className="interview-progress">
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{width: questions.length ? `${((currentQ)/questions.length)*100}%` : '0%'}}/>
                  </div>
                  <div className="progress-label">{generatingQuestions ? "Loading..." : `${currentQ+1} / ${questions.length}`}</div>
                  <button className="skip-btn" style={{padding:"6px 12px",fontSize:11}} onClick={()=>{setInterviewMode(false);setTab("analyze");}}>✕ Exit</button>
                </div>
              </div>

              <div className="interview-body">
                {generatingQuestions ? (
                  <div className="generating-questions">
                    <div className="spin-ring" style={{width:52,height:52,fontSize:20}}>🤖</div>
                    <div style={{font:"500 13px var(--mono)",color:"var(--hi)",letterSpacing:1}}>GENERATING QUESTIONS</div>
                    <div style={{fontSize:12,color:"var(--sub)"}}>Tailoring questions for {selectedRole?.title}...</div>
                  </div>
                ) : questions[currentQ] ? (
                  <div className="question-card">
                    <div className="question-meta">
                      <span className="question-num">Q{currentQ+1}</span>
                      <span className="question-skill-tag">{questions[currentQ].skill}</span>
                      <span className="question-type-tag">{questions[currentQ].type}</span>
                    </div>

                    <div className="question-text">{questions[currentQ].question}</div>

                    {questions[currentQ].hint && (
                      <div className="question-hint">
                        <span style={{color:"var(--hi)",fontWeight:600,fontSize:10,fontFamily:"var(--mono)",letterSpacing:1}}>GOOD ANSWER LOOKS LIKE: </span>
                        {questions[currentQ].hint}
                      </div>
                    )}

                    <div className="rating-section">
                      <div className="rating-label">Rate candidate's answer</div>
                      <div className="rating-buttons">
                        {[
                          {n:1,label:"Poor"},
                          {n:2,label:"Weak"},
                          {n:3,label:"OK"},
                          {n:4,label:"Good"},
                          {n:5,label:"Great"},
                        ].map(r=>(
                          <button key={r.n} className={`rating-btn ${currentRating===r.n?`selected-${r.n}`:""}`}
                            onClick={()=>setCurrentRating(r.n)}>
                            <span className="rating-num">{r.n}</span>
                            <span className="rating-desc">{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{font:"600 11px var(--mono)",letterSpacing:1,textTransform:"uppercase",color:"var(--sub)"}}>Quick Note <span style={{fontWeight:400,color:"var(--dim)"}}>(optional)</span></div>
                      <textarea className="note-area" rows={3}
                        placeholder="Key points from their answer..."
                        value={currentNote} onChange={e=>setCurrentNote(e.target.value)}/>
                    </div>

                    <div className="interview-nav">
                      <button className="skip-btn" onClick={()=>{setCurrentRating(3);setCurrentNote("Skipped");submitAnswer();}}>Skip</button>
                      <button className="next-btn" disabled={currentRating===0} onClick={submitAnswer}>
                        {currentQ+1 >= questions.length ? "🎯 Generate Scorecard" : "Next Question →"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYZE ── */}
        <div className={`view active`} style={{display: tab==="analyze" && !interviewMode ?"flex":"none"}}>
          <div className="analyze-layout">

            {/* LEFT */}
            <div className="left-col">
              {!selectedRole ? (
                // No role selected — force recruiter to pick one
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32,textAlign:"center"}}>
                  <div style={{fontSize:44,opacity:.3}}>📋</div>
                  <div style={{font:"700 17px var(--font)",opacity:.4}}>No Role Selected</div>
                  <div style={{fontSize:12,color:"var(--sub)",maxWidth:220,lineHeight:1.7}}>
                    Go to Open Roles, select a role and click Analyze to start scoring candidates
                  </div>
                  <button className="new-role-btn" onClick={()=>setTab("roles")}>
                    📋 Go to Open Roles
                  </button>
                </div>
              ) : (
                <>
                  <div className="phead">
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      <span className="phead-title">Interview Input</span>
                      <span style={{fontSize:11,color:"var(--hi)",fontFamily:"var(--mono)"}}>
                        {selectedRole.title} · {selectedRole.seniority}
                      </span>
                    </div>
                    <button className="phead-action" onClick={()=>{
                      setSelectedRole(null);
                      setForm({role:"",jd:"",candidate:"",notes:"",seniority:"mid"});
                      setSkillsList([...DEFAULT_SKILLS]);
                      setSkills(Object.fromEntries(DEFAULT_SKILLS.map(s=>[s,0])));
                      setResult(null);
                    }}>↺ Change Role</button>
                  </div>
                  <div className="form-scroll">

                    <div className="field">
                      <label className="label">Candidate Name</label>
                      <input className="inp" placeholder="e.g. Alex Chen" value={form.candidate} onChange={e=>setForm(f=>({...f,candidate:e.target.value}))}/>
                    </div>

                    <div className="field">
                      <label className="label">Skills to Evaluate</label>
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
                          placeholder="Add skill..."
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
                          <textarea className="inp" style={{minHeight:200}}
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
                  <div style={{display:"flex",flexDirection:"column",gap:8,margin:"0 0 0 0"}}>
                    <button className="analyze-btn" style={{background:"linear-gradient(135deg,var(--green),#059669)"}}
                      onClick={()=>{
                        if(!form.candidate.trim()){showToast("Enter candidate name first");return;}
                        startInterview(form.candidate);
                      }}
                      disabled={loading||!form.candidate.trim()}>
                      🎤 Start Guided Interview
                    </button>
                    <button className="analyze-btn" onClick={analyze} disabled={loading||!form.notes.trim()}
                      style={{background:"linear-gradient(135deg,var(--hi),var(--hi2))"}}>
                      {loading ? "⟳ Analyzing..." : "⚡ Analyze Notes Instead"}
                    </button>
                  </div>
                </>
              )}
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
              <span style={{font:"400 12px var(--font)",color:"var(--sub)"}}>
                {roles.filter(r=>r.status==="active").length} active roles
              </span>
            </div>

            {roles.filter(r=>r.candidates_count>0||r.status==="active").length === 0 ? (
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"var(--sub)",paddingBottom:60}}>
                <div style={{fontSize:44,opacity:.2}}>📊</div>
                <div style={{font:"700 16px var(--font)",opacity:.2}}>Pipeline Empty</div>
                <div style={{fontSize:12,maxWidth:240,textAlign:"center",lineHeight:1.6,opacity:.5}}>
                  Create roles and interview candidates to build your pipeline
                </div>
              </div>
            ) : (
              <div className="pipeline-role-list">
                {roles.filter(r=>r.status==="active").map(role=>{
                  const isExpanded = expandedPipelineRole === role.id;
                  const roleCands = candidates.filter(c=>c.role===role.title);
                  const vc_top = roleCands.length > 0 ? VERDICT_COLORS[roleCands.sort((a,b)=>b.score-a.score)[0]?.verdict]||VERDICT_COLORS["Borderline"] : null;
                  return (
                    <div key={role.id}>
                      <div className={`pipeline-role-row ${isExpanded?"expanded":""}`}
                        onClick={()=>setExpandedPipelineRole(isExpanded?null:role.id)}>
                        <div style={{display:"flex",alignItems:"center",gap:14}}>
                          <div>
                            <div className="pipeline-role-name">{role.title}</div>
                            <div style={{font:"400 11px var(--mono)",color:"var(--sub)",marginTop:3}}>
                              {role.seniority} · {role.candidates_count||0} candidate{(role.candidates_count||0)!==1?"s":""} interviewed
                            </div>
                          </div>
                        </div>
                        <div className="pipeline-role-meta">
                          {vc_top && roleCands.length > 0 && (
                            <div style={{font:"500 12px var(--mono)",color:barColor(roleCands.sort((a,b)=>b.score-a.score)[0]?.score)}}>
                              Top: {roleCands.sort((a,b)=>b.score-a.score)[0]?.score}/100
                            </div>
                          )}
                          <span className="role-card-seniority">{role.candidates_count||0} candidates</span>
                          <span className="chevron" style={{transform:isExpanded?"rotate(90deg)":"none"}}>▶</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pipeline-candidates-table">
                          {roleCands.length === 0 ? (
                            <div style={{padding:"20px 20px",font:"400 12px var(--font)",color:"var(--sub)",textAlign:"center"}}>
                              No candidates interviewed yet.
                              <button className="role-action-btn primary" style={{marginLeft:12}}
                                onClick={()=>{selectRole(role);setTab("analyze");}}>
                                ⚡ Start Interviewing
                              </button>
                            </div>
                          ) : (
                            <table className="ptable pct" style={{width:"100%",borderCollapse:"collapse"}}>
                              <thead>
                                <tr>
                                  <th>Candidate</th>
                                  <th>Score</th>
                                  <th>JD Fit</th>
                                  <th>Verdict</th>
                                  <th>Summary</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...roleCands].sort((a,b)=>b.score-a.score).map((c,i)=>{
                                  const vc = VERDICT_COLORS[c.verdict]||VERDICT_COLORS["Borderline"];
                                  return (
                                    <tr key={i}>
                                      <td>
                                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                                          <span style={{fontSize:16}}>{AVATARS[c.avatarIdx||0]}</span>
                                          <span style={{fontWeight:600}}>{c.name}</span>
                                        </div>
                                      </td>
                                      <td><span style={{font:"700 13px var(--mono)",color:barColor(c.score)}}>{c.score}</span></td>
                                      <td style={{color:c.jdMatch!=null?barColor(c.jdMatch):"var(--dim)",font:"500 12px var(--mono)"}}>
                                        {c.jdMatch!=null?`${c.jdMatch}%`:"—"}
                                      </td>
                                      <td>
                                        <span className="status-chip" style={{background:vc.bg,color:vc.text,border:`1px solid ${vc.border}`}}>
                                          {c.verdict}
                                        </span>
                                      </td>
                                      <td style={{fontSize:12,color:"var(--sub)",maxWidth:200}}>
                                        {c.summary?.slice(0,80)}{c.summary?.length>80?"…":""}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── ROLES VIEW ── */}
        <div style={{display:tab==="roles"?"flex":"none",flexDirection:"column",overflow:"hidden",flex:1}}>
          <div className="roles-view">
            <div className="roles-head">
              <span className="roles-title">Open Roles</span>
              <button className="new-role-btn" onClick={()=>{setRoleForm({title:"",seniority:"mid",job_description:""});setEditingRole(null);setShowRoleModal(true);}}>
                + New Role
              </button>
            </div>

            {roles.filter(r=>r.status==="active").length === 0 && roles.filter(r=>r.status==="archived").length === 0 ? (
              <div className="roles-empty">
                <div style={{fontSize:44,opacity:.2}}>📋</div>
                <div style={{font:"700 16px var(--font)",opacity:.2}}>No Roles Yet</div>
                <div style={{fontSize:12,maxWidth:240,lineHeight:1.6,opacity:.5}}>
                  Create a role once and reuse it for every candidate you interview for that position
                </div>
                <button className="new-role-btn" style={{marginTop:8}} onClick={()=>{setRoleForm({title:"",seniority:"mid",job_description:""});setEditingRole(null);setShowRoleModal(true);}}>
                  + Create First Role
                </button>
              </div>
            ) : (
              <>
                {roles.filter(r=>r.status==="active").length > 0 && (
                  <>
                    <div className="roles-section-label">Active ({roles.filter(r=>r.status==="active").length})</div>
                    <div className="roles-grid">
                      {roles.filter(r=>r.status==="active").map(role=>(
                        <div key={role.id} className="role-card">
                          <div className="role-card-head">
                            <div>
                              <div className="role-card-title">{role.title}</div>
                            </div>
                            <div className="role-card-seniority">{role.seniority}</div>
                          </div>
                          <div className="role-card-body">
                            {role.job_description ? (
                              <div className="role-card-jd">{role.job_description}</div>
                            ) : (
                              <div style={{fontSize:12,color:"var(--dim)",fontStyle:"italic"}}>No job description added</div>
                            )}
                            <div className="role-card-meta">
                              <div className="role-card-count">
                                {role.candidates_count||0} candidate{(role.candidates_count||0)!==1?"s":""} analyzed
                              </div>
                              <div className="role-card-actions">
                                <button className="role-action-btn edit" onClick={()=>{setEditingRole(role);setRoleForm({title:role.title,seniority:role.seniority,job_description:role.job_description||""});setShowRoleModal(true);}}>
                                  Edit
                                </button>
                                <button className="role-action-btn danger" onClick={()=>archiveRole(role.id)}>
                                  Archive
                                </button>
                                <button className="role-action-btn primary" onClick={()=>selectRole(role)}>
                                  ⚡ Analyze
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {roles.filter(r=>r.status==="archived").length > 0 && (
                  <>
                    <div className="roles-section-label" style={{marginTop:16}}>Archived ({roles.filter(r=>r.status==="archived").length})</div>
                    <div className="roles-grid">
                      {roles.filter(r=>r.status==="archived").map(role=>(
                        <div key={role.id} className="role-card archived">
                          <div className="role-card-head">
                            <div className="role-card-title">{role.title}</div>
                            <div className="role-card-seniority" style={{opacity:.5}}>{role.seniority}</div>
                          </div>
                          <div className="role-card-body">
                            <div className="role-card-meta">
                              <div className="role-card-count">{role.candidates_count||0} candidates analyzed</div>
                              <button className="role-action-btn edit" onClick={async()=>{
                                await supabase.from('roles').update({status:'active'}).eq('id',role.id);
                                setRoles(r=>r.map(x=>x.id===role.id?{...x,status:'active'}:x));
                                showToast("Role restored");
                              }}>Restore</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── ROLE MODAL ── */}
        {showRoleModal && (
          <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setShowRoleModal(false);setEditingRole(null);}}}>
            <div className="modal">
              <div className="modal-title">{editingRole ? "Edit Role" : "New Role"}</div>

              <div className="field">
                <label className="label">Job Title</label>
                <input className="inp" placeholder="e.g. Senior Frontend Engineer"
                  value={roleForm.title}
                  onChange={e=>{
                    setRoleForm(f=>({...f,title:e.target.value}));
                    if(e.target.value.length > 3) autoDetectRoleSkills(e.target.value, roleForm.seniority);
                  }}/>
              </div>

              <div className="field">
                <label className="label">Seniority</label>
                <select className="sel inp" value={roleForm.seniority} onChange={e=>setRoleForm(f=>({...f,seniority:e.target.value}))}>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead / Staff</option>
                  <option value="exec">Executive</option>
                </select>
              </div>

              <div className="field">
                <label className="label">Job Description <span style={{fontWeight:400,color:"var(--dim)"}}>— saves once, reused for all candidates</span></label>
                <textarea className="inp" style={{minHeight:100}}
                  placeholder="Paste the full job description here..."
                  value={roleForm.job_description} onChange={e=>setRoleForm(f=>({...f,job_description:e.target.value}))}/>
              </div>

              <div className="field">
                <label className="label">Skills to Evaluate <span style={{fontWeight:400,color:"var(--dim)"}}>— auto-detected, edit freely</span></label>
                <div className="skill-tags" style={{marginBottom:8}}>
                  {roleSkills.map(name=>(
                    <div key={name} className="skill-tag">
                      <span>{name}</span>
                      <button className="skill-tag-remove" onClick={()=>setRoleSkills(s=>s.filter(x=>x!==name))}>×</button>
                    </div>
                  ))}
                </div>
                <div className="add-skill-row">
                  <input className="add-skill-inp" placeholder="Add skill..."
                    value={roleSkillInput} onChange={e=>setRoleSkillInput(e.target.value)}
                    onKeyDown={e=>{
                      if(e.key==="Enter" && roleSkillInput.trim() && !roleSkills.includes(roleSkillInput.trim())){
                        setRoleSkills(s=>[...s,roleSkillInput.trim()]);
                        setRoleSkillInput("");
                      }
                    }}/>
                  <button className="add-skill-btn" onClick={()=>{
                    if(roleSkillInput.trim() && !roleSkills.includes(roleSkillInput.trim())){
                      setRoleSkills(s=>[...s,roleSkillInput.trim()]);
                      setRoleSkillInput("");
                    }
                  }}>+ Add</button>
                </div>
              </div>

              <div className="modal-actions">
                <button className="modal-cancel" onClick={()=>{setShowRoleModal(false);setEditingRole(null);}}>Cancel</button>
                <button className="modal-save" onClick={saveRole}>
                  {editingRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && <div className="toast">✓ {toast}</div>}
      </div>
    </>
  );
}
