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

.interview-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;padding:32px 24px;min-height:0}
.question-card{
  width:100%;max-width:680px;
  background:var(--ink2);border:1px solid var(--line);
  border-radius:16px;padding:32px;
  display:flex;flex-direction:column;gap:24px;
  animation:riseIn .35s ease;
  margin:auto 0;
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

/* ── PROFILE DROPDOWN ── */
.profile-wrap{position:relative}
.profile-btn{
  display:flex;align-items:center;gap:8px;
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:8px;padding:5px 10px 5px 6px;
  cursor:pointer;transition:.15s;
}
.profile-btn:hover{border-color:var(--hi)}
.profile-avatar{
  width:26px;height:26px;border-radius:6px;
  background:linear-gradient(135deg,var(--hi),var(--hi2));
  display:flex;align-items:center;justify-content:center;
  font:700 11px var(--font);color:#000;flex-shrink:0;
}
.profile-email{font:500 11px var(--mono);color:var(--text);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.profile-chevron{font-size:9px;color:var(--sub);transition:.2s}
.profile-dropdown{
  position:absolute;top:calc(100% + 8px);right:0;
  background:var(--ink2);border:1px solid var(--line2);
  border-radius:10px;padding:8px;min-width:220px;
  box-shadow:0 8px 32px rgba(0,0,0,.4);z-index:200;
  animation:toastIn .15s ease;
}
.profile-info{padding:10px 10px 12px;border-bottom:1px solid var(--line)}
.profile-name{font:700 14px var(--font);margin-bottom:3px}
.profile-mail{font:400 11px var(--mono);color:var(--sub)}
.profile-plan{
  display:inline-block;margin-top:6px;
  padding:2px 8px;border-radius:4px;
  font:600 9px var(--mono);letter-spacing:1px;text-transform:uppercase;
  background:rgba(56,189,248,.1);color:var(--hi);border:1px solid rgba(56,189,248,.2);
}
.profile-menu-item{
  display:flex;align-items:center;gap:8px;
  padding:8px 10px;border-radius:7px;
  font:500 12px var(--font);color:var(--text);
  cursor:pointer;transition:.15s;margin-top:2px;
}
.profile-menu-item:hover{background:var(--ink3)}
.profile-menu-item.danger{color:var(--rose)}
.profile-menu-item.danger:hover{background:rgba(248,113,113,.08)}
.profile-usage-bar{
  margin:8px 10px 4px;padding:10px;
  background:var(--ink3);border-radius:7px;
  border:1px solid var(--line);
}
.pub-label{font:600 10px var(--mono);letter-spacing:1px;color:var(--sub);text-transform:uppercase;margin-bottom:6px}
.pub-track{height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:4px}
.pub-fill{height:100%;border-radius:2px;transition:width .6s ease}
.pub-nums{font:500 10px var(--mono);color:var(--sub)}
/* ── CANDIDATE STATUS ── */
.status-badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:20px;
  font:600 10px var(--mono);letter-spacing:.5px;cursor:pointer;
  transition:.15s;white-space:nowrap;
}
.status-applied{background:rgba(93,122,148,.15);color:#5d7a94;border:1px solid rgba(93,122,148,.3)}
.status-screened{background:rgba(56,189,248,.1);color:var(--hi);border:1px solid rgba(56,189,248,.25)}
.status-interviewed{background:rgba(129,140,248,.1);color:var(--hi2);border:1px solid rgba(129,140,248,.25)}
.status-offer{background:rgba(251,191,36,.1);color:var(--amber);border:1px solid rgba(251,191,36,.25)}
.status-hired{background:rgba(52,211,153,.1);color:var(--green);border:1px solid rgba(52,211,153,.3)}
.status-rejected{background:rgba(248,113,113,.08);color:var(--rose);border:1px solid rgba(248,113,113,.2)}

.status-menu{
  position:fixed;z-index:9000;
  background:var(--ink2);border:1px solid var(--line2);
  border-radius:9px;padding:6px;min-width:150px;
  box-shadow:0 8px 32px rgba(0,0,0,.6);
  animation:toastIn .15s ease;
}
.status-menu-item{
  padding:7px 10px;border-radius:6px;
  font:500 11px var(--mono);cursor:pointer;
  transition:.1s;display:flex;align-items:center;gap:7px;
}
.status-menu-item:hover{background:var(--ink3)}

/* ── PDF EXPORT ── */
.export-btn{
  padding:6px 14px;background:rgba(52,211,153,.1);
  border:1px solid rgba(52,211,153,.25);border-radius:6px;
  color:var(--green);font:600 10px var(--mono);
  letter-spacing:.5px;cursor:pointer;transition:.15s;
  display:flex;align-items:center;gap:5px;
}
.export-btn:hover{background:rgba(52,211,153,.18)}

/* ── COMPARISON VIEW ── */
.comparison-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.85);
  z-index:500;display:flex;flex-direction:column;overflow:hidden;
}
.comparison-head{
  padding:16px 24px;background:var(--ink2);border-bottom:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
}
.comparison-title{font:700 15px var(--font)}
.comparison-grid{
  flex:1;overflow:auto;padding:20px 24px;
  display:grid;gap:16px;
}
.comp-card{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:12px;overflow:hidden;
}
.comp-card.winner{border-color:rgba(52,211,153,.5);box-shadow:0 0 20px rgba(52,211,153,.1)}
.comp-card-head{
  padding:14px 18px;border-bottom:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;
}
.comp-card-name{font:700 15px var(--font)}
.comp-score{font:900 24px var(--font);border:3px solid;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;flex-shrink:0}
.comp-score-sub{font:500 9px var(--mono);opacity:.5;margin-top:1px}
.comp-card-body{padding:14px 18px;display:flex;flex-direction:column;gap:10px}
.comp-winner-badge{
  font:700 10px var(--mono);letter-spacing:1px;text-transform:uppercase;
  background:rgba(52,211,153,.1);color:var(--green);
  border:1px solid rgba(52,211,153,.3);padding:2px 8px;border-radius:4px;
}

/* ── TEMPLATES LIBRARY ── */
.templates-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.8);
  z-index:400;display:flex;align-items:center;justify-content:center;
  padding:20px;
}
.templates-modal{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:14px;width:100%;max-width:720px;
  max-height:85vh;display:flex;flex-direction:column;overflow:hidden;
}
.templates-head{
  padding:20px 24px;border-bottom:1px solid var(--line);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
}
.templates-title{font:700 16px var(--font)}
.templates-search{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:7px;padding:8px 12px;
  color:var(--text);font:400 13px var(--font);outline:none;
  width:200px;transition:.15s;
}
.templates-search:focus{border-color:var(--hi)}
.templates-scroll{flex:1;overflow:auto;padding:16px 24px}
.templates-category{margin-bottom:20px}
.templates-cat-label{
  font:700 10px var(--mono);letter-spacing:2px;text-transform:uppercase;
  color:var(--sub);margin-bottom:10px;
}
.templates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.template-card{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:9px;padding:12px 14px;cursor:pointer;transition:.2s;
}
.template-card:hover{border-color:var(--hi);background:rgba(56,189,248,.04)}
.template-card-title{font:700 13px var(--font);margin-bottom:4px}
.template-card-skills{font:400 11px var(--font);color:var(--sub);line-height:1.5}
.template-card-count{font:500 10px var(--mono);color:var(--dim);margin-top:6px}

/* ── INTERVIEW SETUP ── */
.setup-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.75);
  z-index:800;display:flex;align-items:center;justify-content:center;padding:20px;
}
.setup-card{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:14px;padding:28px;width:100%;max-width:480px;
  display:flex;flex-direction:column;gap:14px;
}
.setup-title{font:700 16px var(--font)}
.setup-sub{font-size:12px;color:var(--sub);line-height:1.6;margin-top:-6px}
.setup-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.setup-optional{
  font:400 10px var(--mono);color:var(--dim);
  letter-spacing:.5px;margin-left:6px;
}
/* ── PHASE 2: ADMIN + NOTES + EMAIL BRANDING ── */

/* Admin */
.admin-view{flex:1;overflow:auto;padding:24px;display:flex;flex-direction:column;gap:20px}
.admin-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.admin-stat{
  background:var(--ink2);border:1px solid var(--line);
  border-radius:10px;padding:16px 20px;
}
.admin-stat-val{font:900 28px var(--font);margin-bottom:4px}
.admin-stat-label{font:500 11px var(--mono);color:var(--sub);letter-spacing:.5px;text-transform:uppercase}
.admin-table-wrap{background:var(--ink2);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.admin-table{width:100%;border-collapse:collapse}
.admin-table th{
  padding:11px 16px;text-align:left;
  font:700 10px var(--mono);letter-spacing:1.5px;text-transform:uppercase;
  color:var(--sub);border-bottom:1px solid var(--line);background:var(--ink3);
}
.admin-table td{padding:12px 16px;font-size:13px;border-bottom:1px solid var(--line)}
.admin-table tr:last-child td{border-bottom:none}
.admin-table tr:hover td{background:var(--ink3)}
.plan-select{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:6px;padding:4px 8px;
  color:var(--text);font:500 11px var(--mono);cursor:pointer;outline:none;
}

/* Notes timeline */
.notes-timeline{display:flex;flex-direction:column;gap:0}
.note-entry{
  display:flex;gap:14px;padding:12px 0;
  border-bottom:1px solid var(--line);
}
.note-entry:last-child{border-bottom:none}
.note-dot-wrap{display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;padding-top:3px}
.note-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.note-line{width:1px;flex:1;background:var(--line);margin-top:4px}
.note-content{flex:1}
.note-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.note-type-chip{
  font:600 9px var(--mono);letter-spacing:1px;text-transform:uppercase;
  padding:2px 6px;border-radius:4px;
}
.note-time{font:400 10px var(--mono);color:var(--dim)}
.note-text{font-size:13px;color:var(--text);line-height:1.6}
.add-note-row{display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.note-type-sel{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:7px;padding:8px 10px;
  color:var(--text);font:400 12px var(--font);outline:none;
  flex-shrink:0;width:130px;
}
.add-note-btn{
  padding:8px 14px;background:rgba(56,189,248,.1);
  border:1px solid rgba(56,189,248,.25);border-radius:7px;
  color:var(--hi);font:600 11px var(--mono);cursor:pointer;
  transition:.15s;white-space:nowrap;flex-shrink:0;
}
.add-note-btn:hover{background:rgba(56,189,248,.18)}

/* Settings / Email Branding */
.settings-view{flex:1;overflow:auto;padding:24px;display:flex;flex-direction:column;gap:20px;max-width:640px}
.settings-section{background:var(--ink2);border:1px solid var(--line);border-radius:12px;padding:20px 24px}
.settings-section-title{font:700 14px var(--font);margin-bottom:4px}
.settings-section-sub{font-size:12px;color:var(--sub);line-height:1.6;margin-bottom:16px}
.settings-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.preview-email{
  background:var(--ink3);border:1px solid var(--line2);
  border-radius:8px;padding:14px 16px;
  font-size:12.5px;line-height:1.8;color:var(--text);
  white-space:pre-wrap;margin-top:12px;
}
.save-settings-btn{
  padding:10px 20px;background:linear-gradient(135deg,var(--hi),var(--hi2));
  border:none;border-radius:8px;color:#000;font:700 13px var(--font);
  cursor:pointer;transition:.2s;margin-top:4px;
}
.save-settings-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(56,189,248,.2)}
/* ── ONBOARDING ── */
.onboard-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}
.onboard-card{background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:36px;width:100%;max-width:520px;text-align:center}
.onboard-icon{font-size:48px;margin-bottom:16px}
.onboard-title{font:900 24px var(--font);margin-bottom:8px;letter-spacing:-.5px}
.onboard-sub{font-size:14px;color:var(--sub);line-height:1.7;margin-bottom:28px;max-width:380px;margin-left:auto;margin-right:auto}
.onboard-steps{display:flex;flex-direction:column;gap:12px;margin-bottom:28px;text-align:left}
.onboard-step{display:flex;align-items:center;gap:14px;background:var(--ink3);border:1px solid var(--line2);border-radius:10px;padding:14px 16px}
.onboard-step-num{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--hi),var(--hi2));display:flex;align-items:center;justify-content:center;font:700 13px var(--font);color:#000;flex-shrink:0}
.onboard-step-text{font-size:13px;line-height:1.5}
.onboard-step-title{font:700 13px var(--font);display:block;margin-bottom:2px}
.onboard-btn{padding:14px 32px;background:linear-gradient(135deg,var(--hi),var(--hi2));border:none;border-radius:10px;color:#000;font:700 15px var(--font);cursor:pointer;transition:all .2s}
.onboard-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(56,189,248,.25)}

