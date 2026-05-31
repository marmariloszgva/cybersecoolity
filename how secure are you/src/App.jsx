import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;margin:0;font-family:'Nunito',sans-serif;}
@keyframes ga{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes f1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-22px) rotate(12deg)}}
@keyframes f2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-35px) rotate(-18deg)}}
@keyframes f3{0%,100%{transform:translate(0,0)}33%{transform:translate(12px,-18px)}66%{transform:translate(-8px,14px)}}
@keyframes db{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes dw{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(22deg)}}
@keyframes ds{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes dgold{0%,100%{filter:drop-shadow(0 0 4px #fbbf24) drop-shadow(0 0 8px #f59e0b)}50%{filter:drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 20px #f59e0b)}}
@keyframes su{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes si{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes ti{from{opacity:0;transform:translateX(-50%) translateY(16px) scale(0.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
@keyframes sparkle{0%,100%{opacity:0;transform:scale(0) rotate(0deg)}50%{opacity:1;transform:scale(1) rotate(180deg)}}
@keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-80px) rotate(720deg);opacity:0}}
.su-anim{animation:su 0.5s ease both;}
.si-anim{animation:si 0.35s ease both;}
.fi-anim{animation:fi 0.4s ease both;}
.cl-item{transition:transform 0.2s ease,box-shadow 0.2s ease;}
.cl-item:hover{transform:translateX(3px);}
.edu-card{transition:transform 0.25s ease,box-shadow 0.25s ease,border-color 0.25s ease;}
.edu-card:hover{transform:translateY(-3px);}
.nav-pill{transition:all 0.2s ease;cursor:pointer;border:none;background:transparent;font-family:'Nunito',sans-serif;}
.q-opt{transition:transform 0.18s ease,box-shadow 0.18s ease;}
.q-opt:hover{transform:scale(1.02);}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(96,165,250,0.4);border-radius:3px;}
`;

/* ── DATA ──────────────────────────────────────── */
const QUIZZES = [
  {
    id:'phishing', emoji:'📧', title:'Phishing Email', step:'Quiz 1 of 3',
    instructions:'Is this email legitimate or a phishing attempt?',
    type:'yesno',
    email:{
      from:'noreply@paypαl-security-center.com',
      subject:'🚨 URGENT: Your account has been suspended',
      body:'Dear Valued Customer,\n\nWe\'ve detected unusual activity on your account and temporarily limited your access.\n\nClick the button below to verify your identity within 24 hours or permanently lose access.',
      link:'http://secure.paypal-account-verify.info/restore',
    },
    isScam:true,
    trueLabel:'🚩 It\'s Phishing!', falseLabel:'✅ Looks Legit',
    explanation:'Red flags: Unicode "α" in "paypαl" (not real PayPal!), urgent threatening language, and the link goes to a fake domain — not paypal.com.',
  },
  {
    id:'links', emoji:'🔗', title:'Fake Link Detector', step:'Quiz 2 of 3',
    instructions:'Which URL is the real Google sign-in page?',
    type:'choice',
    options:[
      {label:'https://accounts.google.com/signin', safe:true},
      {label:'https://google-accounts.login-secure.com/signin', safe:false},
      {label:'https://accounts.gooogle.com/Sign-In', safe:false},
    ],
    explanation:'"accounts.google.com" is the only real Google domain. The others use deceptive lookalike domains and typosquatting (gooogle with 3 o\'s).',
  },
  {
    id:'sms', emoji:'📱', title:'Scam Text Alert', step:'Quiz 3 of 3',
    instructions:'Is this text message a scam?',
    type:'yesno',
    sms:{
      sender:'FedEx Delivery Alerts',
      number:'+1 (312) 555-0247',
      time:'2:34 PM',
      message:'Your package #FX29817 is held at customs. Pay a $3.47 processing fee to release your package: http://fedx-customs-release.us/pay',
    },
    isScam:true,
    trueLabel:'🚩 It\'s a Scam!', falseLabel:'✅ Looks Real',
    explanation:'Classic delivery fee scam: unofficial domain "fedx-customs-release.us", a tiny fee to seem believable, and an unsolicited message. FedEx never texts about customs fees.',
  },
];

const CHECKLIST_ITEMS = [
  {id:'twofa',   emoji:'🔐', title:'Enable Two-Factor Authentication', desc:'Add an extra layer to all important accounts'},
  {id:'passwords',emoji:'🔑', title:'Use Unique Passwords Everywhere',  desc:'Never reuse passwords — use a password manager'},
  {id:'email',   emoji:'📩', title:'Secure Your Email Account',         desc:'Your email is the master key — protect it first'},
  {id:'privacy', emoji:'👁️', title:'Review Your Privacy Settings',      desc:'Audit social media and app permissions regularly'},
  {id:'backup',  emoji:'💾', title:'Backup Your Important Files',       desc:'Use the 3-2-1 rule: 3 copies, 2 formats, 1 offsite'},
];

const EDU_CARDS = [
  {id:'phishing', emoji:'🎣', title:'Phishing Attacks',   tag:'THREAT',   tagColor:'#dc2626', bg:'#fff7ed', accent:'#ea580c', short:'Fake emails designed to steal your credentials', detail:'Phishing emails impersonate trusted companies to trick you into entering passwords or payment info. Always check the actual sender domain, hover over links to preview where they go, and access accounts by typing URLs directly rather than clicking email links.'},
  {id:'passwords',emoji:'🔑', title:'Password Safety',    tag:'ESSENTIAL', tagColor:'#2563eb', bg:'#eff6ff', accent:'#3b82f6', short:'Long, unique passwords for every account',          detail:'Strong passwords are 12+ characters with uppercase, lowercase, numbers, and symbols. Use a password manager like Bitwarden or 1Password to generate and store unique passwords for every site. Never reuse passwords across accounts.'},
  {id:'wifi',     emoji:'📡', title:'Public WiFi Risks',  tag:'CAUTION',   tagColor:'#16a34a', bg:'#f0fdf4', accent:'#22c55e', short:'Public networks can expose all your traffic',       detail:'Public WiFi is often unencrypted — anyone nearby can intercept data. Avoid banking and sensitive logins on public WiFi. Use a trusted VPN to encrypt your traffic, and always verify the exact network name before connecting (fake hotspots are common).'},
  {id:'privacy',  emoji:'🛡️', title:'Privacy Tips',       tag:'TIPS',      tagColor:'#9333ea', bg:'#faf5ff', accent:'#a855f7', short:'Control what you share and with whom',             detail:'Review app permissions and revoke what isn\'t needed. Be careful about public personal info — your birthdate, hometown, and full name can enable identity theft. Use privacy-focused tools like Firefox, DuckDuckGo, and Signal for sensitive communications.'},
  {id:'accounts', emoji:'🏦', title:'Account Security',   tag:'CRITICAL',  tagColor:'#b45309', bg:'#fffbeb', accent:'#f59e0b', short:'Protect your digital identity online',             detail:'Enable 2FA on every account that supports it, especially email, banking, and social media. Use an authenticator app instead of SMS when possible. Regularly audit which apps and services have access to your accounts, and revoke old ones.'},
];

const BADGE_DEFS = {
  'konami':             {emoji:'🎮', name:'Konami Master',    desc:'You found the secret code!'},
  'quiz-master':        {emoji:'🏆', name:'Quiz Master',      desc:'Perfect quiz score!'},
  'checklist-complete': {emoji:'💯', name:'Security Pro',     desc:'Completed the full checklist!'},
  'golden-duck':        {emoji:'🦆', name:'Golden Duck',      desc:'Found the rare golden duck!'},
};

/* ── UTILS ─────────────────────────────────────── */
function analyzePassword(pwd) {
  if (!pwd) return { score:0, label:'', color:'#e2e8f0', time:'', tips:[], pct:0 };
  let s = 0;
  const tips = [];
  if (pwd.length >= 8)  s++;
  if (pwd.length >= 12) s++; else tips.push('Use at least 12 characters');
  if (pwd.length >= 16) s++;
  if (/[A-Z]/.test(pwd)) s++; else tips.push('Add uppercase letters (A-Z)');
  if (/[a-z]/.test(pwd)) s++; else tips.push('Add lowercase letters (a-z)');
  if (/[0-9]/.test(pwd)) s++; else tips.push('Include numbers (0-9)');
  if (/[^A-Za-z0-9]/.test(pwd)) s++; else tips.push('Add symbols like !@#$%^');
  let cs = 0;
  if (/[a-z]/.test(pwd)) cs += 26;
  if (/[A-Z]/.test(pwd)) cs += 26;
  if (/[0-9]/.test(pwd)) cs += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) cs += 32;
  const sec = Math.pow(cs || 1, pwd.length || 0) / 1e9;
  let time = 'instantly';
  if (sec >= 3.15e7) time = `${Math.round(sec/3.15e7)} years`;
  else if (sec >= 86400) time = `${Math.round(sec/86400)} days`;
  else if (sec >= 3600)  time = `${Math.round(sec/3600)} hours`;
  else if (sec >= 60)    time = `${Math.round(sec/60)} minutes`;
  else if (sec >= 1)     time = `${Math.round(sec)} seconds`;
  const labels = ['','Very Weak','Weak','Fair','Good','Strong','Very Strong','Excellent'];
  const colors = ['#e2e8f0','#ef4444','#f97316','#eab308','#22c55e','#10b981','#3b82f6','#8b5cf6'];
  return { score:s, label:labels[Math.min(s,7)], color:colors[Math.min(s,7)], time, tips, pct:(s/7)*100 };
}

function genPassword() {
  // Easter egg (10% chance)
  if (Math.random() < 0.10) {
    return "Welc0me to Batum1!!!!";
  }

  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums  = '0123456789';
  const syms  = '!@#$%^&*-_+=?';
  const all   = lower + upper + nums + syms;

  let p = lower[Math.floor(Math.random()*lower.length)]
        + upper[Math.floor(Math.random()*upper.length)]
        + nums[Math.floor(Math.random()*nums.length)]
        + syms[Math.floor(Math.random()*syms.length)];

  for (let i = 0; i < 12; i++) {
    p += all[Math.floor(Math.random()*all.length)];
  }

  return p.split('').sort(() => Math.random() - 0.5).join('');
}

function getProfile(s) {
  if (s >= 85) return {name:'Digital Ghost',    emoji:'👻', tagline:'Nearly untraceable online. Impressive!',       color:'#7c3aed', bg:'#f5f3ff'};
  if (s >= 70) return {name:'Secure Explorer',  emoji:'🛡️', tagline:'Solid habits with room to grow.',               color:'#2563eb', bg:'#eff6ff'};
  if (s >= 50) return {name:'Cautious Clicker', emoji:'🔍', tagline:'Getting there — a few tweaks needed.',          color:'#059669', bg:'#f0fdf4'};
  if (s >= 30) return {name:'Risky Clicker',    emoji:'⚠️', tagline:'Several areas need your attention.',            color:'#d97706', bg:'#fffbeb'};
  return           {name:'Open Book',           emoji:'📖', tagline:'Your security needs a serious upgrade!',        color:'#dc2626', bg:'#fff1f2'};
}

/* ── DUCK SVG ───────────────────────────────────── */
function Duck({ emotion = 'happy', size = 54 }) {
  const gold = emotion === 'golden';
  const body = gold ? '#fbbf24' : '#fde68a';
  const wing = gold ? '#f59e0b' : '#fbbf24';
  const sad  = emotion === 'sad';
  const exc  = emotion === 'excited';
  const wave = emotion === 'wave';
  const anim = wave ? 'dw 0.5s ease-in-out infinite'
              : exc  ? 'ds 0.4s ease-in-out infinite'
              : gold  ? 'dgold 1.5s ease-in-out infinite'
              :          'db 2.2s ease-in-out infinite';
  return (
    <svg width={size} height={size} viewBox="0 0 62 68" fill="none" style={{ animation: anim, display:'block' }}>
      <ellipse cx="31" cy="47" rx="21" ry="14" fill={body} />
      <ellipse cx="19" cy="49" rx="10" ry="5.5" fill={wing} transform="rotate(-20 19 49)" />
      <path d="M 10 46 Q 4 38 8 31 Q 12 42 17 44" fill={wing} />
      <circle cx="31" cy="24" r="13.5" fill={body} />
      <path d="M 43 22.5 L 52 25 L 43 27.5 Z" fill="#f97316" />
      <circle cx="37" cy={sad ? 22 : 21} r="3.5" fill="#1e293b" />
      <circle cx="38.2" cy={sad ? 21 : 20} r="1.2" fill="white" />
      {sad && <path d="M 33 17.5 Q 36.5 15.5 40 17.5" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />}
      {!sad && <ellipse cx="34" cy="29.5" rx="4.5" ry="2.5" fill="#fca5a5" opacity="0.55" />}
      {sad && <ellipse cx="40" cy="28" rx="2" ry="3.2" fill="#93c5fd" opacity="0.85" />}
      {gold && <>
        <circle cx="14" cy="14" r="2.5" fill="#fcd34d" style={{ animation:'sparkle 1s ease-in-out infinite' }} />
        <circle cx="48" cy="10" r="2"   fill="#fcd34d" style={{ animation:'sparkle 1.4s ease-in-out infinite' }} />
        <circle cx="8"  cy="42" r="1.8" fill="#fcd34d" style={{ animation:'sparkle 0.8s ease-in-out infinite' }} />
      </>}
    </svg>
  );
}

/* ── TOAST ──────────────────────────────────────── */
function Toast({ msg }) {
  return (
    <div style={{
      position:'absolute', bottom:70, left:'50%',
      background:'rgba(15,23,42,0.92)', color:'white',
      padding:'12px 22px', borderRadius:100, fontSize:13, fontWeight:700,
      zIndex:9990, whiteSpace:'nowrap', animation:'ti 0.3s ease',
      backdropFilter:'blur(8px)', boxShadow:'0 4px 20px rgba(0,0,0,0.2)',
      border:'1px solid rgba(255,255,255,0.12)', pointerEvents:'none',
    }}>{msg}</div>
  );
}

/* ── NAV ────────────────────────────────────────── */
function Nav({ section, setSection, dark, toggleDark }) {
  const items = [
    {id:'home',      label:'Home',      emoji:'🏠'},
    {id:'password',  label:'Password',  emoji:'🔒'},
    {id:'quiz',      label:'Quizzes',   emoji:'🎯'},
    {id:'checklist', label:'Checklist', emoji:'✅'},
    {id:'cards',     label:'Learn',     emoji:'📚'},
    {id:'results',   label:'Results',   emoji:'🏆'},
  ];
  const bg     = dark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.9)';
  const bdr    = dark ? 'rgba(255,255,255,0.07)' : 'rgba(219,234,254,0.9)';
  const muted  = dark ? '#64748b' : '#94a3b8';
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:2, padding:'8px 10px',
      background:bg, borderBottom:`1px solid ${bdr}`,
      backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:1000,
      overflowX:'auto', flexShrink:0,
    }}>
      {items.map(item => {
        const active = section === item.id;
        return (
          <button key={item.id} onClick={() => setSection(item.id)} className="nav-pill" style={{
            padding:'7px 13px', borderRadius:100, fontSize:12.5, fontWeight:800,
            color: active ? 'white' : muted,
            background: active ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'transparent',
            boxShadow: active ? '0 2px 10px rgba(59,130,246,0.35)' : 'none',
            whiteSpace:'nowrap', flexShrink:0,
          }}>{item.emoji} {item.label}</button>
        );
      })}
      <div style={{ marginLeft:'auto', flexShrink:0 }}>
        <button onClick={toggleDark} style={{
          background:'transparent', border:'none', cursor:'pointer',
          fontSize:17, padding:'4px 8px', borderRadius:8,
        }}>{dark ? '☀️' : '🌙'}</button>
      </div>
    </div>
  );
}

/* ── HOME ───────────────────────────────────────── */
function HomeSection({ setSection, dark }) {
  const text  = dark ? '#f1f5f9' : '#1e293b';
  const muted = dark ? '#94a3b8' : '#64748b';
  const glass = dark ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.72)';
  const glBdr = dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.65)';
  const feats = [
    {emoji:'🔒', title:'Password Checker', desc:'Test strength in real-time',  id:'password'},
    {emoji:'🎯', title:'Phishing Quizzes',  desc:'Can you spot the scam?',     id:'quiz'},
    {emoji:'✅', title:'Safety Checklist',  desc:'Track your security habits', id:'checklist'},
    {emoji:'📚', title:'Security 101',      desc:'Quick digestible tips',      id:'cards'},
  ];
  return (
    <div style={{
      minHeight:'calc(100vh - 50px)', position:'relative', overflow:'hidden',
      background: dark
        ? 'linear-gradient(135deg,#0f172a,#1e293b,#0c1a35)'
        : 'linear-gradient(135deg,#e0f2fe,#bfdbfe,#ddd6fe,#bfdbfe,#e0f2fe)',
      backgroundSize:'400% 400%', animation:'ga 10s ease infinite',
    }}>
      {/* Blobs */}
      {[
        {t:'6%', l:'4%',  w:130, h:130, col:dark?'rgba(59,130,246,0.15)':'rgba(147,197,253,0.45)', anim:'f1 7s ease-in-out infinite'},
        {t:'18%',r:'7%',  w:90,  h:90,  col:dark?'rgba(99,102,241,0.12)':'rgba(196,181,253,0.4)',  anim:'f2 8s ease-in-out infinite'},
        {b:'28%',l:'13%', w:70,  h:70,  col:dark?'rgba(14,165,233,0.12)':'rgba(125,211,252,0.4)',  anim:'f3 10s ease-in-out infinite'},
        {b:'12%',r:'18%', w:110, h:110, col:dark?'rgba(59,130,246,0.1)': 'rgba(147,197,253,0.35)', anim:'f1 9s ease-in-out infinite reverse'},
        {t:'40%',l:'45%', w:50,  h:50,  col:dark?'rgba(139,92,246,0.1)': 'rgba(216,180,254,0.35)', anim:'f2 6s ease-in-out infinite 2s'},
      ].map((b,i) => (
        <div key={i} style={{
          position:'absolute', top:b.t, bottom:b.b, left:b.l, right:b.r,
          width:b.w, height:b.h, borderRadius:'50%',
          background:b.col, animation:b.anim,
        }}/>
      ))}

      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', minHeight:'calc(100vh - 110px)',
        padding:'40px 20px 20px', textAlign:'center', position:'relative', zIndex:2,
      }}>
        {/* Pill badge */}
        <div className="su-anim" style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background: dark ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.1)',
          color:'#3b82f6', border:'1px solid rgba(59,130,246,0.3)',
          borderRadius:100, padding:'6px 18px', fontSize:12.5, fontWeight:800,
          marginBottom:20, letterSpacing:0.3,
        }}>🛡️ Free Security Check — No Sign-Up Needed</div>

        {/* Title */}
        <h1 className="su-anim" style={{
          fontSize:'clamp(26px,7vw,50px)', fontWeight:900,
          background:'linear-gradient(135deg,#1e40af,#3b82f6,#0ea5e9)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text', lineHeight:1.1, marginBottom:14, animationDelay:'0.1s',
        }}>How Secure Are You?</h1>

        <p className="su-anim" style={{
          fontSize:'clamp(14px,3vw,18px)', color:muted, maxWidth:430,
          lineHeight:1.65, marginBottom:32, animationDelay:'0.2s', fontWeight:600,
        }}>Learn how safe your online habits really are. Take a quick check and level up your digital security. 🚀</p>
        <p className="su-anim" style={{
          fontSize:'clamp(14px,3vw,18px)',
          color:muted,
          maxWidth:430,
          lineHeight:1.5,
          marginBottom:10,
          animationDelay:'0.2s',
          fontWeight:500,
        }}>
        By Mariam Kakhetelidze and Andria Abulashvili
        </p>
        {/* CTA */}
        <button className="su-anim" onClick={() => setSection('password')} style={{
          background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
          border:'none', borderRadius:100, padding:'15px 40px', fontSize:16,
          fontWeight:800, cursor:'pointer', fontFamily:'inherit', marginBottom:36,
          boxShadow:'0 8px 28px rgba(59,130,246,0.38)', animationDelay:'0.25s',
          transition:'all 0.25s ease',
        }}
          onMouseEnter={e=>{e.target.style.transform='translateY(-3px)';e.target.style.boxShadow='0 12px 36px rgba(59,130,246,0.48)';}}
          onMouseLeave={e=>{e.target.style.transform='translateY(0)';e.target.style.boxShadow='0 8px 28px rgba(59,130,246,0.38)';}}
        >🔍 Start My Scan</button>

        {/* Feature grid */}
        <div className="su-anim" style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(148px,1fr))',
          gap:10, width:'100%', maxWidth:580, animationDelay:'0.35s',
        }}>
          {feats.map(f => (
            <div key={f.id} onClick={() => setSection(f.id)} style={{
              background:glass, border:`1px solid ${glBdr}`,
              borderRadius:20, padding:'18px 14px', cursor:'pointer',
              backdropFilter:'blur(12px)', textAlign:'center',
              transition:'all 0.25s ease',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(59,130,246,0.18)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}
            >
              <div style={{fontSize:26, marginBottom:7}}>{f.emoji}</div>
              <div style={{fontSize:12.5, fontWeight:800, color:text, marginBottom:4}}>{f.title}</div>
              <div style={{fontSize:11.5, color:muted}}>{f.desc}</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop:20, fontSize:11, color:muted, fontWeight:700, opacity:0.7 }}>
          🦆 Try the Konami code for a surprise... ↑↑↓↓←→←→BA
        </p>
      </div>

      {/* Hidden golden duck easter egg */}
      <div id="golden-egg" style={{
        position:'absolute', bottom:16, right:18,
        opacity:0.15, cursor:'pointer', fontSize:22,
        transition:'opacity 0.3s ease',
      }}
        onMouseEnter={e => e.target.style.opacity='0.5'}
        onMouseLeave={e => e.target.style.opacity='0.15'}
        title=""
      >🦆</div>
    </div>
  );
}

/* ── PASSWORD ───────────────────────────────────── */
function PasswordSection({ onScore, setEmotion, dark }) {
  const [pwd, setPwd]     = useState('');
  const [show, setShow]   = useState(false);
  const [copied, setCopy] = useState(false);
  const a = analyzePassword(pwd);

  useEffect(() => {
    onScore(a.score);
    if (!pwd)          setEmotion('happy');
    else if (a.score <= 2) setEmotion('sad');
    else if (a.score >= 6) setEmotion('excited');
    else               setEmotion('happy');
  }, [pwd]);

  const doGenerate = () => {
    setPwd(genPassword());
    setEmotion('wave');
    setTimeout(() => setEmotion('excited'), 700);
  };

  const doCopy = () => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd).catch(() => {});
    setCopy(true);
    setTimeout(() => setCopy(false), 2200);
  };

  const T = dark ? '#f1f5f9' : '#1e293b';
  const M = dark ? '#94a3b8' : '#64748b';
  const C = dark ? '#1e293b' : 'white';
  const B = dark ? 'rgba(255,255,255,0.09)' : 'rgba(219,234,254,0.5)';
  const iB= dark ? '#0f172a' : '#f8fafc';
  const iBC= dark ? 'rgba(255,255,255,0.12)' : '#e2e8f0';

  return (
    <div style={{ padding:'20px 16px', maxWidth:580, margin:'0 auto' }}>
      <div className="su-anim" style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ fontSize:38, marginBottom:8 }}>🔒</div>
        <h2 style={{ fontSize:22, fontWeight:900, color:T, marginBottom:5 }}>Password Safety Checker</h2>
        <p style={{ color:M, fontSize:13 }}>Test your password strength in real-time</p>
      </div>

      {/* Input card */}
      <div className="su-anim" style={{
        background:C, border:`1px solid ${B}`, borderRadius:22,
        padding:22, marginBottom:14, boxShadow:'0 4px 18px rgba(59,130,246,0.07)',
        animationDelay:'0.1s',
      }}>
        {/* Password input */}
        <div style={{ position:'relative', marginBottom:18 }}>
          <input
            type={show ? 'text' : 'password'}
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="Type or paste a password..."
            style={{
              width:'100%', padding:'13px 46px 13px 17px',
              border:`2px solid ${pwd ? a.color : iBC}`,
              borderRadius:13, fontSize:14, fontFamily:'inherit',
              background:iB, color:T, outline:'none',
              transition:'border-color 0.3s ease',
            }}
          />
          <button onClick={() => setShow(s => !s)} style={{
            position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
            background:'transparent', border:'none', cursor:'pointer', fontSize:17,
          }}>{show ? '🙈' : '👁️'}</button>
        </div>

        {/* Strength bar */}
        {pwd && (
          <div style={{ marginBottom:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:13, fontWeight:800, color:a.color }}>{a.label}</span>
              <span style={{ fontSize:12, color:M }}>{a.score}/7 points</span>
            </div>
            <div style={{ height:10, background:dark?'#334155':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:100,
                background:a.color, width:`${a.pct}%`,
                transition:'width 0.45s ease, background 0.45s ease',
              }} />
            </div>
          </div>
        )}

        {/* Time-to-crack */}
        {pwd && (
          <div style={{
            background: dark?'rgba(59,130,246,0.1)':'#eff6ff',
            border:`1px solid ${dark?'rgba(59,130,246,0.18)':'#bfdbfe'}`,
            borderRadius:13, padding:'13px 16px', marginBottom:14,
            display:'flex', alignItems:'center', gap:12,
          }}>
            <span style={{ fontSize:26 }}>⏱️</span>
            <div>
              <div style={{ fontSize:11, color:M, fontWeight:700 }}>Estimated time to crack</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#2563eb' }}>{a.time || '—'}</div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:11, color:M, fontWeight:600, maxWidth:100, textAlign:'right' }}>
              at 1 billion guesses/sec
            </div>
          </div>
        )}

        {/* Tips */}
        {pwd && a.tips.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:12.5, fontWeight:800, color:T, marginBottom:7 }}>💡 Improvements:</div>
            {a.tips.slice(0,3).map((tip,i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:7, padding:'8px 12px',
                background:dark?'rgba(239,68,68,0.08)':'#fef2f2',
                borderRadius:9, marginBottom:5, fontSize:12.5,
                color:dark?'#fca5a5':'#dc2626', fontWeight:700,
              }}>⚠️ {tip}</div>
            ))}
          </div>
        )}

        {/* Excellent */}
        {pwd && a.score >= 6 && (
          <div style={{
            background:dark?'rgba(16,185,129,0.1)':'#f0fdf4',
            border:`1px solid ${dark?'rgba(16,185,129,0.2)':'#bbf7d0'}`,
            borderRadius:12, padding:'11px 15px',
            fontSize:13, color:'#059669', fontWeight:800,
            display:'flex', alignItems:'center', gap:8,
          }}>🎉 Excellent password! You're well protected.</div>
        )}
      </div>

      {/* Generator */}
      <div className="su-anim" style={{
        background:C, border:`1px solid ${B}`, borderRadius:22,
        padding:20, boxShadow:'0 4px 18px rgba(59,130,246,0.07)', animationDelay:'0.18s',
      }}>
        <div style={{ fontWeight:900, color:T, marginBottom:3, fontSize:14 }}>🎲 Secure Password Generator</div>
        <div style={{ color:M, fontSize:12.5, marginBottom:14 }}>Generate a cryptographically strong 16-character password</div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={doGenerate} style={{
            flex:1, background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
            border:'none', borderRadius:11, padding:'12px', fontSize:13.5, fontWeight:800,
            cursor:'pointer', fontFamily:'inherit',
            boxShadow:'0 4px 12px rgba(59,130,246,0.3)', transition:'all 0.2s ease',
          }}
            onMouseEnter={e => e.target.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform='translateY(0)'}
          >✨ Generate</button>
          {pwd && (
            <button onClick={doCopy} style={{
              padding:'12px 17px', background:dark?'rgba(255,255,255,0.05)':'#f8fafc',
              border:`1px solid ${B}`, borderRadius:11,
              fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
              color:T, transition:'all 0.2s ease',
            }}>{copied ? '✅ Copied!' : '📋 Copy'}</button>
          )}
        </div>
        <p style={{ marginTop:12, fontSize:11.5, color:M, textAlign:'center', fontWeight:700 }}>
          💡 Use a password manager — you shouldn't need to remember it!
        </p>
      </div>
    </div>
  );
}

/* ── QUIZ ───────────────────────────────────────── */
function QuizSection({ onResults, setEmotion, dark, awardBadge }) {
  const [qi, setQi]   = useState(0);
  const [ans, setAns] = useState({});
  const [show, setShow] = useState(false);
  const [sel, setSel]  = useState(null);
  const [done, setDone] = useState(false);

  const T  = dark ? '#f1f5f9' : '#1e293b';
  const M  = dark ? '#94a3b8' : '#64748b';
  const C  = dark ? '#1e293b' : 'white';
  const B  = dark ? 'rgba(255,255,255,0.09)' : 'rgba(219,234,254,0.5)';
  const q  = QUIZZES[qi];
  const cc = Object.values(ans).filter(Boolean).length;

  const submit = (correct, choice = null) => {
    if (show) return;
    const nA = { ...ans, [q.id]: correct };
    setAns(nA); setSel(choice); setShow(true);
    setEmotion(correct ? 'excited' : 'sad');
    onResults(nA);
  };

  const next = () => {
    setShow(false); setSel(null);
    if (qi < QUIZZES.length - 1) { setQi(i => i+1); setEmotion('happy'); }
    else {
      setDone(true);
      const total = Object.values({...ans}).filter(Boolean).length;
      if (total === QUIZZES.length) { awardBadge('quiz-master'); setEmotion('wave'); }
      else setEmotion('happy');
    }
  };

  if (done) {
    const sc = Object.values(ans).filter(Boolean).length;
    return (
      <div style={{ padding:'24px 16px', maxWidth:520, margin:'0 auto', textAlign:'center' }}>
        <div className="su-anim" style={{
          background:C, border:`1px solid ${B}`, borderRadius:24,
          padding:30, boxShadow:'0 4px 18px rgba(59,130,246,0.07)',
        }}>
          <div style={{ fontSize:56, marginBottom:14 }}>{sc===3?'🏆':sc===2?'🎯':'🔄'}</div>
          <h3 style={{ fontSize:21, fontWeight:900, color:T, marginBottom:7 }}>Quiz Complete!</h3>
          <p style={{ color:M, marginBottom:20, fontSize:14 }}>
            You got <strong style={{ color:sc>=2?'#10b981':'#ef4444' }}>{sc} of {QUIZZES.length}</strong> correct
          </p>
          {QUIZZES.map(qz => (
            <div key={qz.id} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 14px', borderRadius:12, marginBottom:8,
              background:dark?'rgba(255,255,255,0.04)':'#f8fafc',
              border:`1px solid ${B}`,
            }}>
              <span style={{ fontSize:18 }}>{qz.emoji}</span>
              <span style={{ flex:1, fontSize:13, fontWeight:800, color:T, textAlign:'left' }}>{qz.title}</span>
              <span style={{ fontSize:15 }}>{ans[qz.id] ? '✅' : '❌'}</span>
            </div>
          ))}
          <button onClick={() => { setQi(0); setAns({}); setDone(false); setShow(false); setSel(null); setEmotion('happy'); }} style={{
            marginTop:14, background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
            border:'none', borderRadius:100, padding:'11px 28px', fontSize:13.5,
            fontWeight:800, cursor:'pointer', fontFamily:'inherit',
          }}>🔄 Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'20px 16px', maxWidth:560, margin:'0 auto' }}>
      {/* Progress dots */}
      <div className="su-anim" style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:14, padding:'0 4px',
      }}>
        <span style={{ fontSize:12, fontWeight:800, color:M }}>{q.step}</span>
        <div style={{ display:'flex', gap:6 }}>
          {QUIZZES.map((_,i) => (
            <div key={i} style={{
              width:30, height:7, borderRadius:100,
              background: i<qi ? '#10b981' : i===qi ? '#3b82f6' : dark?'#334155':'#e2e8f0',
              transition:'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      <div className="si-anim" style={{
        background:C, border:`1px solid ${B}`, borderRadius:22,
        padding:20, boxShadow:'0 4px 18px rgba(59,130,246,0.07)',
      }}>
        <div style={{ fontSize:11, fontWeight:900, color:'#3b82f6', marginBottom:5, textTransform:'uppercase', letterSpacing:0.8 }}>
          {q.emoji} {q.title}
        </div>
        <p style={{ fontSize:14.5, fontWeight:800, color:T, marginBottom:16 }}>{q.instructions}</p>

        {/* Email mockup */}
        {q.email && (
          <div style={{
            background:dark?'#0f172a':'#f8fafc',
            border:`1px solid ${B}`, borderRadius:13,
            overflow:'hidden', marginBottom:16, fontSize:12.5,
          }}>
            <div style={{ padding:'9px 13px', background:dark?'#1e293b':'#e8edf2', borderBottom:`1px solid ${B}` }}>
              <div style={{ color:M, marginBottom:2 }}><b>From:</b> <span style={{ color:'#ef4444', fontFamily:'monospace' }}>{q.email.from}</span></div>
              <div style={{ color:T, fontWeight:700 }}><span style={{ fontWeight:400, color:M }}>Subject: </span>{q.email.subject}</div>
            </div>
            <div style={{ padding:'13px', color:T, lineHeight:1.7, whiteSpace:'pre-line' }}>{q.email.body}</div>
            <div style={{ padding:'0 13px 13px' }}>
              <span style={{ display:'inline-block', padding:'8px 16px', background:'#2563eb', color:'white', borderRadius:7, fontSize:12.5, fontWeight:700 }}>Verify Account →</span>
              <div style={{ marginTop:5, fontSize:11, color:'#ef4444', fontFamily:'monospace', wordBreak:'break-all' }}>{q.email.link}</div>
            </div>
          </div>
        )}

        {/* SMS mockup */}
        {q.sms && (
          <div style={{ background:dark?'#0f172a':'#f1f5f9', border:`1px solid ${B}`, borderRadius:13, padding:14, marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:11, paddingBottom:9, borderBottom:`1px solid ${B}` }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:13 }}>📦</div>
              <div>
                <div style={{ fontWeight:800, color:T, fontSize:13 }}>{q.sms.sender}</div>
                <div style={{ color:M, fontSize:11 }}>{q.sms.number}</div>
              </div>
              <div style={{ marginLeft:'auto', color:M, fontSize:11 }}>{q.sms.time}</div>
            </div>
            <div style={{ background:'#3b82f6', color:'white', borderRadius:'16px 16px 4px 16px', padding:'10px 14px', fontSize:13, lineHeight:1.6, maxWidth:'85%', marginLeft:'auto' }}>
              {q.sms.message}
            </div>
          </div>
        )}

        {/* URL choices */}
        {q.type === 'choice' && (
          <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:14 }}>
            {q.options.map((opt, i) => {
              let bg   = dark?'rgba(255,255,255,0.04)':'#f8fafc';
              let bdr  = B;
              let icon = null;
              if (show && sel === i) {
                bg  = opt.safe?(dark?'rgba(16,185,129,0.1)':'#f0fdf4'):(dark?'rgba(239,68,68,0.1)':'#fef2f2');
                bdr = opt.safe?'rgba(16,185,129,0.4)':'rgba(239,68,68,0.4)';
                icon = opt.safe?'✅':'❌';
              } else if (show && opt.safe) {
                bg  = dark?'rgba(16,185,129,0.1)':'#f0fdf4';
                bdr = 'rgba(16,185,129,0.4)';
                icon = '✅';
              }
              return (
                <div key={i} onClick={() => !show && submit(opt.safe, i)} className="q-opt" style={{
                  padding:'12px 14px', borderRadius:12, border:`1.5px solid ${bdr}`,
                  background:bg, cursor:show?'default':'pointer',
                  fontFamily:'monospace', fontSize:12.5, color:T,
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}>
                  <span>🔗 {opt.label}</span>
                  {icon && <span>{icon}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Yes/No */}
        {q.type === 'yesno' && !show && (
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => submit(false)} className="q-opt" style={{
              flex:1, padding:'12px', borderRadius:12, cursor:'pointer',
              background:dark?'rgba(16,185,129,0.1)':'#f0fdf4',
              border:'1.5px solid rgba(16,185,129,0.3)',
              fontSize:13.5, fontWeight:800, color:'#059669', fontFamily:'inherit',
            }}>{q.falseLabel}</button>
            <button onClick={() => submit(true)} className="q-opt" style={{
              flex:1, padding:'12px', borderRadius:12, cursor:'pointer',
              background:dark?'rgba(239,68,68,0.1)':'#fef2f2',
              border:'1.5px solid rgba(239,68,68,0.3)',
              fontSize:13.5, fontWeight:800, color:'#dc2626', fontFamily:'inherit',
            }}>{q.trueLabel}</button>
          </div>
        )}

        {/* Explanation */}
        {show && (
          <div className="su-anim" style={{
            background:dark?'rgba(59,130,246,0.1)':'#eff6ff',
            border:'1.5px solid rgba(59,130,246,0.22)',
            borderRadius:13, padding:'13px 15px',
            marginTop: q.type==='choice'?0:13,
            fontSize:13, color:dark?'#93c5fd':'#1d4ed8', lineHeight:1.65,
          }}>
            <strong>💡 Explanation:</strong> {q.explanation}
            <div style={{ marginTop:11 }}>
              <button onClick={next} style={{
                background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
                border:'none', borderRadius:100, padding:'9px 22px',
                fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
              }}>{qi < QUIZZES.length-1 ? 'Next Question →' : 'See My Results 🏆'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CHECKLIST ──────────────────────────────────── */
function ChecklistSection({ items, setItems, setEmotion, dark, awardBadge }) {
  const T = dark ? '#f1f5f9' : '#1e293b';
  const M = dark ? '#94a3b8' : '#64748b';
  const C = dark ? '#1e293b' : 'white';
  const B = dark ? 'rgba(255,255,255,0.09)' : 'rgba(219,234,254,0.5)';

  const count = Object.values(items).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;
  const pct   = (count / total) * 100;
  const all   = count === total;
  const barC  = pct===100?'#10b981':pct>=60?'#3b82f6':pct>=40?'#eab308':'#e2e8f0';

  const toggle = id => {
    const nI = { ...items, [id]: !items[id] };
    setItems(nI);
    const nc = Object.values(nI).filter(Boolean).length;
    if (nI[id]) {
      setEmotion('excited');
      setTimeout(() => setEmotion('happy'), 900);
      if (nc === total) { awardBadge('checklist-complete'); setEmotion('wave'); setTimeout(() => setEmotion('happy'),2200); }
    } else {
      setEmotion('sad');
      setTimeout(() => setEmotion('happy'), 800);
    }
  };

  return (
    <div style={{ padding:'20px 16px', maxWidth:560, margin:'0 auto' }}>
      <div className="su-anim" style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ fontSize:38, marginBottom:8 }}>✅</div>
        <h2 style={{ fontSize:22, fontWeight:900, color:T, marginBottom:5 }}>Security Checklist</h2>
        <p style={{ color:M, fontSize:13 }}>Build stronger digital habits, one step at a time</p>
      </div>

      {/* Progress card */}
      <div className="su-anim" style={{
        background:C, border:`1px solid ${B}`, borderRadius:20,
        padding:'17px 20px', marginBottom:14,
        boxShadow:'0 4px 14px rgba(59,130,246,0.06)', animationDelay:'0.1s',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
          <span style={{ fontWeight:900, color:T }}>{count}/{total} completed</span>
          <span style={{ fontWeight:900, color:barC }}>{Math.round(pct)}%</span>
        </div>
        <div style={{ height:12, background:dark?'#334155':'#e2e8f0', borderRadius:100, overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:100, background:barC,
            width:`${pct}%`, transition:'width 0.5s ease, background 0.5s ease',
          }} />
        </div>
        {all && (
          <div style={{
            marginTop:11, padding:'10px 14px',
            background:dark?'rgba(16,185,129,0.1)':'#f0fdf4',
            border:'1px solid rgba(16,185,129,0.3)', borderRadius:11,
            fontSize:12.5, fontWeight:800, color:'#059669', textAlign:'center',
          }}>🎉 All done! Your duck is doing a happy dance! 🦆✨</div>
        )}
      </div>

      {/* Items */}
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {CHECKLIST_ITEMS.map((item, i) => {
          const chk = items[item.id];
          return (
            <div key={item.id} className="su-anim cl-item" onClick={() => toggle(item.id)} style={{
              background: chk ? (dark?'rgba(16,185,129,0.07)':'#f0fdf4') : C,
              border: `1.5px solid ${chk ? 'rgba(16,185,129,0.38)' : B}`,
              borderRadius:17, padding:'15px 17px', cursor:'pointer',
              display:'flex', alignItems:'center', gap:13,
              boxShadow: chk ? '0 2px 10px rgba(16,185,129,0.1)' : '0 2px 6px rgba(59,130,246,0.04)',
              animationDelay:`${i*0.07}s`, transition:'all 0.25s ease',
            }}>
              {/* Tick box */}
              <div style={{
                width:27, height:27, borderRadius:8, flexShrink:0,
                background: chk ? '#10b981' : 'transparent',
                border: `2px solid ${chk ? '#10b981' : dark?'#475569':'#cbd5e1'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.25s ease', fontSize:15, color:'white', fontWeight:900,
              }}>{chk && '✓'}</div>
              <span style={{ fontSize:22, flexShrink:0 }}>{item.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{
                  fontWeight:800, fontSize:13.5,
                  color: chk ? '#059669' : T,
                  textDecoration: chk ? 'line-through' : 'none',
                  marginBottom:2, transition:'all 0.25s ease',
                }}>{item.title}</div>
                <div style={{ fontSize:12, color:M, lineHeight:1.4 }}>{item.desc}</div>
              </div>
              {chk && <span style={{ fontSize:14, flexShrink:0 }}>✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── CARDS ──────────────────────────────────────── */
function CardsSection({ dark }) {
  const [open, setOpen] = useState(null);
  const T = dark ? '#f1f5f9' : '#1e293b';
  const M = dark ? '#94a3b8' : '#64748b';
  const B = dark ? 'rgba(255,255,255,0.09)' : 'rgba(219,234,254,0.5)';

  return (
    <div style={{ padding:'20px 16px', maxWidth:560, margin:'0 auto' }}>
      <div className="su-anim" style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ fontSize:38, marginBottom:8 }}>📚</div>
        <h2 style={{ fontSize:22, fontWeight:900, color:T, marginBottom:5 }}>Security 101</h2>
        <p style={{ color:M, fontSize:13 }}>Tap any card to expand and learn more</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
        {EDU_CARDS.map((card, i) => {
          const isOpen = open === card.id;
          const cBg = dark ? '#1e293b' : card.bg;
          return (
            <div key={card.id} className="su-anim edu-card" onClick={() => setOpen(isOpen ? null : card.id)} style={{
              background: cBg,
              border: `1.5px solid ${isOpen ? card.accent+'55' : B}`,
              borderRadius:19, padding:'17px 19px', cursor:'pointer',
              boxShadow: isOpen ? `0 4px 20px ${card.accent}22` : '0 2px 7px rgba(59,130,246,0.05)',
              animationDelay:`${i*0.08}s`, transition:'all 0.3s ease',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:26 }}>{card.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                    <span style={{ fontWeight:900, fontSize:14, color:T }}>{card.title}</span>
                    <span style={{
                      fontSize:9.5, fontWeight:800, padding:'2px 8px', borderRadius:100,
                      background:`${card.accent}20`, color:card.accent, letterSpacing:0.5,
                    }}>{card.tag}</span>
                  </div>
                  <div style={{ fontSize:12.5, color:M }}>{card.short}</div>
                </div>
                <span style={{
                  fontSize:17, color:M, transition:'transform 0.3s ease',
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                }}>›</span>
              </div>
              {isOpen && (
                <div className="fi-anim" style={{
                  marginTop:12, paddingTop:12,
                  borderTop:`1px solid ${card.accent}28`,
                  fontSize:13, color:dark?'#cbd5e1':'#475569', lineHeight:1.72,
                }}>{card.detail}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── RESULTS ────────────────────────────────────── */
function ResultsSection({ score, profile, checkItems, quizResults, pwdScore, setSection, dark }) {
  const T = dark ? '#f1f5f9' : '#1e293b';
  const M = dark ? '#94a3b8' : '#64748b';
  const C = dark ? '#1e293b' : 'white';
  const B = dark ? 'rgba(255,255,255,0.09)' : 'rgba(219,234,254,0.5)';

  const cc = Object.values(checkItems).filter(Boolean).length;
  const qc = Object.values(quizResults).filter(Boolean).length;
  const sC = score >= 70 ? '#10b981' : score >= 50 ? '#3b82f6' : score >= 30 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 43;
  const offset = circ - (score/100) * circ;

  const strengths = [];
  const improve   = [];
  if (pwdScore >= 5) strengths.push('Strong password habits'); else improve.push('Strengthen your passwords');
  if (qc >= 2)       strengths.push('Good at spotting online scams'); else improve.push('Practice spotting phishing & scams');
  if (cc >= 4)       strengths.push('Security checklist nearly complete'); else improve.push(`Finish the checklist (${cc}/5 done)`);
  if (pwdScore >= 6) strengths.push('Excellent password complexity');
  if (qc === 3)      strengths.push('Perfect quiz score — scam detector!');
  if (cc === 5)      strengths.push('All 5 security habits active!');

  return (
    <div style={{ padding:'20px 16px', maxWidth:560, margin:'0 auto' }}>
      <div className="su-anim" style={{ textAlign:'center', marginBottom:18 }}>
        <div style={{ fontSize:36, marginBottom:6 }}>🏆</div>
        <h2 style={{ fontSize:22, fontWeight:900, color:T, marginBottom:4 }}>Your Security Report</h2>
        <p style={{ color:M, fontSize:13 }}>Based on your password, quiz & checklist activity</p>
      </div>

      {/* Score + profile */}
      <div className="su-anim" style={{
        background:C, border:`1.5px solid ${B}`, borderRadius:22,
        padding:22, marginBottom:12, textAlign:'center',
        boxShadow:'0 4px 18px rgba(59,130,246,0.08)', animationDelay:'0.1s',
      }}>
        <svg width="110" height="110" viewBox="0 0 110 110" style={{ marginBottom:14 }}>
          <circle cx="55" cy="55" r="43" fill="none" stroke={dark?'#334155':'#e2e8f0'} strokeWidth="9" />
          <circle cx="55" cy="55" r="43" fill="none" stroke={sC} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 55 55)"
            style={{ transition:'stroke-dashoffset 1.2s ease' }}
          />
          <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="900" fill={sC} fontFamily="Nunito,sans-serif">{score}</text>
          <text x="55" y="67" textAnchor="middle" fontSize="11" fill={dark?'#94a3b8':'#64748b'} fontFamily="Nunito,sans-serif">/ 100</text>
        </svg>

        <div style={{
          display:'inline-flex', alignItems:'center', gap:10,
          background:profile.bg, border:`2px solid ${profile.color}30`,
          borderRadius:100, padding:'9px 22px', marginBottom:10,
        }}>
          <span style={{ fontSize:22 }}>{profile.emoji}</span>
          <span style={{ fontSize:16, fontWeight:900, color:profile.color }}>{profile.name}</span>
        </div>
        <p style={{ color:M, fontSize:13.5, fontWeight:700 }}>{profile.tagline}</p>

        {/* Mini breakdown */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:16 }}>
          {[
            {label:'Password', val:`${pwdScore}/7`, color:'#3b82f6'},
            {label:'Quizzes',  val:`${qc}/3`,       color:'#8b5cf6'},
            {label:'Checklist',val:`${cc}/5`,        color:'#10b981'},
          ].map(x => (
            <div key={x.label} style={{
              background:dark?'rgba(255,255,255,0.04)':'#f8fafc',
              borderRadius:12, padding:'9px 6px',
              border:`1px solid ${B}`,
            }}>
              <div style={{ fontSize:15, fontWeight:900, color:x.color }}>{x.val}</div>
              <div style={{ fontSize:11, color:M, fontWeight:700, marginTop:2 }}>{x.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="su-anim" style={{
          background:dark?'rgba(16,185,129,0.07)':'#f0fdf4',
          border:'1.5px solid rgba(16,185,129,0.2)', borderRadius:19,
          padding:'15px 18px', marginBottom:11, animationDelay:'0.2s',
        }}>
          <div style={{ fontWeight:900, color:'#059669', marginBottom:9, fontSize:13.5 }}>💪 Your Strengths</div>
          {strengths.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5, fontSize:13, color:dark?'#86efac':'#166534' }}>
              <span>✅</span>{s}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {improve.length > 0 && (
        <div className="su-anim" style={{
          background:dark?'rgba(245,158,11,0.07)':'#fffbeb',
          border:'1.5px solid rgba(245,158,11,0.22)', borderRadius:19,
          padding:'15px 18px', marginBottom:14, animationDelay:'0.3s',
        }}>
          <div style={{ fontWeight:900, color:'#d97706', marginBottom:9, fontSize:13.5 }}>🎯 Areas to Work On</div>
          {improve.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5, fontSize:13, color:dark?'#fcd34d':'#92400e' }}>
              <span>⚠️</span>{s}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="su-anim" style={{ display:'flex', gap:10, animationDelay:'0.4s' }}>
        <button onClick={() => setSection('password')} style={{
          flex:1, background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'white',
          border:'none', borderRadius:13, padding:'12px',
          fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
        }}>🔒 Improve Password</button>
        <button onClick={() => setSection('checklist')} style={{
          flex:1, background:dark?'rgba(255,255,255,0.05)':'#f8fafc',
          border:`1.5px solid ${B}`, borderRadius:13, padding:'12px',
          fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', color:T,
        }}>✅ Finish Checklist</button>
      </div>
      <p style={{ marginTop:18, textAlign:'center', fontSize:12, color:M, fontWeight:700 }}>
        Your little duck is proud of you! 🦆✨
      </p>
    </div>
  );
}

/* ── BADGE SHELF ────────────────────────────────── */
function BadgeShelf({ badges, newBadge }) {
  return (
    <div style={{
      position:'absolute', top:58, right:8,
      display:'flex', gap:4, flexWrap:'wrap',
      maxWidth:108, justifyContent:'flex-end', zIndex:500,
      pointerEvents:'none',
    }}>
      {[...badges].map(id => (
        <div key={id} title={BADGE_DEFS[id]?.name} style={{
          fontSize:19, cursor:'default',
          filter: newBadge===id ? 'drop-shadow(0 0 6px gold)' : 'none',
        }}>{BADGE_DEFS[id]?.emoji}</div>
      ))}
    </div>
  );
}

/* ── APP ────────────────────────────────────────── */
export default function App() {
  const [section,  setSection]   = useState('home');
  const [dark,     setDark]      = useState(false);
  const [mousePos, setMouse]     = useState({ x:-100, y:-100 });
  const [emotion,  setEmotion]   = useState('happy');
  const [pwdScore, setPwdScore]  = useState(0);
  const [checkItems, setCheck]   = useState({ twofa:false, passwords:false, email:false, privacy:false, backup:false });
  const [quizRes,  setQuizRes]   = useState({});
  const [toast,    setToast]     = useState('');
  const [toastTid, setTid]       = useState(null);
  const [badges,   setBadges]    = useState(new Set());
  const [newBadge, setNewBadge]  = useState(null);

  const rootRef  = useRef(null);
  const konamiQ  = useRef([]);
  const KONAMI   = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  // Mouse tracking on container
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const h = e => {
      const r = root.getBoundingClientRect();
      setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    root.addEventListener('mousemove', h);
    return () => root.removeEventListener('mousemove', h);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = e => {
      konamiQ.current = [...konamiQ.current, e.key].slice(-10);
      if (konamiQ.current.join(',') === KONAMI.join(',')) {
        setDark(d => !d);
        flash('🎮 Konami Code! Dark mode unlocked!');
        award('konami');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDark(d => !d);
        flash('🌙 Dark mode toggled! (Ctrl+Shift+D)');
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // Golden duck
  useEffect(() => {
    const el = document.getElementById('golden-egg');
    if (!el) return;
    const h = () => {
      award('golden-duck');
      setEmotion('golden');
      flash('🦆✨ You found the rare Golden Duck! Badge earned!');
      setTimeout(() => setEmotion('happy'), 4000);
    };
    el.addEventListener('click', h);
    return () => el.removeEventListener('click', h);
  }, [section]);

  const flash = msg => {
    setToast(msg);
    if (toastTid) clearTimeout(toastTid);
    const t = setTimeout(() => setToast(''), 3200);
    setTid(t);
  };

  const award = id => {
    setBadges(prev => {
      if (prev.has(id)) return prev;
      const n = new Set(prev); n.add(id);
      setNewBadge(id);
      flash(`🏅 Badge earned: ${BADGE_DEFS[id]?.name}!`);
      setTimeout(() => setNewBadge(null), 3000);
      return n;
    });
  };

  // Security score
  const cc = Object.values(checkItems).filter(Boolean).length;
  const qc = Object.values(quizRes).filter(Boolean).length;
  const secScore = Math.round((cc/5)*35 + (qc/3)*35 + (pwdScore/7)*30);
  const profile  = getProfile(secScore);

  // Duck clamping
  const duckX = mousePos.x - 27;
  const duckY = mousePos.y - 56;

  return (
    <div ref={rootRef} style={{
      fontFamily:"'Nunito',sans-serif",
      height:'100vh', overflow:'hidden', position:'relative',
      background: dark ? '#0f172a' : '#f0f9ff',
      color: dark ? '#f1f5f9' : '#1e293b',
    }}>
      <style>{CSS}</style>

      <Nav section={section} setSection={setSection} dark={dark}
        toggleDark={() => { setDark(d => !d); flash('🌙 Dark mode toggled! (or try Ctrl+Shift+D)'); }} />

      <div style={{ height:'calc(100vh - 50px)', overflowY:'auto' }}>
        {section === 'home'      && <HomeSection      setSection={setSection} dark={dark} />}
        {section === 'password'  && <PasswordSection  onScore={setPwdScore} setEmotion={setEmotion} dark={dark} />}
        {section === 'quiz'      && <QuizSection      onResults={setQuizRes} setEmotion={setEmotion} dark={dark} awardBadge={award} />}
        {section === 'checklist' && <ChecklistSection items={checkItems} setItems={setCheck} setEmotion={setEmotion} dark={dark} awardBadge={award} />}
        {section === 'cards'     && <CardsSection     dark={dark} />}
        {section === 'results'   && <ResultsSection   score={secScore} profile={profile} checkItems={checkItems} quizResults={quizRes} pwdScore={pwdScore} setSection={setSection} dark={dark} />}
      </div>

      {/* Duck Mascot */}
      <div style={{
        position:'absolute', left:duckX, top:duckY,
        pointerEvents:'none', zIndex:9999,
        transition:'left 0.1s ease, top 0.1s ease',
      }}>
        <Duck emotion={emotion} />
      </div>

      {/* Badge shelf */}
      <BadgeShelf badges={badges} newBadge={newBadge} />

      {/* Toast */}
      {toast && <Toast msg={toast} />}

      {/* Hint */}
      <div style={{
        position:'absolute', bottom:5, left:'50%', transform:'translateX(-50%)',
        fontSize:10, color: dark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.15)',
        pointerEvents:'none', fontWeight:700, whiteSpace:'nowrap',
      }}>🦆 psst… ↑↑↓↓←→←→BA for a surprise</div>
    </div>
  );
}