/* ── PIPELINE SEARCH ── */
.pipeline-search{background:var(--ink3);border:1px solid var(--line2);border-radius:7px;padding:7px 12px;color:var(--text);font:400 13px var(--font);outline:none;transition:.15s;width:200px}
.pipeline-search:focus{border-color:var(--hi)}
.pipeline-search::placeholder{color:var(--dim)}

/* ── PRO BADGE ── */
.pro-badge{display:inline-block;padding:2px 7px;border-radius:4px;font:700 9px var(--mono);letter-spacing:1px;text-transform:uppercase;background:linear-gradient(135deg,var(--amber),#f59e0b);color:#000;margin-left:6px}
.free-badge{display:inline-block;padding:2px 7px;border-radius:4px;font:700 9px var(--mono);letter-spacing:1px;text-transform:uppercase;background:rgba(93,122,148,.2);color:var(--sub);margin-left:6px}

/* ── CONFIRM DIALOG ── */
.confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1500;display:flex;align-items:center;justify-content:center;padding:20px}
.confirm-card{background:var(--ink2);border:1px solid var(--line);border-radius:12px;padding:24px;width:100%;max-width:380px}
.confirm-title{font:700 16px var(--font);margin-bottom:8px}
.confirm-sub{font-size:13px;color:var(--sub);line-height:1.6;margin-bottom:20px}
.confirm-actions{display:flex;gap:10px;justify-content:flex-end}

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
/* ── PHASE 3: TEAM + REFERRAL + BIAS + NOTIFICATIONS ── */

/* Team */
.team-view{flex:1;overflow:auto;padding:24px;display:flex;flex-direction:column;gap:20px}
.team-head{display:flex;align-items:center;justify-content:space-between}
.team-section{background:var(--ink2);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.team-section-head{padding:16px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
.team-section-title{font:700 14px var(--font)}
.member-row{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--line)}
.member-row:last-child{border-bottom:none}
.member-avatar{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--hi2),var(--violet));display:flex;align-items:center;justify-content:center;font:700 14px var(--font);color:#fff;flex-shrink:0}
.member-info{flex:1}
.member-name{font:600 13px var(--font)}
.member-email{font:400 11px var(--mono);color:var(--sub);margin-top:1px}
.member-role-badge{font:600 9px var(--mono);letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:4px;background:rgba(56,189,248,.1);color:var(--hi);border:1px solid rgba(56,189,248,.2)}
.invite-row{display:flex;gap:8px;padding:14px 20px}

/* Referral */
.referral-card{background:linear-gradient(135deg,rgba(56,189,248,.08),rgba(129,140,248,.08));border:1px solid rgba(56,189,248,.2);border-radius:12px;padding:20px 24px}
.referral-link-box{background:var(--ink3);border:1px solid var(--line2);border-radius:8px;padding:10px 14px;font:500 12px var(--mono);color:var(--hi);display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0;word-break:break-all}
.referral-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:12px}
.referral-stat{background:var(--ink3);border:1px solid var(--line);border-radius:8px;padding:12px 14px;text-align:center}
.referral-stat-val{font:900 20px var(--font);color:var(--hi)}
.referral-stat-label{font:500 10px var(--mono);color:var(--sub);letter-spacing:.5px;text-transform:uppercase;margin-top:2px}

/* Bias Report */
.bias-report-view{flex:1;overflow:auto;padding:24px;display:flex;flex-direction:column;gap:20px}
.bias-chart-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.bias-card{background:var(--ink2);border:1px solid var(--line);border-radius:12px;padding:18px 20px}
.bias-card-title{font:700 13px var(--font);margin-bottom:14px;display:flex;align-items:center;gap:8px}
.bias-bar-item{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.bias-bar-label{font-size:12px;color:var(--text);width:120px;flex-shrink:0}
.bias-bar-track{flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden}
.bias-bar-fill{height:100%;border-radius:3px;transition:width .8s ease}
.bias-bar-val{font:600 11px var(--mono);color:var(--sub);width:32px;text-align:right;flex-shrink:0}
.bias-insight{background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:8px;padding:12px 14px;font-size:12.5px;color:var(--amber);line-height:1.6;display:flex;gap:10px}
.bias-ok{background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:12px 14px;font-size:12.5px;color:var(--green);line-height:1.6;display:flex;gap:10px}

/* Notifications */
.notif-section{background:var(--ink2);border:1px solid var(--line);border-radius:12px;padding:20px 24px}
.notif-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)}
.notif-toggle-row:last-child{border-bottom:none}
.notif-toggle-info{flex:1}
.notif-toggle-title{font:600 13px var(--font)}
.notif-toggle-sub{font:400 11px var(--font);color:var(--sub);margin-top:2px}
.toggle-switch{width:40px;height:22px;background:var(--line2);border-radius:11px;position:relative;cursor:pointer;transition:.2s;flex-shrink:0;border:none}
.toggle-switch.on{background:var(--hi)}
.toggle-knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.2s}
.toggle-switch.on .toggle-knob{left:21px}
.webhook-test-btn{padding:6px 12px;background:none;border:1px solid var(--line2);border-radius:6px;color:var(--sub);font:600 10px var(--mono);cursor:pointer;transition:.15s;white-space:nowrap}
.webhook-test-btn:hover{border-color:var(--green);color:var(--green)}

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

const CANDIDATE_STATUSES = [
  {id:"applied",    label:"Applied",     color:"status-applied"},
  {id:"screened",   label:"Screened",    color:"status-screened"},
  {id:"interviewed",label:"Interviewed", color:"status-interviewed"},
  {id:"offer",      label:"Offer Sent",  color:"status-offer"},
  {id:"hired",      label:"Hired ✓",     color:"status-hired"},
  {id:"rejected",   label:"Rejected",    color:"status-rejected"},
];

const INTERVIEW_TEMPLATES = [
  {id:"frontend",   category:"Engineering", title:"Frontend Engineer",      skills:["React/JS","CSS/Design","Problem Solving","Code Quality","Communication","System Design"],        questions:7},
  {id:"backend",    category:"Engineering", title:"Backend Engineer",       skills:["System Design","Database","APIs","Problem Solving","Code Quality","Communication"],             questions:7},
  {id:"fullstack",  category:"Engineering", title:"Full Stack Engineer",    skills:["Frontend","Backend","System Design","Problem Solving","Communication","Adaptability"],          questions:8},
  {id:"ml",         category:"Engineering", title:"ML Engineer",            skills:["ML Theory","Python","MLOps","Problem Solving","Communication","Research"],                       questions:8},
  {id:"devops",     category:"Engineering", title:"DevOps / SRE",           skills:["Infrastructure","Automation","Reliability","Problem Solving","Communication","Security"],       questions:7},
  {id:"mobile",     category:"Engineering", title:"Mobile Engineer",        skills:["iOS/Android","Performance","UX Awareness","Problem Solving","Communication","Code Quality"],    questions:7},
  {id:"product",    category:"Product",     title:"Product Manager",        skills:["Product Sense","Prioritization","Data Analysis","Communication","Leadership","User Empathy"],   questions:8},
  {id:"designer",   category:"Design",      title:"UX/Product Designer",    skills:["User Research","Visual Design","Prototyping","Communication","Problem Solving","User Empathy"], questions:7},
  {id:"brand",      category:"Design",      title:"Brand Designer",         skills:["Visual Design","Creativity","Communication","Attention to Detail","Culture Fit","Adaptability"],questions:6},
  {id:"ae",         category:"Sales",       title:"Account Executive",      skills:["Communication","Persuasion","Resilience","Product Knowledge","Negotiation","Culture Fit"],      questions:7},
  {id:"sdr",        category:"Sales",       title:"SDR / BDR",              skills:["Communication","Resilience","Prospecting","Product Knowledge","Culture Fit","Adaptability"],    questions:6},
  {id:"csm",        category:"Sales",       title:"Customer Success Mgr",   skills:["Communication","Empathy","Problem Solving","Product Knowledge","Leadership","Retention"],       questions:7},
  {id:"growth",     category:"Marketing",   title:"Growth Marketer",        skills:["Analytical Thinking","Creativity","Experimentation","Communication","Data Analysis","Culture Fit"],questions:7},
  {id:"content",    category:"Marketing",   title:"Content Marketer",       skills:["Writing","Creativity","SEO","Communication","Analytical Thinking","Culture Fit"],               questions:6},
  {id:"em",         category:"Management",  title:"Engineering Manager",    skills:["Leadership","Communication","Technical Depth","People Management","Strategic Thinking","Culture Fit"],questions:10},
  {id:"pm_mgr",     category:"Management",  title:"Product Director",       skills:["Leadership","Product Sense","Communication","Strategic Thinking","Data Analysis","Culture Fit"],questions:10},
  {id:"da",         category:"Data",        title:"Data Analyst",           skills:["SQL","Data Visualization","Analytical Thinking","Communication","Problem Solving","Attention to Detail"],questions:7},
  {id:"ds",         category:"Data",        title:"Data Scientist",         skills:["Statistics","Python/R","ML Basics","Communication","Problem Solving","Analytical Thinking"],    questions:8},
  {id:"hr",         category:"HR",          title:"HR Business Partner",    skills:["Communication","Empathy","Employee Relations","Problem Solving","Culture Fit","Leadership"],    questions:7},
  {id:"finance",    category:"Finance",     title:"Finance Analyst",        skills:["Financial Modeling","Analytical Thinking","Excel/Sheets","Communication","Attention to Detail","Problem Solving"],questions:7},
];

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
  const [interviewContext, setInterviewContext] = useState({
    yearsExp: "", background: "", roundNumber: "1", redFlags: "", industryContext: ""
  });
  const [showInterviewSetup, setShowInterviewSetup] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({title:"",seniority:"mid",job_description:""});
  const [roleSkills, setRoleSkills] = useState([...DEFAULT_SKILLS]);
  const [roleSkillInput, setRoleSkillInput] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedPipelineCandidate, setSelectedPipelineCandidate] = useState(null);
  const [pipelineResults, setPipelineResults] = useState({});
  const [candidateStatuses, setCandidateStatuses] = useState({});
  const [statusMenuFor, setStatusMenuFor] = useState(null);
  const [showComparison, setShowComparison] = useState(null);
  const [pipelineSort, setPipelineSort] = useState('score');
  const [statusMenuPos, setStatusMenuPos] = useState({top:0,left:0});
  // Phase 2 state
  const [adminUsers, setAdminUsers] = useState([]);
  const [candidateNotes, setCandidateNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState("general");
  const [notesFor, setNotesFor] = useState(null);
  const [emailBranding, setEmailBranding] = useState({company_name:"",recruiter_name:"",email_signature:""});
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState("scorecard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pipelineSearch, setPipelineSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [dbCandidates, setDbCandidates] = useState([]);
  // Phase 3
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySlack, setNotifySlack] = useState("");
  const [notifyOnAnalysis, setNotifyOnAnalysis] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [biasReport, setBiasReport] = useState(null);
  const [generatingBias, setGeneratingBias] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");

  // Clean up reset-password URL if it's lingering (only on mount)
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes('reset-password') || (hash.includes('access_token') && hash.includes('type=recovery'))) {
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Load user profile + recalculate limits + monthly reset on login
  useEffect(() => {
    if (!session) return;
    const loadProfile = async () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Get current profile
      const { data: existing } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();

      // Check if we need monthly reset
      const needsReset = existing &&
        (existing.last_reset_month !== currentMonth || existing.last_reset_year !== currentYear);

      // Recalculate dynamic limits
      const { count } = await supabase
        .from('profiles').select('*', { count: 'exact', head: true });
      const totalUsers = count || 1;
      const newLimit = Math.max(10, Math.floor(500 / totalUsers));

      const updates = { analyses_limit: newLimit };
      if (needsReset) {
        updates.analyses_used = 0;
        updates.last_reset_month = currentMonth;
        updates.last_reset_year = currentYear;
      }

      await supabase.from('profiles').update(updates).eq('id', session.user.id);

      const { data } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile({...data, ...updates});
    };
    loadProfile();
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Load roles + pipeline candidate statuses
  useEffect(() => {
    if (!session) return;
    const loadRoles = async () => {
      const { data } = await supabase
        .from('roles').select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setRoles(data);
    };
    const loadStatuses = async () => {
      const { data } = await supabase
        .from('pipeline_candidates').select('candidate_name, role_title, status')
        .eq('user_id', session.user.id);
      if (data) {
        const statusMap = {};
        data.forEach(c => { statusMap[`${c.candidate_name}-${c.role_title}`] = c.status || 'interviewed'; });
        setCandidateStatuses(statusMap);
      }
    };
    const loadBranding = async () => {
      const { data } = await supabase
        .from('profiles').select('company_name,recruiter_name,email_signature')
        .eq('id', session.user.id).single();
      if (data) setEmailBranding({
        company_name: data.company_name || "",
        recruiter_name: data.recruiter_name || "",
        email_signature: data.email_signature || ""
      });
    };
    // Fix 1 & 3: Load pipeline candidates from DB so they persist across sessions
    const loadPipelineCandidates = async () => {
      const { data } = await supabase
        .from('pipeline_candidates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const mapped = data.map((c, i) => ({
          name: c.candidate_name,
          role: c.role_title,
          score: c.score,
          verdict: c.verdict,
          jdMatch: c.jd_match,
          skillScores: c.skill_scores || {},
          summary: c.summary,
          savedAt: new Date(c.created_at).toLocaleTimeString(),
          avatarIdx: c.avatar_idx || (i % 8),
          fullResult: {
            overallScore: c.score,
            verdict: c.verdict,
            summary: c.summary,
            skillScores: c.skill_scores || {},
            jdMatchScore: c.jd_match,
            strengths: c.strengths || [],
            concerns: c.concerns || [],
            nextSteps: c.next_steps || [],
          }
        }));
        setDbCandidates(mapped);
        setCandidates(mapped);
      }
    };
    loadRoles();
    loadStatuses();
    loadBranding();
    loadPipelineCandidates();
    // Load Phase 3 data
    loadTeam();
    loadReferral();
    loadNotifSettings();
    // Show onboarding for new users
    const hasSeenOnboarding = localStorage.getItem('hireiq_onboarded');
    if (!hasSeenOnboarding) {
      setTimeout(() => setShowOnboarding(true), 800);
    }
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
    const role = roles.find(r => r.id === id);
    setConfirmDialog({
      title: "Archive this role?",
      message: `"${role?.title}" will be archived. All candidate history is preserved and you can restore it anytime.`,
      confirmLabel: "Archive",
      danger: true,
      onConfirm: async () => {
        await supabase.from('roles').update({ status: 'archived' }).eq('id', id);
        setRoles(r => r.map(x => x.id === id ? {...x, status:'archived'} : x));
        setConfirmDialog(null);
        showToast("Role archived");
      }
    });
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('hireiq_selected_role', JSON.stringify(role));
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

  // Remember last interview round + restore selected role
  useEffect(() => {
    const savedRound = localStorage.getItem('hireiq_last_round');
    if (savedRound) setInterviewContext(c=>({...c, roundNumber: savedRound}));

    const savedRole = localStorage.getItem('hireiq_selected_role');
    if (savedRole) {
      try {
        const role = JSON.parse(savedRole);
        setSelectedRole(role);
        setForm(f => ({ ...f, role: role.title, seniority: role.seniority, jd: role.job_description || "" }));
        if (role.skills && role.skills.length > 0) {
          setSkillsList(role.skills);
          setSkills(Object.fromEntries(role.skills.map(s=>[s,0])));
        }
      } catch(e) {}
    }
  }, []);

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

  /* ── PHASE 2 FUNCTIONS ── */

  // Admin: load all users
  const loadAdminData = async () => {
    // The "Admins can view all profiles" RLS policy allows this
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,full_name,plan,analyses_used,analyses_limit,created_at,is_admin')
      .order('created_at', { ascending: false });
    if (data) setAdminUsers(data);
    if (error) console.error('Admin load error:', error);
  };

  const updateUserPlan = async (userId, plan, limit) => {
    await supabase.from('profiles')
      .update({ plan, analyses_limit: limit })
      .eq('id', userId);
    setAdminUsers(u => u.map(x => x.id === userId ? {...x, plan, analyses_limit: limit} : x));
    showToast("✓ User plan updated");
  };

  // Notes
  const loadNotes = async (candidateName, roleTitle) => {
    setNotesFor(`${candidateName}-${roleTitle}`);
    const { data } = await supabase
      .from('candidate_notes')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('candidate_name', candidateName)
      .eq('role_title', roleTitle)
      .order('created_at', { ascending: true });
    if (data) setCandidateNotes(data);
  };

  const addNote = async (candidateName, roleTitle) => {
    if (!newNote.trim()) return;
    const { data } = await supabase.from('candidate_notes').insert({
      user_id: session.user.id,
      candidate_name: candidateName,
      role_title: roleTitle,
      note: newNote.trim(),
      note_type: newNoteType,
    }).select().single();
    if (data) setCandidateNotes(n => [...n, data]);
    setNewNote("");
    showToast("✓ Note added");
  };

  const deleteNote = async (noteId) => {
    await supabase.from('candidate_notes').delete().eq('id', noteId);
    setCandidateNotes(n => n.filter(x => x.id !== noteId));
  };

  // Email Branding
  const saveBranding = async () => {
    await supabase.from('profiles').update({
      company_name: emailBranding.company_name,
      recruiter_name: emailBranding.recruiter_name,
      email_signature: emailBranding.email_signature,
    }).eq('id', session.user.id);
    setProfile(p => ({...p, ...emailBranding}));
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2000);
    showToast("✓ Branding saved");
  };

  const applyBrandingToEmail = (emailText) => {
    if (!emailBranding.company_name && !emailBranding.recruiter_name) return emailText;
    let branded = emailText;
    if (emailBranding.company_name) {
      branded = branded.replace(/\[Company\]/gi, emailBranding.company_name)
                       .replace(/our company/gi, emailBranding.company_name)
                       .replace(/the company/gi, emailBranding.company_name);
    }
    if (emailBranding.recruiter_name) {
      branded = branded.replace(/\[Your Name\]/gi, emailBranding.recruiter_name)
                       .replace(/Best regards,[\s\S]*?$/m, `Best regards,
${emailBranding.recruiter_name}${emailBranding.company_name ? `
${emailBranding.company_name}` : ""}${emailBranding.email_signature ? `
${emailBranding.email_signature}` : ""}`);
    }
    return branded;
  };

  const NOTE_TYPES = [
    {id:"general",    label:"General",     color:"var(--sub)",   bg:"rgba(93,122,148,.15)"},
    {id:"interview",  label:"Interview",   color:"var(--hi)",    bg:"rgba(56,189,248,.1)"},
    {id:"concern",    label:"Concern",     color:"var(--rose)",  bg:"rgba(248,113,113,.1)"},
    {id:"positive",   label:"Positive",    color:"var(--green)", bg:"rgba(52,211,153,.1)"},
    {id:"followup",   label:"Follow-up",   color:"var(--amber)", bg:"rgba(251,191,36,.1)"},
  ];

  const getNoteType = (id) => NOTE_TYPES.find(t => t.id === id) || NOTE_TYPES[0];

  /* ── PHASE 3 FUNCTIONS ── */

  // Team
  const loadTeam = async () => {
    const { data: membership } = await supabase
      .from('team_members').select('team_id').eq('user_id', session.user.id).single();
    if (membership) {
      const { data: teamData } = await supabase
        .from('teams').select('*').eq('id', membership.team_id).single();
      if (teamData) setTeam(teamData);
      const { data: members } = await supabase
        .from('team_members')
        .select('*, profiles(full_name, email, plan)')
        .eq('team_id', membership.team_id);
      if (members) setTeamMembers(members);
    }
  };

  const createTeam = async () => {
    if (!teamName.trim()) return;
    const { data } = await supabase.from('teams').insert({
      name: teamName, owner_id: session.user.id
    }).select().single();
    if (data) {
      await supabase.from('team_members').insert({
        team_id: data.id, user_id: session.user.id, role: 'owner'
      });
      await supabase.from('profiles').update({ team_id: data.id }).eq('id', session.user.id);
      setTeam(data);
      setTeamMembers([{ user_id: session.user.id, role: 'owner', profiles: { full_name: profile?.full_name, email: session.user.email } }]);
      setTeamName("");
      showToast("✓ Team created!");
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !team) return;
    const { data } = await supabase.from('team_invites').insert({
      team_id: team.id,
      invited_email: inviteEmail.trim(),
      invited_by: session.user.id,
    }).select().single();
    if (data) {
      showToast(`✓ Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    }
  };

  const removeMember = async (userId) => {
    if (!team || userId === session.user.id) return;
    await supabase.from('team_members').delete()
      .eq('team_id', team.id).eq('user_id', userId);
    setTeamMembers(m => m.filter(x => x.user_id !== userId));
    showToast("Member removed");
  };

  // Referral
  const loadReferral = async () => {
    const { data } = await supabase
      .from('profiles').select('referral_code,referral_count')
      .eq('id', session.user.id).single();
    if (data) {
      setReferralCode(data.referral_code || "");
      setReferralCount(data.referral_count || 0);
      setReferralBonus((data.referral_count || 0) * 50);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  // Notifications
  const loadNotifSettings = async () => {
    const { data } = await supabase
      .from('profiles').select('notify_email,notify_slack_webhook')
      .eq('id', session.user.id).single();
    if (data) {
      setNotifyEmail(data.notify_email || "");
      setNotifySlack(data.notify_slack_webhook || "");
      setNotifyOnAnalysis(!!(data.notify_email || data.notify_slack_webhook));
    }
  };

  const saveNotifSettings = async () => {
    await supabase.from('profiles').update({
      notify_email: notifyEmail,
      notify_slack_webhook: notifySlack,
    }).eq('id', session.user.id);
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2000);
    showToast("✓ Notification settings saved");
  };

  const sendNotification = async (candidateName, scorecard) => {
    if (!notifyEmail && !notifySlack) return;
    const summary = `HireIQ Scorecard: ${candidateName} — ${scorecard.verdict} (${scorecard.overallScore}/100)

${scorecard.summary}`;
    // Email notification via mailto (opens client)
    if (notifyEmail) {
      const subject = encodeURIComponent(`HireIQ: ${candidateName} scored ${scorecard.overallScore}/100 — ${scorecard.verdict}`);
      const body = encodeURIComponent(summary);
      window.open(`mailto:${notifyEmail}?subject=${subject}&body=${body}`);
    }
    // Slack webhook
    if (notifySlack) {
      try {
        await fetch(notifySlack, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `*HireIQ Scorecard Ready* 🎯
*Candidate:* ${candidateName}
*Role:* ${selectedRole?.title}
*Score:* ${scorecard.overallScore}/100
*Verdict:* ${scorecard.verdict}

${scorecard.summary}`
          })
        });
      } catch(e) { console.error('Slack notif failed:', e); }
    }
  };

  const testSlackWebhook = async () => {
    if (!notifySlack) { showToast("⚠ Enter a Slack webhook URL first"); return; }
    try {
      await fetch(notifySlack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: "✅ HireIQ test notification — your webhook is working!" })
      });
      showToast("✓ Test sent to Slack!");
    } catch(e) { showToast("⚠ Webhook test failed — check the URL"); }
  };

  // Bias Report
  const generateBiasReport = async () => {
    if (candidates.length < 3) { showToast("⚠ Need at least 3 candidates to generate a bias report"); return; }
    setGeneratingBias(true);

    const verdictCounts = {};
    const skillAvgs = {};
    const biasFlags = [];
    let totalScore = 0;

    candidates.forEach(c => {
      verdictCounts[c.verdict] = (verdictCounts[c.verdict] || 0) + 1;
      totalScore += c.score || 0;
      Object.entries(c.skillScores || {}).forEach(([k,v]) => {
        if (!skillAvgs[k]) skillAvgs[k] = [];
        skillAvgs[k].push(v);
      });
      const fr = pipelineResults[`${c.name}-${c.role}`];
      if (fr?.biasFlags?.length > 0) biasFlags.push(...fr.biasFlags);
    });

    const avgScore = Math.round(totalScore / candidates.length);
    const skillAverages = Object.entries(skillAvgs).map(([k,v]) => ({
      skill: k, avg: Math.round(v.reduce((a,b)=>a+b,0)/v.length)
    })).sort((a,b) => a.avg - b.avg);

    setBiasReport({
      totalCandidates: candidates.length,
      avgScore,
      verdictCounts,
      skillAverages,
      biasFlags: [...new Set(biasFlags)],
      lowestSkill: skillAverages[0],
      highestSkill: skillAverages[skillAverages.length-1],
      generatedAt: new Date().toLocaleDateString(),
    });
    setGeneratingBias(false);
  };

  /* ── PHASE 1 FUNCTIONS ── */

  // Status management
  const updateCandidateStatus = async (candidateKey, newStatus) => {
    setCandidateStatuses(prev => ({...prev, [candidateKey]: newStatus}));
    setStatusMenuFor(null);
    // Persist to Supabase
    const [candidateName, ...roleParts] = candidateKey.split('-');
    const roleTitle = roleParts.join('-');
    await supabase.from('pipeline_candidates')
      .update({ status: newStatus })
      .eq('user_id', session.user.id)
      .eq('candidate_name', candidateName)
      .eq('role_title', roleTitle);
  };

  const getCandidateStatus = (name, role) => {
    return candidateStatuses[`${name}-${role}`] || 'interviewed';
  };

  const getStatusInfo = (statusId) => {
    return CANDIDATE_STATUSES.find(s => s.id === statusId) || CANDIDATE_STATUSES[2];
  };

  // PDF Export
  const exportPDF = (candidate, fullResult) => {
    const r = fullResult || candidate;
    const vc = VERDICT_COLORS[candidate.verdict] || VERDICT_COLORS["Borderline"];

    const skillBars = Object.entries(candidate.skillScores || {}).map(([k,v]) => `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:12px">${k}</span>
          <span style="font-size:12px;font-weight:700;color:${v>=75?'#34d399':v>=50?'#fbbf24':'#f87171'}">${v}/100</span>
        </div>
        <div style="height:4px;background:#1f2d3a;border-radius:2px">
          <div style="height:100%;width:${v}%;background:${v>=75?'#34d399':v>=50?'#fbbf24':'#f87171'};border-radius:2px"></div>
        </div>
      </div>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>HireIQ Scorecard - ${candidate.name}</title>
    <style>
      body{font-family:'Segoe UI',sans-serif;background:#fff;color:#111;padding:40px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #e5e7eb}
      .brand{font-size:22px;font-weight:900;color:#0a0d12}
      .brand span{color:#38bdf8}
      .score-circle{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;border:3px solid ${vc.text};background:${vc.bg}}
      .score-num{font-size:28px;font-weight:900;color:${vc.text}}
      .score-sub{font-size:10px;color:#6b7280}
      h2{font-size:20px;font-weight:700;margin:0 0 4px}
      .role-info{color:#6b7280;font-size:13px}
      .verdict{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:${vc.bg};color:${vc.text};border:1px solid ${vc.text};margin-bottom:16px}
      .section{margin-bottom:24px}
      .section-title{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6b7280;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb}
      .summary{font-size:13px;line-height:1.7;color:#374151}
      .list-item{display:flex;gap:8px;font-size:13px;margin-bottom:8px;line-height:1.5}
      .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
    </style></head><body>
    <div class="header">
      <div>
        <div class="brand">Hire<span>IQ</span> Pro</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:4px">AI Interview Scorecard</div>
      </div>
      <div class="score-circle"><div class="score-num">${candidate.score}</div><div class="score-sub">/100</div></div>
    </div>
    <h2>${candidate.name}</h2>
    <div class="role-info">${candidate.role}</div>
    <div style="margin-top:8px"><span class="verdict">${candidate.verdict}</span></div>
    <div class="section">
      <div class="section-title">Summary</div>
      <div class="summary">${candidate.summary}</div>
    </div>
    ${r.jdMatchScore != null ? `<div class="section"><div class="section-title">JD Match Score</div><div style="font-size:24px;font-weight:900;color:${r.jdMatchScore>=75?'#34d399':r.jdMatchScore>=50?'#fbbf24':'#f87171'}">${r.jdMatchScore}%</div></div>` : ''}
    <div class="section">
      <div class="section-title">Competency Breakdown</div>
      ${skillBars}
    </div>
    ${r.strengths ? `<div class="section"><div class="section-title">Strengths</div>${r.strengths.map(s=>`<div class="list-item"><div class="dot" style="background:#34d399"></div>${s}</div>`).join('')}</div>` : ''}
    ${r.concerns ? `<div class="section"><div class="section-title">Concerns</div>${r.concerns.map(c=>`<div class="list-item"><div class="dot" style="background:#f87171"></div>${c}</div>`).join('')}</div>` : ''}
    ${r.nextSteps ? `<div class="section"><div class="section-title">Next Steps</div>${r.nextSteps.map(s=>`<div class="list-item"><div class="dot" style="background:#38bdf8"></div>${s}</div>`).join('')}</div>` : ''}
    <div class="footer">Generated by HireIQ Pro · hireiq-inky.vercel.app · ${new Date().toLocaleDateString()}</div>
    <div style="text-align:center;margin-top:20px">
      <button onclick="window.print()" style="padding:10px 24px;background:#38bdf8;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;color:#000">
        🖨 Print / Save as PDF
      </button>
    </div>
    <style>@media print{button{display:none!important}body{padding:20px}}</style>
    </body></html>`;

    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HireIQ-${candidate.name.replace(/ /g,'-')}-Scorecard.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Scorecard exported for ${candidate.name}`);
  };

  // Template apply
  const TEMPLATE_JDS = {
    frontend: "We are looking for a Frontend Engineer to build high-quality web applications. The ideal candidate has strong JavaScript/TypeScript skills, experience with React or similar frameworks, an eye for UI/UX, and understands performance optimization and accessibility.",
    backend: "We are looking for a Backend Engineer to design and build scalable server-side systems. The ideal candidate has strong experience with system design, RESTful APIs, database architecture, and at least one backend language such as Python, Node.js, or Go.",
    fullstack: "We are looking for a Full Stack Engineer to work across our entire codebase. The ideal candidate is comfortable with both frontend and backend development, databases, and can take features from design to production independently.",
    ml: "We are looking for a Machine Learning Engineer to build and deploy ML models at scale. The ideal candidate has strong Python skills, experience with TensorFlow or PyTorch, MLOps practices, and the ability to work closely with data and product teams.",
    devops: "We are looking for a DevOps/SRE Engineer to own our infrastructure and reliability. The ideal candidate has experience with cloud platforms, CI/CD pipelines, infrastructure as code, and incident response.",
    product: "We are looking for a Product Manager to define and execute our product roadmap. The ideal candidate has strong product sense, data-driven decision making, excellent communication skills, and experience working with engineering and design teams.",
    designer: "We are looking for a UX/Product Designer to craft exceptional user experiences. The ideal candidate has a strong portfolio, experience with user research, proficiency in Figma, and the ability to collaborate closely with engineering.",
    ae: "We are looking for an Account Executive to drive new business revenue. The ideal candidate has a proven track record of closing B2B deals, strong communication and negotiation skills, and experience with CRM tools like Salesforce.",
    sdr: "We are looking for an SDR/BDR to generate and qualify pipeline for our sales team. The ideal candidate is resilient, highly organized, and has strong written and verbal communication skills.",
    da: "We are looking for a Data Analyst with strong SQL skills, experience in data visualization tools like Tableau or Power BI, and the ability to translate complex data into actionable business insights.",
    ds: "We are looking for a Data Scientist to build statistical models and drive data-informed decisions. The ideal candidate has strong Python or R skills, experience with machine learning, and excellent communication skills.",
    em: "We are looking for an Engineering Manager to lead and grow our engineering team. The ideal candidate has strong technical depth, experience managing engineers, excellent communication skills, and a track record of shipping high-quality products.",
  };

  const applyTemplate = (template) => {
    setRoleSkills([...template.skills]);
    const suggestedJD = TEMPLATE_JDS[template.id] || "";
    setRoleForm(f => ({
      ...f,
      title: f.title || template.title,
      job_description: f.job_description || suggestedJD
    }));
    setShowTemplates(false);
    showToast(`✓ "${template.title}" template applied with starter JD`);
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
    setShowInterviewSetup(false);
    setAnswers([]);
    setCurrentQ(0);
    setCurrentRating(0);
    setCurrentNote("");

    const count = questionCount(selectedRole.seniority);
    const skills = (selectedRole.skills && selectedRole.skills.length > 0)
      ? selectedRole.skills.join(", ")
      : skillsList.join(", ");

    // Get previous candidates for this role to calibrate difficulty
    const prevCands = candidates.filter(c => c.role === selectedRole.title);
    const avgPrevScore = prevCands.length > 0
      ? Math.round(prevCands.reduce((sum,c) => sum + c.score, 0) / prevCands.length)
      : null;

    // Detect industry from JD
    const jd = selectedRole.job_description || "";
    const industry = jd.toLowerCase().includes('health') ? 'healthcare'
      : jd.toLowerCase().includes('fintech') || jd.toLowerCase().includes('finance') ? 'fintech'
      : jd.toLowerCase().includes('ecommerce') || jd.toLowerCase().includes('retail') ? 'e-commerce'
      : jd.toLowerCase().includes('startup') ? 'startup'
      : jd.toLowerCase().includes('enterprise') ? 'enterprise'
      : 'technology';

    // Build seniority-based question mix
    const seniorityMix = {
      junior: "Technical 20%, Behavioral 35%, Situational 30%, Culture 15% — focus on learning ability and potential",
      mid:    "Technical 30%, Behavioral 30%, Situational 25%, Culture 15% — balance of skills and experience",
      senior: "Technical 40%, Behavioral 25%, Situational 25%, Culture 10% — deep technical and ownership questions",
      lead:   "Technical 30%, Behavioral 20%, Situational 20%, Leadership 20%, Culture 10% — heavy on leadership, architecture decisions, team management",
      exec:   "Technical 15%, Behavioral 15%, Situational 20%, Leadership 35%, Culture 15% — strategic thinking, org design, vision"
    }[selectedRole.seniority] || "Technical 30%, Behavioral 30%, Situational 25%, Culture 15%";

    const prompt = `You are a world-class interviewer with 20 years of experience hiring for ${industry} companies. Generate exactly ${count} highly targeted interview questions.

=== ROLE CONTEXT ===
Role: ${selectedRole.title}
Seniority: ${selectedRole.seniority}
Industry: ${industry}
Job Description: ${jd || "Not provided"}
Skills to evaluate: ${skills}

=== CANDIDATE CONTEXT ===
Candidate name: ${candidateName}
${interviewContext.yearsExp ? `Years of experience: ${interviewContext.yearsExp}` : ""}
${interviewContext.background ? `Background/notes: ${interviewContext.background}` : ""}
${interviewContext.redFlags ? `Red flags to probe: ${interviewContext.redFlags}` : ""}
${interviewContext.roundNumber !== "1" ? `Interview round: ${interviewContext.roundNumber} (ask deeper, more specific questions than round 1)` : "Interview round: 1 (initial screening)"}

=== CALIBRATION ===
${avgPrevScore ? `Previous candidates for this role averaged ${avgPrevScore}/100. Calibrate difficulty accordingly — ${avgPrevScore > 70 ? "this is a high bar, ask challenging questions" : "bar has been moderate, probe for genuine differentiators"}.` : "No previous candidates for this role."}

=== QUESTION MIX ===
${seniorityMix}

=== RULES ===
- Each question MUST target a specific skill from the list
- Questions must be directly relevant to ${industry} context where possible
- For senior/lead: include at least 2 questions about past failures or mistakes — these reveal character
- For behavioral questions: use STAR format prompts (Situation/Task/Action/Result)
- For technical questions: ask about real scenarios, not textbook definitions
- If red flags provided: include 1-2 probing questions specifically targeting those concerns
- Questions must be speakable aloud naturally in under 15 seconds
- Hints must be SPECIFIC and DETAILED — tell the recruiter exactly what a great vs mediocre answer looks like

Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "question": "<the exact question to read aloud>",
    "skill": "<which skill from the list this evaluates>",
    "type": "<Technical|Behavioral|Situational|Leadership|Culture>",
    "hint": ["<bullet 1: key element of a strong answer>", "<bullet 2: what a weak answer looks like>", "<bullet 3: follow-up probe question to ask if needed>"]
  }
]`;

    try {
      const res = await fetch("/api/analyze", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt, mode:"questions"})
      });
      const data = await res.json();

      // Backend now returns { raw: "..." }
      const raw = data.raw || (typeof data === "string" ? data : JSON.stringify(data));
      const arrStart = raw.indexOf("[");
      const arrEnd = raw.lastIndexOf("]");

      let parsed = null;
      if (arrStart !== -1 && arrEnd !== -1) {
        try { parsed = JSON.parse(raw.slice(arrStart, arrEnd + 1)); }
        catch(e) { console.error("Question parse error:", e, raw.slice(arrStart, arrStart+300)); }
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize hint — always make it an array of 3 bullets
        const normalized = parsed.map(q => {
          let hint = q.hint;
          if (!Array.isArray(hint)) {
            // Convert string hint to bullets
            hint = [
              hint || "Look for specific examples with clear ownership and measurable outcomes.",
              "Weak answer: vague, uses 'we' instead of 'I', no concrete results.",
              "Follow-up: 'What would you do differently next time?'"
            ];
          }
          return { ...q, hint };
        });
        setQuestions(normalized);
      } else {
        // Fallback — varied question types
        const skillArr = skills.split(",").map(s => s.trim());
        const types = ["Technical","Behavioral","Situational","Leadership","Culture"];
        const templates = [
          (skill) => `Walk me through a time you had to solve a complex ${skill} problem under a tight deadline. What approach did you take?`,
          (skill) => `Tell me about a specific situation where your ${skill} skills directly impacted the outcome of a project.`,
          (skill) => `How would you handle a scenario where your approach to ${skill} was challenged by a senior colleague?`,
          (skill) => `What is the most difficult ${skill}-related challenge you have faced and how did you overcome it?`,
          (skill) => `Describe a time you went above and beyond to demonstrate ${skill} in your role.`,
        ];
        const fallback = Array.from({length:count}, (_,i) => ({
          question: templates[i % templates.length](skillArr[i % skillArr.length]),
          skill: skillArr[i % skillArr.length],
          type: types[i % types.length],
          hint: [
            "Strong answer: specific situation, clear personal ownership, measurable outcome, reflection on learning.",
            "Weak answer: vague story, uses 'we', no metrics, no personal accountability.",
            "Follow-up: 'What would you do differently if faced with this again?'"
          ]
        }));
        setQuestions(fallback);
      }
    } catch(e) {
      console.error("Interview generation error:", e);
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
    // Auto-save progress
    localStorage.setItem('hireiq_interview_progress', JSON.stringify({
      candidateName: interviewCandidate,
      roleTitle: selectedRole?.title,
      questions,
      answers: newAnswers,
      currentQ: currentQ + 1,
      savedAt: Date.now()
    }));

    if (currentQ + 1 >= questions.length) {
      localStorage.removeItem('hireiq_interview_progress');
      await generateScorecardFromInterview(newAnswers);
    } else {
      setCurrentQ(q => q + 1);
    }
  };

  // Restore interview progress if available
  const restoreInterviewProgress = () => {
    const saved = localStorage.getItem('hireiq_interview_progress');
    if (!saved) return false;
    try {
      const data = JSON.parse(saved);
      const age = Date.now() - data.savedAt;
      if (age > 24 * 60 * 60 * 1000) { localStorage.removeItem('hireiq_interview_progress'); return false; }
      return data;
    } catch { return false; }
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
      const raw = data.raw || JSON.stringify(data);
      const clean2 = raw.replace(/```json|```/g,"").trim();
      const parsed2 = JSON.parse(clean2);
      setResult(parsed2);
      setForm(f=>({...f,candidate:interviewCandidate}));
      await incrementUsage();
      if (notifyOnAnalysis) await sendNotification(interviewCandidate, parsed2);
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
      // Backend returns { raw: "..." } — parse it
      const raw = data.raw || JSON.stringify(data);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
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

  const saveCandidate = async () => {
    if (!result || result.error) return;
    const candidateName = form.candidate || `Candidate ${candidates.length+1}`;
    const idx = candidates.findIndex(c=>c.name===candidateName && c.role===form.role);
    const entry = {
      name: candidateName,
      role: form.role,
      score: result.overallScore,
      verdict: result.verdict,
      jdMatch: result.jdMatchScore,
      skillScores: result.skillScores,
      summary: result.summary,
      savedAt: new Date().toLocaleTimeString(),
      avatarIdx: (candidates.length) % AVATARS.length,
      fullResult: result,
    };
    if (idx>=0) { const nc=[...candidates]; nc[idx]=entry; setCandidates(nc); }
    else setCandidates(c=>[...c, entry]);
    setPipelineResults(prev => ({...prev, [`${candidateName}-${form.role}`]: result}));
    // Persist to Supabase with full result data
    await supabase.from('pipeline_candidates').upsert({
      user_id: session.user.id,
      role_id: roles.find(r=>r.title===form.role)?.id || null,
      role_title: form.role,
      candidate_name: candidateName,
      score: result.overallScore,
      verdict: result.verdict,
      jd_match: result.jdMatchScore,
      skill_scores: result.skillScores,
      summary: result.summary,
      strengths: result.strengths,
      concerns: result.concerns,
      next_steps: result.nextSteps,
      avatar_idx: (candidates.length) % AVATARS.length,
      status: 'interviewed',
    }, { onConflict: 'user_id,candidate_name,role_title' });
    showToast(`✓ ${entry.name} saved to pipeline`);
  };

  const copyEmail = () => {
    const emails = {advance:result?.advanceEmail, reject:result?.rejectEmail, hold:result?.holdEmail};
    const branded = applyBrandingToEmail(emails[emailTab]||"");
    navigator.clipboard.writeText(branded);
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
              {id:"roles",    label:"Open Roles",       icon:"📋"},
              {id:"analyze",  label:"Analyze Interview", icon:"⚡"},
              {id:"pipeline", label:"Pipeline",          icon:"📊"},
              {id:"team",     label:"Team",              icon:"👥"},
              {id:"settings", label:"Settings",          icon:"⚙️"},
              ...(profile?.is_admin ? [{id:"admin", label:"Admin", icon:"🛡"}] : []),
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
                <div className="profile-wrap">
                  <div className="profile-btn" onClick={()=>setShowProfileMenu(m=>!m)}>
                    <div className="profile-avatar">
                      {(profile.full_name||session?.user?.email||"U")[0].toUpperCase()}
                    </div>
                    <div className="profile-email">
                      {profile.full_name || session?.user?.email?.split("@")[0]}
                    </div>
                    <span className="profile-chevron">{showProfileMenu?"▲":"▼"}</span>
                  </div>
                  {showProfileMenu && (
                    <div className="profile-dropdown" onClick={e=>e.stopPropagation()}>
                      <div className="profile-info">
                        <div className="profile-name">{profile.full_name || "Recruiter"}</div>
                        <div className="profile-mail">{session?.user?.email}</div>
                        {profile.plan === 'pro' || profile.plan === 'team'
                          ? <span className="pro-badge">⚡ {profile.plan}</span>
                          : <span className="free-badge">free plan</span>
                        }
                      </div>
                      <div className="profile-usage-bar">
                        <div className="pub-label">Monthly Usage</div>
                        <div className="pub-track">
                          <div className="pub-fill" style={{
                            width:`${Math.min(100,((profile.analyses_used||0)/(profile.analyses_limit||10))*100)}%`,
                            background: isLimitReached() ? "var(--rose)" : "var(--hi)"
                          }}/>
                        </div>
                        <div className="pub-nums">{profile.analyses_used||0} / {profile.analyses_limit||10} analyses used</div>
                      </div>
                      <div className="profile-menu-item" onClick={()=>{setShowProfileMenu(false);setTab("pipeline");}}>
                        📊 My Pipeline
                      </div>
                      <div className="profile-menu-item" onClick={()=>{setShowProfileMenu(false);setTab("roles");}}>
                        📋 Open Roles
                      </div>
                      {isLimitReached() && (
                        <div className="profile-menu-item" style={{color:"var(--green)",background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.15)",borderRadius:7,marginTop:4}}
                          onClick={()=>window.open("mailto:hireiqpro@gmail.com?subject=Upgrade to Pro")}>
                          ⚡ Upgrade to Pro
                        </div>
                      )}
                      <div className="profile-menu-item danger" onClick={signOut}>
                        → Sign Out
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ── INTERVIEW SETUP MODAL ── */}
        {showInterviewSetup && (
          <div className="setup-overlay" onClick={()=>setShowInterviewSetup(false)}>
            <div className="setup-card" onClick={e=>e.stopPropagation()}>
              <div>
                <div className="setup-title">🎤 Interview Setup</div>
                <div className="setup-sub">
                  Add context to make questions sharper and more targeted for {form.candidate}.
                  All fields are optional — the more you provide, the better the questions.
                </div>
              </div>
              {(() => {
                const saved = restoreInterviewProgress();
                if (saved && saved.candidateName === form.candidate && saved.roleTitle === selectedRole?.title) {
                  return (
                    <div style={{background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",borderRadius:8,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                      <div>
                        <div style={{font:"600 12px var(--font)",color:"var(--amber)"}}>⚡ Resume previous interview</div>
                        <div style={{font:"400 11px var(--font)",color:"var(--sub)",marginTop:2}}>
                          {saved.answers?.length || 0} of {saved.questions?.length || 0} questions answered
                        </div>
                      </div>
                      <button className="role-action-btn primary" style={{fontSize:11}} onClick={()=>{
                        setQuestions(saved.questions);
                        setAnswers(saved.answers);
                        setCurrentQ(saved.currentQ);
                        setInterviewCandidate(form.candidate);
                        setGeneratingQuestions(false);
                        setInterviewMode(true);
                        setShowInterviewSetup(false);
                      }}>Resume →</button>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="setup-row">
                <div className="field">
                  <label className="label">Years of Experience <span className="setup-optional">optional</span></label>
                  <input className="inp" placeholder="e.g. 5" value={interviewContext.yearsExp}
                    onChange={e=>setInterviewContext(c=>({...c,yearsExp:e.target.value}))}/>
                </div>
                <div className="field">
                  <label className="label">Interview Round <span className="setup-optional">optional</span></label>
                  <select className="sel inp" value={interviewContext.roundNumber}
                    onChange={e=>{
                      setInterviewContext(c=>({...c,roundNumber:e.target.value}));
                      localStorage.setItem('hireiq_last_round', e.target.value);
                    }}>
                    <option value="1">Round 1 — Initial Screen</option>
                    <option value="2">Round 2 — Deep Dive</option>
                    <option value="3">Round 3 — Final</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Candidate Background <span className="setup-optional">optional</span></label>
                <input className="inp" placeholder="e.g. Ex-Google, strong Python background, worked in fintech"
                  value={interviewContext.background}
                  onChange={e=>setInterviewContext(c=>({...c,background:e.target.value}))}/>
              </div>

              <div className="field">
                <label className="label">Red Flags to Probe <span className="setup-optional">optional</span></label>
                <input className="inp" placeholder="e.g. Short tenure at last 3 jobs, resume gap 2022-2023"
                  value={interviewContext.redFlags}
                  onChange={e=>setInterviewContext(c=>({...c,redFlags:e.target.value}))}/>
              </div>

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
                <button className="modal-cancel" onClick={()=>setShowInterviewSetup(false)}>Cancel</button>
                <button className="analyze-btn" style={{margin:0,padding:"11px 24px",background:"linear-gradient(135deg,var(--green),#059669)"}}
                  onClick={()=>startInterview(form.candidate)}>
                  Generate Questions →
                </button>
              </div>
            </div>
          </div>
        )}

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
                      <div className="question-hint" style={{fontSize:13,lineHeight:1.8}}>
                        <span style={{color:"var(--green)",fontWeight:700,fontSize:10,fontFamily:"var(--mono)",letterSpacing:1,display:"block",marginBottom:8,borderBottom:"1px solid var(--line)",paddingBottom:6}}>
                          ✓ WHAT A STRONG ANSWER INCLUDES
                        </span>
                        {Array.isArray(questions[currentQ].hint) ? (
                          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:8,margin:0,padding:0}}>
                            {questions[currentQ].hint.map((h,i)=>(
                              <li key={i} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:13,lineHeight:1.65}}>
                                <span style={{color:i===0?"var(--green)":i===1?"var(--rose)":"var(--amber)",fontSize:16,lineHeight:1,flexShrink:0}}>
                                  {i===0?"✓":i===1?"✗":"→"}
                                </span>
                                <span style={{color:i===0?"var(--text)":i===1?"rgba(248,113,113,.8)":"var(--sub)"}}>{h}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{color:"var(--text)",fontSize:13,lineHeight:1.7}}>{questions[currentQ].hint}</span>
                        )}
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
                      <textarea className="note-area" rows={2}
                        placeholder="Key points from their answer..."
                        value={currentNote} onChange={e=>setCurrentNote(e.target.value)}/>
                    </div>

                    <div className="interview-nav">
                      {currentQ > 0 && (
                        <button className="skip-btn" onClick={()=>{
                          setCurrentQ(q=>q-1);
                          const prev = answers[answers.length-1];
                          setCurrentRating(prev?.rating||0);
                          setCurrentNote(prev?.note||"");
                          setAnswers(a=>a.slice(0,-1));
                        }}>← Back</button>
                      )}
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
                      setTab("roles");
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
                        setShowInterviewSetup(true);
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
                  <div style={{display:"flex",gap:8}}>
                    <button className="export-btn" onClick={()=>exportPDF(
                      {name:form.candidate||"Candidate",role:form.role,score:result.overallScore,verdict:result.verdict,summary:result.summary,skillScores:result.skillScores,jdMatch:result.jdMatchScore},
                      result
                    )}>↓ PDF</button>
                    <button className="save-btn" onClick={saveCandidate}>+ Save to Pipeline</button>
                  </div>
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
                    <div className="empty-p">Something went wrong — this happens occasionally. Click retry to try again.</div>
                    <button className="new-role-btn" style={{marginTop:8,fontSize:12,padding:"8px 18px"}}
                      onClick={()=>{setResult(null);analyze();}}>
                      ↺ Retry Analysis
                    </button>
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
                            {applyBrandingToEmail(emailTab==="advance"?result.advanceEmail:emailTab==="reject"?result.rejectEmail:result.holdEmail)}
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
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input className="pipeline-search" placeholder="Search candidates..."
                  value={pipelineSearch} onChange={e=>setPipelineSearch(e.target.value)}/>
                <span style={{font:"400 12px var(--font)",color:"var(--sub)"}}>
                  {roles.filter(r=>r.status==="active").length} active roles
                </span>
                <select className="sel inp" style={{padding:"4px 10px",fontSize:11,width:"auto",fontFamily:"var(--mono)"}}
                  value={pipelineSort||"score"}
                  onChange={e=>setPipelineSort(e.target.value)}>
                  <option value="score">Sort: Score ↓</option>
                  <option value="score_asc">Sort: Score ↑</option>
                  <option value="name">Sort: Name A-Z</option>
                  <option value="status">Sort: Status</option>
                  <option value="verdict">Sort: Verdict</option>
                </select>
              </div>
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
                  const sortCandidates = (cands) => {
                    // Apply search filter
                    if (pipelineSearch.trim()) {
                      cands = cands.filter(c => c.name.toLowerCase().includes(pipelineSearch.toLowerCase()));
                    }
                    const s = pipelineSort || 'score';
                    return [...cands].sort((a,b) => {
                      if (s==='score') return b.score-a.score;
                      if (s==='score_asc') return a.score-b.score;
                      if (s==='name') return a.name.localeCompare(b.name);
                      if (s==='status') return (getCandidateStatus(a.name,a.role)).localeCompare(getCandidateStatus(b.name,b.role));
                      if (s==='verdict') return (a.verdict||'').localeCompare(b.verdict||'');
                      return 0;
                    });
                  };
                  const roleCands = sortCandidates(candidates.filter(c=>c.role===role.title));
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
                          {roleCands.length >= 2 && (
                            <button className="role-action-btn primary" style={{fontSize:10}}
                              onClick={e=>{e.stopPropagation();setShowComparison({role, candidates: roleCands});}}>
                              ⚖ Compare
                            </button>
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
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...roleCands].sort((a,b)=>b.score-a.score).map((c,i)=>{
                                  const vc = VERDICT_COLORS[c.verdict]||VERDICT_COLORS["Borderline"];
                                  return (
                                    <tr key={i}>
                                      <td onClick={()=>setSelectedPipelineCandidate({...c, fullResult: pipelineResults[`${c.name}-${c.role}`]})} style={{cursor:"pointer"}}>
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
                                      <td>
                                        <div style={{position:"relative"}}>
                                          <span className={`status-badge status-${getCandidateStatus(c.name,c.role)}`}
                                            onClick={e=>{
                                              e.stopPropagation();
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              setStatusMenuPos({top: rect.bottom+4, left: rect.left});
                                              setStatusMenuFor(statusMenuFor===`${c.name}-${c.role}`?null:`${c.name}-${c.role}`);
                                            }}>
                                            {getStatusInfo(getCandidateStatus(c.name,c.role)).label} ▾
                                          </span>
                                        </div>
                                      </td>
                                      <td>
                                        <div style={{display:"flex",gap:6}}>
                                          <button className="export-btn" style={{fontSize:10,padding:"4px 8px"}}
                                            onClick={e=>{e.stopPropagation();exportPDF(c, pipelineResults[`${c.name}-${c.role}`]);}}>
                                            ↓ PDF
                                          </button>
                                          <button className="role-action-btn primary" style={{fontSize:10,padding:"4px 8px"}}
                                            onClick={e=>{e.stopPropagation();setSelectedPipelineCandidate({...c, fullResult: pipelineResults[`${c.name}-${c.role}`]});}}>
                                            View
                                          </button>
                                        </div>
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
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div className="modal-title">{editingRole ? "Edit Role" : "New Role"}</div>
                <button className="role-action-btn primary" onClick={()=>setShowTemplates(true)} style={{fontSize:11}}>
                  📚 Use Template
                </button>
              </div>

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

        {/* ── CANDIDATE DETAIL MODAL ── */}
        {selectedPipelineCandidate && (
          <div className="modal-overlay" onClick={()=>setSelectedPipelineCandidate(null)}>
            <div className="modal" style={{maxWidth:640,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div style={{font:"700 18px var(--font)"}}>{selectedPipelineCandidate.name}</div>
                  <div style={{font:"400 12px var(--mono)",color:"var(--sub)",marginTop:2}}>{selectedPipelineCandidate.role}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="export-btn"
                    onClick={()=>exportPDF(selectedPipelineCandidate, selectedPipelineCandidate.fullResult)}>
                    ↓ PDF
                  </button>
                  <button className="modal-cancel" onClick={()=>{setSelectedPipelineCandidate(null);setActiveDetailTab("scorecard");}} style={{padding:"6px 14px"}}>✕ Close</button>
                </div>
              </div>
              {/* Detail Tabs */}
              <div style={{display:"flex",gap:4,borderBottom:"1px solid var(--line)",paddingBottom:0,marginBottom:16}}>
                {["scorecard","notes"].map(t=>(
                  <button key={t} onClick={()=>{
                    setActiveDetailTab(t);
                    if(t==="notes") loadNotes(selectedPipelineCandidate.name, selectedPipelineCandidate.role);
                  }} style={{
                    padding:"8px 16px",background:"none",border:"none",
                    font:`600 12px var(--mono)`,letterSpacing:".5px",textTransform:"uppercase",
                    color:activeDetailTab===t?"var(--hi)":"var(--sub)",
                    borderBottom:activeDetailTab===t?"2px solid var(--hi)":"2px solid transparent",
                    cursor:"pointer",transition:".15s",
                  }}>
                    {t==="scorecard"?"📊 Scorecard":"📝 Notes & Timeline"}
                  </button>
                ))}
              </div>

              {activeDetailTab === "notes" ? (
                <div>
                  <div className="notes-timeline">
                    {candidateNotes.length === 0 ? (
                      <div style={{padding:"20px 0",color:"var(--sub)",fontSize:13,textAlign:"center"}}>
                        No notes yet. Add your first note below.
                      </div>
                    ) : candidateNotes.map((note, i) => {
                      const nt = getNoteType(note.note_type);
                      return (
                        <div key={note.id} className="note-entry">
                          <div className="note-dot-wrap">
                            <div className="note-dot" style={{background:nt.color}}/>
                            {i < candidateNotes.length-1 && <div className="note-line"/>}
                          </div>
                          <div className="note-content">
                            <div className="note-meta">
                              <span className="note-type-chip" style={{background:nt.bg,color:nt.color}}>{nt.label}</span>
                              <span className="note-time">{new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                              <button onClick={()=>deleteNote(note.id)} style={{background:"none",border:"none",color:"var(--dim)",cursor:"pointer",fontSize:12,marginLeft:"auto"}}>✕</button>
                            </div>
                            <div className="note-text">{note.note}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="add-note-row">
                    <select className="note-type-sel" value={newNoteType} onChange={e=>setNewNoteType(e.target.value)}>
                      {NOTE_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input className="inp" style={{flex:1,padding:"8px 12px"}}
                      placeholder="Add a note about this candidate..."
                      value={newNote}
                      onChange={e=>setNewNote(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addNote(selectedPipelineCandidate.name,selectedPipelineCandidate.role)}
                    />
                    <button className="add-note-btn"
                      onClick={()=>addNote(selectedPipelineCandidate.name,selectedPipelineCandidate.role)}>
                      + Add
                    </button>
                  </div>
                </div>
              ) : (() => {
                const r = selectedPipelineCandidate.fullResult || selectedPipelineCandidate;
                const vc = VERDICT_COLORS[selectedPipelineCandidate.verdict] || VERDICT_COLORS["Borderline"];
                return (
                  <>
                    {/* Score */}
                    <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
                      <div className={`score-ring ${scoreClass(selectedPipelineCandidate.score)}`} style={{width:64,height:64,fontSize:22}}>
                        {selectedPipelineCandidate.score}
                        <span className="score-sub">/100</span>
                      </div>
                      <div style={{flex:1}}>
                        <span className="verdict-chip" style={{background:vc.bg,border:`1px solid ${vc.border}`,color:vc.text,marginBottom:6,display:"inline-block"}}>
                          {selectedPipelineCandidate.verdict}
                        </span>
                        <div style={{fontSize:12.5,color:"var(--sub)",lineHeight:1.6}}>{selectedPipelineCandidate.summary}</div>
                      </div>
                    </div>

                    {/* Skill scores */}
                    {selectedPipelineCandidate.skillScores && (
                      <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:10,padding:"14px 18px",marginBottom:14}}>
                        <div className="rlabel" style={{marginBottom:10}}>Competency Scores</div>
                        <div className="bar-list">
                          {Object.entries(selectedPipelineCandidate.skillScores).map(([k,v])=>(
                            <div key={k} className="bar-item">
                              <div className="bar-head"><span className="bar-name">{k}</span><span className="bar-val">{v}</span></div>
                              <div className="bar-track"><div className="bar-fill" style={{width:`${v}%`,background:barColor(v)}}/></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full result if available */}
                    {r?.strengths && (
                      <>
                        <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:10,padding:"14px 18px",marginBottom:10}}>
                          <div className="rlabel" style={{marginBottom:8}}>Strengths</div>
                          <ul className="blist">{r.strengths.map((s,i)=><li key={i}><span className="bl g"/>{s}</li>)}</ul>
                        </div>
                        <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:10,padding:"14px 18px",marginBottom:10}}>
                          <div className="rlabel" style={{marginBottom:8}}>Concerns</div>
                          <ul className="blist">{r.concerns?.map((c,i)=><li key={i}><span className="bl r"/>{c}</li>)}</ul>
                        </div>
                        {r.nextSteps && (
                          <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:10,padding:"14px 18px",marginBottom:10}}>
                            <div className="rlabel" style={{marginBottom:8}}>Next Steps</div>
                            <ul className="blist">{r.nextSteps.map((s,i)=><li key={i}><span className="bl" style={{background:"var(--hi)"}}/>{s}</li>)}</ul>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
              ) : null}
            </div>
          </div>
        )}

        {/* Close profile menu on outside click */}
        {showProfileMenu && (
          <div style={{position:"fixed",inset:0,zIndex:100}} onClick={()=>setShowProfileMenu(false)}/>
        )}

        {/* Close status menu on outside click */}
        {statusMenuFor && (
          <div style={{position:"fixed",inset:0,zIndex:8999}} onClick={()=>setStatusMenuFor(null)}/>
        )}
        {/* Status menu rendered at root level with fixed position */}
        {statusMenuFor && (
          <div className="status-menu" style={{top:statusMenuPos.top, left:statusMenuPos.left}}>
            {CANDIDATE_STATUSES.map(s=>(
              <div key={s.id} className="status-menu-item"
                onClick={e=>{e.stopPropagation();updateCandidateStatus(statusMenuFor,s.id);}}>
                <span className={`status-badge status-${s.id}`} style={{cursor:"default",pointerEvents:"none"}}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── COMPARISON OVERLAY ── */}
        {showComparison && (
          <div className="comparison-overlay">
            <div className="comparison-head">
              <div>
                <div className="comparison-title">⚖ Candidate Comparison — {showComparison.role.title}</div>
                <div style={{font:"400 12px var(--font)",color:"var(--sub)",marginTop:3}}>
                  {showComparison.candidates.length} candidates · sorted by score
                </div>
              </div>
              <button className="modal-cancel" onClick={()=>setShowComparison(null)}>✕ Close</button>
            </div>
            <div className="comparison-grid" style={{gridTemplateColumns:`repeat(${Math.min(showComparison.candidates.length,3)},1fr)`}}>
              {[...showComparison.candidates].sort((a,b)=>b.score-a.score).map((c,i)=>{
                const isWinner = i===0;
                const vc = VERDICT_COLORS[c.verdict]||VERDICT_COLORS["Borderline"];
                const allSkills = [...new Set(showComparison.candidates.flatMap(x=>Object.keys(x.skillScores||{})))];
                return (
                  <div key={i} className={`comp-card ${isWinner?"winner":""}`}>
                    <div className="comp-card-head">
                      <div>
                        <div className="comp-card-name">
                          {isWinner && <span style={{marginRight:6}}>👑</span>}
                          {c.name}
                        </div>
                        {isWinner && <span className="comp-winner-badge">TOP CANDIDATE</span>}
                        <div style={{marginTop:6}}>
                          <span className="verdict-chip" style={{background:vc.bg,color:vc.text,border:`1px solid ${vc.border}`}}>{c.verdict}</span>
                        </div>
                      </div>
                      <div className={`comp-score ${scoreClass(c.score)}`} style={{color: scoreClass(c.score)==='hi'?"var(--green)":scoreClass(c.score)==='mid'?"var(--amber)":"var(--rose)", borderColor: scoreClass(c.score)==='hi'?"var(--green)":scoreClass(c.score)==='mid'?"var(--amber)":"var(--rose)"}}>
                        {c.score}
                        <span className="comp-score-sub">/100</span>
                      </div>
                    </div>
                    <div className="comp-card-body">
                      {c.jdMatch != null && (
                        <div style={{display:"flex",justifyContent:"space-between",font:"500 12px var(--mono)"}}>
                          <span style={{color:"var(--sub)"}}>JD Fit</span>
                          <span style={{color:barColor(c.jdMatch)}}>{c.jdMatch}%</span>
                        </div>
                      )}
                      <div className="bar-list">
                        {allSkills.map(skill=>{
                          const val = c.skillScores?.[skill] || 0;
                          const isTopForSkill = showComparison.candidates.every(x=>(x.skillScores?.[skill]||0) <= val);
                          return (
                            <div key={skill} className="bar-item">
                              <div className="bar-head">
                                <span className="bar-name" style={{color:isTopForSkill?"var(--green)":"var(--text)"}}>
                                  {isTopForSkill && "★ "}{skill}
                                </span>
                                <span className="bar-val" style={{color:barColor(val)}}>{val}</span>
                              </div>
                              <div className="bar-track">
                                <div className="bar-fill" style={{width:`${val}%`,background:barColor(val)}}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{font:"400 12px var(--font)",color:"var(--sub)",lineHeight:1.6,borderTop:"1px solid var(--line)",paddingTop:10}}>
                        {c.summary?.slice(0,120)}{c.summary?.length>120?"…":""}
                      </div>
                      <button className="export-btn" style={{alignSelf:"flex-start"}}
                        onClick={()=>exportPDF(c, pipelineResults[`${c.name}-${c.role}`])}>
                        ↓ Export PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TEMPLATES LIBRARY ── */}
        {showTemplates && (
          <div className="templates-overlay" style={{zIndex:1100}} onClick={()=>setShowTemplates(false)}>
            <div className="templates-modal" onClick={e=>e.stopPropagation()}>
              <div className="templates-head">
                <div className="templates-title">📚 Interview Templates</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <input className="templates-search" placeholder="Search roles..."
                    value={templateSearch} onChange={e=>setTemplateSearch(e.target.value)}/>
                  <button className="modal-cancel" style={{padding:"7px 14px"}} onClick={()=>setShowTemplates(false)}>✕</button>
                </div>
              </div>
              <div className="templates-scroll">
                {[...new Set(INTERVIEW_TEMPLATES.map(t=>t.category))].map(cat=>{
                  const filtered = INTERVIEW_TEMPLATES.filter(t=>
                    t.category===cat &&
                    (templateSearch==='' || t.title.toLowerCase().includes(templateSearch.toLowerCase()))
                  );
                  if(filtered.length===0) return null;
                  return (
                    <div key={cat} className="templates-category">
                      <div className="templates-cat-label">{cat}</div>
                      <div className="templates-grid">
                        {filtered.map(t=>(
                          <div key={t.id} className="template-card" onClick={()=>applyTemplate(t)}>
                            <div className="template-card-title">{t.title}</div>
                            <div className="template-card-skills">{t.skills.slice(0,3).join(", ")}{t.skills.length>3?`+${t.skills.length-3} more`:""}</div>
                            <div className="template-card-count">{t.questions} questions · {t.skills.length} skills</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TEAM VIEW ── */}
        <div style={{display:tab==="team"?"flex":"none",flexDirection:"column",overflow:"hidden",flex:1}}>
          <div className="team-view">
            <div className="team-head">
              <span style={{font:"700 13px var(--mono)",letterSpacing:2,textTransform:"uppercase",color:"var(--sub)"}}>👥 Team</span>
            </div>

            {!team ? (
              <div className="team-section">
                <div style={{padding:"32px 24px",textAlign:"center"}}>
                  <div style={{fontSize:44,marginBottom:12,opacity:.4}}>👥</div>
                  <div style={{font:"700 16px var(--font)",marginBottom:6}}>No Team Yet</div>
                  <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginBottom:20,maxWidth:340,margin:"0 auto 20px"}}>
                    Create a team to collaborate with other recruiters. Share roles, candidates, and pipeline across your whole team.
                  </div>
                  <div style={{display:"flex",gap:8,justifyContent:"center",maxWidth:400,margin:"0 auto"}}>
                    <input className="inp" placeholder="Team name e.g. Acme Recruiting"
                      value={teamName} onChange={e=>setTeamName(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&createTeam()}
                      style={{flex:1}}/>
                    <button className="new-role-btn" onClick={createTeam}>Create Team</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="team-section">
                  <div className="team-section-head">
                    <div>
                      <div className="team-section-title">{team.name}</div>
                      <div style={{font:"400 11px var(--mono)",color:"var(--sub)",marginTop:2}}>
                        {teamMembers.length} member{teamMembers.length!==1?"s":""}
                      </div>
                    </div>
                    <span className="role-card-seniority">TEAM</span>
                  </div>
                  {teamMembers.map(m=>(
                    <div key={m.user_id} className="member-row">
                      <div className="member-avatar">
                        {(m.profiles?.full_name||m.profiles?.email||"?")[0].toUpperCase()}
                      </div>
                      <div className="member-info">
                        <div className="member-name">{m.profiles?.full_name||"Team Member"}</div>
                        <div className="member-email">{m.profiles?.email}</div>
                      </div>
                      <span className="member-role-badge">{m.role}</span>
                      {team.owner_id === session.user.id && m.user_id !== session.user.id && (
                        <button className="role-action-btn danger" style={{fontSize:10}}
                          onClick={()=>setConfirmDialog({
                            title:"Remove member?",
                            message:`Remove ${m.profiles?.full_name||m.profiles?.email} from the team?`,
                            confirmLabel:"Remove",
                            danger:true,
                            onConfirm:()=>{removeMember(m.user_id);setConfirmDialog(null);}
                          })}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {team.owner_id === session.user.id && (
                    <div className="invite-row">
                      <input className="inp" placeholder="Invite by email..."
                        value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&inviteMember()}
                        style={{flex:1,padding:"8px 12px"}}/>
                      <button className="add-note-btn" onClick={inviteMember}>Send Invite</button>
                    </div>
                  )}
                </div>

                <div className="team-section">
                  <div className="team-section-head">
                    <div className="team-section-title">Team Activity</div>
                  </div>
                  <div style={{padding:"16px 20px"}}>
                    <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.7}}>
                      <div style={{marginBottom:8}}>👥 <strong style={{color:"var(--text)"}}>{teamMembers.length} members</strong> on your team</div>
                      <div style={{marginBottom:8}}>📋 <strong style={{color:"var(--text)"}}>{roles.filter(r=>r.status==="active").length} active roles</strong> being hired for</div>
                      <div>📊 <strong style={{color:"var(--text)"}}>{candidates.length} candidates</strong> in the pipeline</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SETTINGS VIEW ── */}
        <div style={{display:tab==="settings"?"flex":"none",flexDirection:"column",overflow:"hidden",flex:1}}>
          <div className="settings-view">
            <div style={{font:"700 13px var(--mono)",letterSpacing:2,textTransform:"uppercase",color:"var(--sub)"}}>Settings</div>

            {/* Email Branding */}
            <div className="settings-section">
              <div className="settings-section-title">✉️ Email Branding</div>
              <div className="settings-section-sub">
                Personalize the advance, reject, and hold emails generated for your candidates.
                Your company name and signature will be automatically applied to all emails.
              </div>
              <div className="settings-row">
                <div className="field">
                  <label className="label">Company Name</label>
                  <input className="inp" placeholder="e.g. Acme Corp"
                    value={emailBranding.company_name}
                    onChange={e=>setEmailBranding(b=>({...b,company_name:e.target.value}))}/>
                </div>
                <div className="field">
                  <label className="label">Your Name</label>
                  <input className="inp" placeholder="e.g. Sarah Johnson"
                    value={emailBranding.recruiter_name}
                    onChange={e=>setEmailBranding(b=>({...b,recruiter_name:e.target.value}))}/>
                </div>
              </div>
              <div className="field" style={{marginTop:10}}>
                <label className="label">Email Signature <span style={{fontWeight:400,color:"var(--dim)"}}>optional</span></label>
                <input className="inp" placeholder="e.g. Head of Talent · acmecorp.com"
                  value={emailBranding.email_signature}
                  onChange={e=>setEmailBranding(b=>({...b,email_signature:e.target.value}))}/>
              </div>
              {emailBranding.recruiter_name && (
                <div className="preview-email">
                  <span style={{font:"600 10px var(--mono)",color:"var(--hi)",letterSpacing:1,display:"block",marginBottom:8}}>PREVIEW</span>
                  {`Dear [Candidate Name],

Thank you for interviewing with us for the [Role] position. We were impressed with your background and would like to invite you to the next round...

Best regards,
${emailBranding.recruiter_name}${emailBranding.company_name?`
${emailBranding.company_name}`:""}${emailBranding.email_signature?`
${emailBranding.email_signature}`:""}`}
                </div>
              )}
              <button className="save-settings-btn" onClick={saveBranding}>
                {brandingSaved ? "✓ Saved!" : "Save Branding"}
              </button>
            </div>

            {/* Referral */}
            <div className="referral-card">
              <div style={{font:"700 15px var(--font)",marginBottom:4}}>🎁 Refer & Earn</div>
              <div style={{font:"400 12px var(--font)",color:"var(--sub)",lineHeight:1.6}}>
                Invite recruiters to HireIQ. For every person who signs up with your link, you both get <strong style={{color:"var(--hi)"}}>+50 bonus analyses</strong>.
              </div>
              <div className="referral-link-box">
                <span>{window.location.origin}?ref={referralCode||"..."}</span>
                <button className="role-action-btn primary" style={{fontSize:10,flexShrink:0}}
                  onClick={copyReferralLink}>
                  {copiedReferral ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
              <div className="referral-stats">
                <div className="referral-stat">
                  <div className="referral-stat-val">{referralCount}</div>
                  <div className="referral-stat-label">Referrals</div>
                </div>
                <div className="referral-stat">
                  <div className="referral-stat-val" style={{color:"var(--green)"}}>{referralBonus}</div>
                  <div className="referral-stat-label">Bonus Analyses</div>
                </div>
                <div className="referral-stat">
                  <div className="referral-stat-val" style={{color:"var(--amber)"}}>$49</div>
                  <div className="referral-stat-label">Per Referral Value</div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="settings-section">
              <div className="settings-section-title">🔔 Notifications</div>
              <div className="settings-section-sub">
                Get notified when a scorecard is generated. Enter an email or a Slack webhook URL.
              </div>
              <div className="notif-toggle-row">
                <div className="notif-toggle-info">
                  <div className="notif-toggle-title">Email Notifications</div>
                  <div className="notif-toggle-sub">Send scorecard summary to an email address</div>
                </div>
              </div>
              <div className="field" style={{marginBottom:12}}>
                <label className="label">Notify Email</label>
                <input className="inp" placeholder="hiring-manager@company.com"
                  value={notifyEmail} onChange={e=>setNotifyEmail(e.target.value)}/>
              </div>
              <div className="notif-toggle-row">
                <div className="notif-toggle-info">
                  <div className="notif-toggle-title">Slack Notifications</div>
                  <div className="notif-toggle-sub">Post scorecard to a Slack channel via webhook</div>
                </div>
              </div>
              <div className="field" style={{marginBottom:8}}>
                <label className="label">Slack Webhook URL</label>
                <div style={{display:"flex",gap:8}}>
                  <input className="inp" placeholder="https://hooks.slack.com/services/..."
                    value={notifySlack} onChange={e=>setNotifySlack(e.target.value)}/>
                  <button className="webhook-test-btn" onClick={testSlackWebhook}>Test</button>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="save-settings-btn" onClick={saveNotifSettings}>
                  {notifySaved ? "✓ Saved!" : "Save Notifications"}
                </button>
              </div>
            </div>

            {/* Bias Report */}
            <div className="settings-section">
              <div className="settings-section-title">📊 Bias Report</div>
              <div className="settings-section-sub">
                Analyze your hiring patterns across all scored candidates. Requires at least 3 candidates in your pipeline.
              </div>
              <button className="save-settings-btn"
                style={{background:generatingBias?"var(--dim)":"linear-gradient(135deg,var(--violet),var(--hi2))"}}
                onClick={generateBiasReport} disabled={generatingBias}>
                {generatingBias ? "⟳ Generating..." : "Generate Bias Report"}
              </button>
              {biasReport && (
                <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{font:"500 11px var(--mono)",color:"var(--sub)",letterSpacing:1}}>
                    REPORT · {biasReport.generatedAt} · {biasReport.totalCandidates} candidates
                  </div>

                  {/* Verdict distribution */}
                  <div>
                    <div style={{font:"600 12px var(--font)",marginBottom:8,color:"var(--sub)"}}>Verdict Distribution</div>
                    {Object.entries(biasReport.verdictCounts).map(([v,c])=>{
                      const vc = VERDICT_COLORS[v]||VERDICT_COLORS["Borderline"];
                      const pct = Math.round((c/biasReport.totalCandidates)*100);
                      return (
                        <div key={v} className="bias-bar-item">
                          <span className="bias-bar-label" style={{fontSize:11}}>{v}</span>
                          <div className="bias-bar-track">
                            <div className="bias-bar-fill" style={{width:`${pct}%`,background:vc.text}}/>
                          </div>
                          <span className="bias-bar-val">{c} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Skill averages */}
                  <div>
                    <div style={{font:"600 12px var(--font)",marginBottom:8,color:"var(--sub)"}}>Skill Score Averages</div>
                    {biasReport.skillAverages.map(({skill,avg})=>(
                      <div key={skill} className="bias-bar-item">
                        <span className="bias-bar-label" style={{fontSize:11}}>{skill}</span>
                        <div className="bias-bar-track">
                          <div className="bias-bar-fill" style={{width:`${avg}%`,background:avg>=75?"var(--green)":avg>=50?"var(--amber)":"var(--rose)"}}/>
                        </div>
                        <span className="bias-bar-val">{avg}</span>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  {biasReport.lowestSkill && (
                    <div className="bias-insight">
                      ⚠️ <div><strong>Consistently low on {biasReport.lowestSkill.skill}</strong> — average score of {biasReport.lowestSkill.avg}/100 across all candidates. Consider whether your evaluation criteria for this skill is too strict.</div>
                    </div>
                  )}
                  {biasReport.biasFlags.length > 0 && (
                    <div className="bias-insight">
                      ⚠️ <div><strong>{biasReport.biasFlags.length} bias flag{biasReport.biasFlags.length>1?"s":""} detected in your notes</strong> — {biasReport.biasFlags.slice(0,2).join("; ")}</div>
                    </div>
                  )}
                  {biasReport.biasFlags.length === 0 && (
                    <div className="bias-ok">
                      ✓ <div><strong>No bias flags detected</strong> in your interview notes. Your language appears neutral and objective.</div>
                    </div>
                  )}
                  {biasReport.avgScore && (
                    <div style={{font:"400 12px var(--font)",color:"var(--sub)"}}>
                      Average candidate score: <strong style={{color:"var(--text)"}}>{biasReport.avgScore}/100</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="settings-section">
              <div className="settings-section-title">👤 Account</div>
              <div className="settings-section-sub">Your current plan and usage.</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:8,padding:"12px 16px",flex:1,minWidth:140}}>
                  <div style={{font:"900 22px var(--font)",color:"var(--hi)"}}>{profile?.plan||"free"}</div>
                  <div style={{font:"500 11px var(--mono)",color:"var(--sub)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>Current Plan</div>
                </div>
                <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:8,padding:"12px 16px",flex:1,minWidth:140}}>
                  <div style={{font:"900 22px var(--font)",color:isLimitReached()?"var(--rose)":"var(--green)"}}>{profile?.analyses_used||0}/{profile?.analyses_limit||10}</div>
                  <div style={{font:"500 11px var(--mono)",color:"var(--sub)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>Analyses Used</div>
                </div>
                <div style={{background:"var(--ink3)",border:"1px solid var(--line)",borderRadius:8,padding:"12px 16px",flex:1,minWidth:140}}>
                  <div style={{font:"900 22px var(--font)",color:"var(--text)"}}>{candidates.length}</div>
                  <div style={{font:"500 11px var(--mono)",color:"var(--sub)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>Candidates Scored</div>
                </div>
              </div>
              {isLimitReached() && (
                <div style={{marginTop:14,background:"rgba(52,211,153,.06)",border:"1px solid rgba(52,211,153,.2)",borderRadius:8,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:13,color:"var(--green)"}}>Upgrade to Pro for unlimited analyses</div>
                  <a href="mailto:hireiqpro@gmail.com?subject=Upgrade to Pro" style={{padding:"7px 16px",background:"linear-gradient(135deg,var(--hi),var(--hi2))",borderRadius:7,color:"#000",fontWeight:700,fontSize:12,textDecoration:"none"}}>
                    Upgrade — $49/mo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ADMIN VIEW ── */}
        {profile?.is_admin && (
          <div style={{display:tab==="admin"?"flex":"none",flexDirection:"column",overflow:"hidden",flex:1}}>
            <div className="admin-view">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{font:"700 13px var(--mono)",letterSpacing:2,textTransform:"uppercase",color:"var(--sub)"}}>🛡 Admin Dashboard</span>
                <button className="new-role-btn" onClick={loadAdminData} style={{fontSize:11,padding:"6px 14px"}}>↺ Refresh</button>
              </div>

              {/* Stats */}
              {adminUsers.length > 0 && (
                <>
                  <div className="admin-stats">
                    <div className="admin-stat">
                      <div className="admin-stat-val" style={{color:"var(--hi)"}}>{adminUsers.length}</div>
                      <div className="admin-stat-label">Total Users</div>
                    </div>
                    <div className="admin-stat">
                      <div className="admin-stat-val" style={{color:"var(--green)"}}>{adminUsers.filter(u=>u.plan==="pro").length}</div>
                      <div className="admin-stat-label">Pro Users</div>
                    </div>
                    <div className="admin-stat">
                      <div className="admin-stat-val" style={{color:"var(--amber)"}}>{adminUsers.reduce((s,u)=>s+(u.analyses_used||0),0)}</div>
                      <div className="admin-stat-label">Total Analyses</div>
                    </div>
                    <div className="admin-stat">
                      <div className="admin-stat-val" style={{color:"var(--violet)"}}>{adminUsers.filter(u=>(u.analyses_used||0)>0).length}</div>
                      <div className="admin-stat-label">Active Users</div>
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Plan</th>
                          <th>Analyses Used</th>
                          <th>Limit</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map(u=>(
                          <tr key={u.id}>
                            <td style={{fontWeight:600}}>{u.full_name||"—"}</td>
                            <td style={{color:"var(--sub)",fontSize:12,fontFamily:"var(--mono)"}}>{u.email}</td>
                            <td>
                              <span className="status-badge" style={{
                                background:u.plan==="pro"?"rgba(52,211,153,.1)":"rgba(93,122,148,.1)",
                                color:u.plan==="pro"?"var(--green)":"var(--sub)",
                                border:`1px solid ${u.plan==="pro"?"rgba(52,211,153,.3)":"rgba(93,122,148,.2)"}`,
                              }}>{u.plan||"free"}</span>
                            </td>
                            <td style={{font:"600 13px var(--mono)",color:barColor((u.analyses_used||0)/(u.analyses_limit||10)*100)}}>{u.analyses_used||0}</td>
                            <td style={{font:"500 13px var(--mono)",color:"var(--sub)"}}>{u.analyses_limit||10}</td>
                            <td style={{fontSize:11,color:"var(--sub)",fontFamily:"var(--mono)"}}>{u.created_at?new Date(u.created_at).toLocaleDateString():"—"}</td>
                            <td>
                              <select className="plan-select"
                                value={u.plan||"free"}
                                onChange={e=>{
                                  const plan = e.target.value;
                                  const limit = plan==="pro"?500:plan==="team"?500:10;
                                  updateUserPlan(u.id, plan, limit);
                                }}>
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="team">Team</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {adminUsers.length === 0 && (
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"var(--sub)"}}>
                  <div style={{fontSize:44,opacity:.2}}>🛡</div>
                  <div style={{font:"700 16px var(--font)",opacity:.2}}>Click Refresh to Load Users</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ONBOARDING ── */}
        {showOnboarding && (
          <div className="onboard-overlay">
            <div className="onboard-card">
              <div className="onboard-icon">🎯</div>
              <div className="onboard-title">Welcome to HireIQ Pro</div>
              <div className="onboard-sub">
                The AI-powered interview platform that turns raw conversations into structured hiring decisions. Here's how to get started:
              </div>
              <div className="onboard-steps">
                <div className="onboard-step">
                  <div className="onboard-step-num">1</div>
                  <div className="onboard-step-text">
                    <span className="onboard-step-title">📋 Create a Role</span>
                    Go to Open Roles → click New Role → define the job title, seniority, and paste the job description. Use a template to get started instantly.
                  </div>
                </div>
                <div className="onboard-step">
                  <div className="onboard-step-num">2</div>
                  <div className="onboard-step-text">
                    <span className="onboard-step-title">🎤 Interview Candidates</span>
                    Select your role → click Analyze → enter candidate name → Start Guided Interview. AI generates tailored questions in real time.
                  </div>
                </div>
                <div className="onboard-step">
                  <div className="onboard-step-num">3</div>
                  <div className="onboard-step-text">
                    <span className="onboard-step-title">📊 Track Your Pipeline</span>
                    Save scorecards to Pipeline → compare candidates side by side → track status from Interviewed to Hired.
                  </div>
                </div>
              </div>
              <button className="onboard-btn" onClick={()=>{
                setShowOnboarding(false);
                localStorage.setItem('hireiq_onboarded','true');
                setTab('roles');
              }}>
                Create My First Role →
              </button>
            </div>
          </div>
        )}

        {/* ── CONFIRM DIALOG ── */}
        {confirmDialog && (
          <div className="confirm-overlay" onClick={()=>setConfirmDialog(null)}>
            <div className="confirm-card" onClick={e=>e.stopPropagation()}>
              <div className="confirm-title">{confirmDialog.title}</div>
              <div className="confirm-sub">{confirmDialog.message}</div>
              <div className="confirm-actions">
                <button className="modal-cancel" onClick={()=>setConfirmDialog(null)}>Cancel</button>
                <button className="modal-save" style={{background:confirmDialog.danger?"var(--rose)":"linear-gradient(135deg,var(--hi),var(--hi2))",color:confirmDialog.danger?"#fff":"#000"}}
                  onClick={confirmDialog.onConfirm}>
                  {confirmDialog.confirmLabel}
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
