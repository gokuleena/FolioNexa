"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, CircleUserRound, Download, Eye, Globe2, ImagePlus, LayoutTemplate, LogIn, Plus, Save, Sparkles, Trash2, Upload, WandSparkles } from "lucide-react";
import { countries } from "@/lib/countries";
import { loadProfile, saveProfile } from "@/lib/storage";
import { Profile, Project, starterProfile } from "@/lib/types";

const templates = [
  { id: "atelier", name: "The Atelier", tag: "Editorial / Art-led", desc: "Large typography, generous space and an image-first rhythm." },
  { id: "grid", name: "Modernist Grid", tag: "Swiss / Structured", desc: "A precise modular system for design and product work." },
  { id: "folio", name: "The Folio", tag: "Classic / Professional", desc: "A refined, highly legible portfolio for every discipline." },
  { id: "archive", name: "Open Archive", tag: "Experimental / Culture", desc: "Expressive, asymmetrical and built for visual storytellers." },
  { id: "minimal", name: "Quiet Practice", tag: "Minimal / Research", desc: "Understated presentation for educators, researchers and writers." },
  { id: "bold", name: "Signal", tag: "Bold / Contemporary", desc: "High-contrast layouts for confident creative identities." }
];
const blankProject = (): Project => ({ id: crypto.randomUUID(), title: "New project", category: "Selected work", description: "Describe the challenge, your role and the outcome.", year: String(new Date().getFullYear()), image: "" });

export default function FolioStudio() {
  const [profile, setProfile] = useState<Profile>(starterProfile);
  const [tab, setTab] = useState("overview");
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("Local workspace is ready. Connect Supabase for secure accounts and cloud sync.");
  const [showPreview, setShowPreview] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [search, setSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessage, setAiMessage] = useState("Tell the studio what you want to improve. The built-in writing assistant works locally; connect an AI endpoint for generative suggestions.");
  useEffect(() => {
    let alive = true;
    setProfile(loadProfile());
    (async () => {
      const { supabase } = await import("@/lib/supabase");
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user && alive) {
          setUserId(data.session.user.id);
          const { data: row } = await supabase.from("profiles").select("data").eq("id", data.session.user.id).maybeSingle();
          if (row?.data && alive) setProfile({ ...starterProfile, ...row.data });
        }
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (alive) setUserId(session?.user?.id);
        });
        return () => listener.subscription.unsubscribe();
      }
    })().finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);
  const template = templates.find(t => t.id === profile.template) || templates[0];
  const completion = useMemo(() => {
    const checks = [!!profile.name, !!profile.role, !!profile.bio, !!profile.country, profile.skills.length > 0, profile.projects.length > 0, !!profile.email];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [profile]);
  const update = (key: keyof Profile, value: any) => setProfile(p => ({ ...p, [key]: value }));
  const updateProject = (id: string, key: keyof Project, value: string) => update("projects", profile.projects.map(p => p.id === id ? { ...p, [key]: value } : p));
  async function persist() {
    try { await saveProfile(profile, userId); setSaved(true); setTimeout(() => setSaved(false), 2200); }
    catch { setSaved(false); alert("Could not sync to cloud. Your local changes remain saved."); }
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${profile.slug || "portfolio"}-folionexa.json`; a.click(); URL.revokeObjectURL(a.href);
  }
  function exportHTML() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${profile.name} — Portfolio</title><style>body{font:16px/1.6 Arial,sans-serif;max-width:1080px;margin:5vw auto;padding:0 24px;color:#171916}h1{font-size:clamp(48px,9vw,110px);line-height:.95;letter-spacing:-.07em}h2{font-size:32px}.muted{color:#73776e}.projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px}.projects img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#eee}.pill{display:inline-block;border:1px solid #ddd;border-radius:30px;padding:5px 12px;margin:4px}</style></head><body><p class="muted">${profile.location} · ${profile.country}</p><h1>${profile.name}</h1><h2>${profile.role}</h2><p>${profile.bio}</p><p>${profile.skills.map(s=>`<span class="pill">${s}</span>`).join("")}</p><h2>Selected work</h2><div class="projects">${profile.projects.map(p=>`<article>${p.image?`<img src="${p.image}">`:""}<h2>${p.title}</h2><p class="muted">${p.category} · ${p.year}</p><p>${p.description}</p></article>`).join("")}</div><p>Contact: ${profile.email} · ${profile.website}</p></body></html>`;
    const blob = new Blob([html], { type: "text/html" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${profile.slug || "portfolio"}.html`; a.click(); URL.revokeObjectURL(a.href);
  }
  function localImprove() {
    const p = aiPrompt.toLowerCase();
    if (!aiPrompt.trim()) return;
    if (p.includes("bio") || p.includes("about")) {
      update("bio", `I am ${profile.role.toLowerCase()} working across ${profile.skills.slice(0,3).join(", ").toLowerCase()}. I bring curiosity, clarity and craft to every project, connecting thoughtful ideas with meaningful outcomes.`);
      setAiMessage("Drafted a concise, first-person bio using your role and skills. Edit it to keep your own voice.");
    } else if (p.includes("title") || p.includes("headline")) {
      update("role", profile.role || "Independent Creative Professional");
      setAiMessage("Your headline is ready for refinement. Lead with your discipline, then add the value you bring.");
    } else {
      setAiMessage("A useful portfolio improvement: make each project explain the brief, your specific contribution, the process and the result. Replace generic claims with evidence, decisions and outcomes.");
    }
  }
  async function signIn() {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) { setAuthMessage("Demo mode: configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable secure email accounts."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthMessage(error.message);
    else {
      const { data } = await supabase.auth.getUser();
      if (data.user) { setUserId(data.user.id); await saveProfile(profile, data.user.id); }
      setAuthMessage("Signed in. Your profile is now linked to your cloud account.");
    }
  }
  async function signUp() {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) { setAuthMessage("Demo mode: add your Supabase project credentials to enable account registration."); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthMessage(error.message);
    else setAuthMessage("Account created. Check your email to verify your address. After verification, sign in to sync your profile.");
  }

  if (!loaded) return <div className="loading">Preparing your studio…</div>;
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark">f.</span><span>folio<span className="brand-light">nexa</span></span></a>
      <div className="workspace-label">WORKSPACE <span>01</span></div>
      <nav>
        {[["overview","Overview"],["profile","Your identity"],["projects","Selected work"],["design","Design studio"],["publish","Publish & export"]].map(([id,label])=><button key={id} className={`nav-item ${tab===id?"active":""}`} onClick={()=>setTab(id)}><span className="nav-dot"/>{label}{id==="publish"&&<ArrowUpRight size={14}/>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-mini"><div className="avatar">{profile.name.slice(0,1)}</div><div><b>{profile.name}</b><small>Personal workspace</small></div><ChevronDown size={15}/></div>
        <button className="signin-side" onClick={()=>setAuthOpen(true)}><CircleUserRound size={16}/> Sign in / Create account</button>
        <div className="side-note">A more considered way to be seen.<br/><span>FolioNexa · Studio 1.0</span></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>{({overview:"Overview",profile:"Your identity",projects:"Selected work",design:"Design studio",publish:"Publish & export"} as any)[tab]}</b></div><div className="top-actions"><span className="save-status">{saved?<><Check size={14}/> Saved</>:"Autosave is local"}</span><button className="button ghost small" onClick={()=>setShowPreview(true)}><Eye size={15}/> Preview</button><button className="button dark small" onClick={persist}><Save size={15}/> Save changes</button></div></header>
      <div className="content">
        {tab==="overview"&&<><div className="eyebrow">YOUR CREATIVE PRESENCE, REIMAGINED</div><div className="hero-row"><div><h1>Make your work<br/><i>mean something.</i></h1><p className="intro">A portfolio should feel like you. Shape your story, curate your work and build a presence that travels with you.</p></div><div className="completion-card"><div className="completion-top"><span>PROFILE STRENGTH</span><b>{completion}%</b></div><div className="progress"><span style={{width:`${completion}%`}}/></div><small>{completion>=85?"Looking considered. Keep refining.":"A few thoughtful details will make your profile stronger."}</small><button onClick={()=>setTab("profile")}>Complete your identity <ArrowUpRight size={14}/></button></div></div>
          <div className="section-head"><div><div className="eyebrow">THE WORKSPACE</div><h2>Build your presence</h2></div><span className="muted">A clear path from profile to published portfolio.</span></div>
          <div className="feature-grid"><button className="feature-card" onClick={()=>setTab("profile")}><span className="feature-number">01 / IDENTITY</span><CircleUserRound/><h3>Tell your story</h3><p>Bring together your practice, experience, skills and point of view.</p><span className="card-link">Edit profile <ArrowUpRight size={14}/></span></button><button className="feature-card" onClick={()=>setTab("projects")}><span className="feature-number">02 / WORK</span><ImagePlus/><h3>Curate your work</h3><p>Present selected projects with context, craft and a clear role.</p><span className="card-link">Manage projects <ArrowUpRight size={14}/></span></button><button className="feature-card" onClick={()=>setTab("design")}><span className="feature-number">03 / DESIGN</span><LayoutTemplate/><h3>Find your visual voice</h3><p>Choose a design language and adapt it to your country and audience.</p><span className="card-link">Explore designs <ArrowUpRight size={14}/></span></button><button className="feature-card" onClick={()=>setTab("publish")}><span className="feature-number">04 / SHARE</span><Globe2/><h3>Take it into the world</h3><p>Preview your portfolio and export a portable, independent version.</p><span className="card-link">Publish & export <ArrowUpRight size={14}/></span></button></div>
          <div className="bottom-banner"><div><span className="eyebrow">A LITTLE INTELLIGENCE, A LOT OF YOU</span><h2>Good work deserves<br/>a better introduction.</h2></div><div className="banner-right"><p>Use the writing companion to sharpen your story without losing your voice.</p><button className="button dark" onClick={()=>{setTab("profile");setAiPrompt("Improve my bio");}}>Refine my story <WandSparkles size={16}/></button></div></div>
        </>}
        {tab==="profile"&&<><div className="eyebrow">01 / IDENTITY</div><h1 className="page-title">Your story, <i>in your words.</i></h1><p className="intro narrow">Start with the essentials. The strongest portfolios are specific, human and easy to understand.</p><div className="editor-layout"><section className="panel"><div className="panel-head"><h2>Profile details</h2><span>01—07</span></div><label>Full name<input value={profile.name} onChange={e=>update("name",e.target.value)} placeholder="Your name"/></label><label>Professional headline<input value={profile.role} onChange={e=>update("role",e.target.value)} placeholder="e.g. Visual designer & educator"/></label><label>About you <span className="field-hint">First person works best</span><textarea rows={5} value={profile.bio} onChange={e=>update("bio",e.target.value)} placeholder="What do you make? What do you believe in?"/></label><div className="two-fields"><label>Email<input type="email" value={profile.email} onChange={e=>update("email",e.target.value)}/></label><label>Website<input value={profile.website} onChange={e=>update("website",e.target.value)}/></label></div><div className="two-fields"><label>Location<input value={profile.location} onChange={e=>update("location",e.target.value)}/></label><label>Country / design context<select value={profile.country} onChange={e=>update("country",e.target.value)}>{countries.map(c=><option key={c}>{c}</option>)}</select></label></div><label>Public portfolio address<div className="slug-field"><span>folionexa.com/</span><input value={profile.slug} onChange={e=>update("slug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))}/></div></label><div className="panel-head skills-head"><h2>Practice & skills</h2><span>ADD WHAT YOU DO</span></div><div className="skill-list">{profile.skills.map(s=><span className="skill" key={s}>{s}<button onClick={()=>update("skills",profile.skills.filter(x=>x!==s))}>×</button></span>)}</div><div className="add-skill"><input value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder="Add a skill or discipline" onKeyDown={e=>{if(e.key==="Enter"&&newSkill.trim()){update("skills",[...profile.skills,newSkill.trim()]);setNewSkill("");}}}/><button className="button dark small" onClick={()=>{if(newSkill.trim()){update("skills",[...profile.skills,newSkill.trim()]);setNewSkill("");}}}><Plus size={14}/> Add</button></div></section><aside className="assistant-panel"><div className="assistant-icon"><Sparkles/></div><div className="eyebrow">FOLIONEXA COMPANION</div><h3>Clarity over clichés.</h3><p>Get a nudge when your story needs focus. Your voice stays yours.</p><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="e.g. Help me write a concise bio for a design educator…"/><button className="button dark full" onClick={localImprove}>Suggest an improvement <WandSparkles size={15}/></button><div className="assistant-response">{aiMessage}</div><div className="tip"><b>Writing note</b><p>Replace “passionate about design” with the kind of problems you solve and the people you work with.</p></div></aside></div></>}
        {tab==="projects"&&<><div className="eyebrow">02 / SELECTED WORK</div><div className="title-actions"><div><h1 className="page-title">Show the <i>thinking.</i></h1><p className="intro narrow">A project is more than an image. Give each piece enough context to reveal your contribution.</p></div><button className="button dark" onClick={()=>update("projects",[...profile.projects,blankProject()])}><Plus size={16}/> Add project</button></div><div className="project-editor-list">{profile.projects.map((p,i)=><div className="project-edit" key={p.id}><div className="project-index">0{i+1}</div><div className="project-fields"><div className="two-fields"><label>Project title<input value={p.title} onChange={e=>updateProject(p.id,"title",e.target.value)}/></label><label>Discipline / category<input value={p.category} onChange={e=>updateProject(p.id,"category",e.target.value)}/></label></div><label>Project story<textarea rows={3} value={p.description} onChange={e=>updateProject(p.id,"description",e.target.value)}/></label><div className="two-fields"><label>Year<input value={p.year} onChange={e=>updateProject(p.id,"year",e.target.value)}/></label><label>Image URL<input value={p.image} onChange={e=>updateProject(p.id,"image",e.target.value)} placeholder="https://…"/></label></div></div><button className="icon-button delete" title="Remove project" onClick={()=>update("projects",profile.projects.filter(x=>x.id!==p.id))}><Trash2 size={17}/></button></div>)}</div></>}
        {tab==="design"&&<><div className="eyebrow">03 / DESIGN STUDIO</div><h1 className="page-title">A visual language <i>of your own.</i></h1><p className="intro narrow">Six distinct starting points. Your country selection informs the context; your work and audience should make the final decisions.</p><div className="country-design"><div><Globe2/><div><b>Design context</b><small>Country-aware starting point, not a rigid stereotype.</small></div></div><select value={profile.country} onChange={e=>update("country",e.target.value)}>{countries.map(c=><option key={c}>{c}</option>)}</select></div><div className="template-grid">{templates.map((t,i)=><button key={t.id} onClick={()=>update("template",t.id)} className={`template-card ${profile.template===t.id?"selected":""}`}><div className={`template-art art-${t.id}`}><div className="art-top"><span>F / N</span><span>PORTFOLIO — 2026</span></div><div className="art-lines"><i/><i/><i/></div><div className="art-blocks"><i/><i/><i/></div><div className="art-bottom"><b>{profile.name||"Your name"}</b><span>{profile.role||"Creative practice"}</span></div></div><div className="template-info"><div><b>{t.name}</b><small>{t.tag}</small></div>{profile.template===t.id?<span className="selected-mark"><Check size={14}/></span>:<span className="choose-mark">Select ↗</span>}</div><p>{t.desc}</p></button>)}</div><div className="accent-row"><div><b>Signature accent</b><small>One considered detail to make the system yours.</small></div><input type="color" value={profile.accent} onChange={e=>update("accent",e.target.value)}/><code>{profile.accent}</code></div></>}
        {tab==="publish"&&<><div className="eyebrow">04 / PUBLISH & EXPORT</div><h1 className="page-title">Ready to be <i>discovered.</i></h1><p className="intro narrow">Your portfolio belongs to you. Preview it, export a portable version and publish when hosting is connected.</p><div className="publish-layout"><div className="publish-card"><div className="publish-preview"><span>F / N</span><div><small>{profile.location} · {profile.country}</small><h2>{profile.name}</h2><p>{profile.role}</p></div><span className="preview-count">0{profile.projects.length} PROJECTS</span></div><div className="publish-meta"><div><b>Portfolio preview</b><small>Current design · {template.name}</small></div><button className="button dark small" onClick={()=>setShowPreview(true)}><Eye size={15}/> Open preview</button></div></div><div className="export-card"><div className="eyebrow">TAKE YOUR WORK WITH YOU</div><h3>Portable by design.</h3><p>Download an editable data backup or a self-contained HTML page you can host on your own domain.</p><button className="export-option" onClick={exportHTML}><span className="export-icon">HTML</span><span><b>Standalone website</b><small>One HTML file · host anywhere</small></span><Download/></button><button className="export-option" onClick={exportJSON}><span className="export-icon">{ }</span><span><b>Profile data backup</b><small>JSON · keep a copy of your work</small></span><Download/></button></div></div><div className="publish-note"><Globe2/><div><b>Custom public links and cloud publishing</b><p>Connect Supabase and deploy this project to Vercel to enable verified accounts, cross-device sync and public portfolio publishing. Setup instructions and database schema are included with this project.</p></div></div></>}
      </div>
      <footer className="footer"><span>FOLIONEXA® — YOUR IDENTITY. YOUR WORK. YOUR WORLD.</span><span>Made for people who make things.</span></footer>
    </main>
    {authOpen&&<div className="modal-backdrop" onClick={()=>setAuthOpen(false)}><div className="auth-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAuthOpen(false)}>×</button><div className="brand"><span className="brand-mark">f.</span><span>folio<span className="brand-light">nexa</span></span></div><div className="eyebrow">YOUR WORKSPACE, YOURS</div><h2>Welcome to your<br/><i>next chapter.</i></h2><p>Create an account or sign in to continue. Secure cloud accounts activate when Supabase is configured.</p><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><div className="auth-buttons"><button className="button dark" onClick={signIn}><LogIn size={15}/> Sign in</button><button className="button light" onClick={signUp}>Create account</button></div><small className="auth-message">{authMessage}</small></div></div>}
    {showPreview&&<div className="preview-overlay"><div className="preview-toolbar"><span><Eye size={16}/> Live portfolio preview</span><button className="button dark small" onClick={()=>setShowPreview(false)}>Close preview ×</button></div><div className={`portfolio-preview theme-${profile.template}`} style={{"--accent":profile.accent} as React.CSSProperties}><div className="preview-nav"><b>{profile.name}</b><span>{profile.location} · {profile.country}</span><span>SELECTED WORK　 ABOUT　 CONTACT</span></div><section className="preview-hero"><span className="eyebrow">INDEPENDENT CREATIVE PRACTICE / 2026</span><h1>{profile.name}<br/><i>{profile.role}</i></h1><p>{profile.bio}</p><div className="preview-skills">{profile.skills.map(s=><span key={s}>{s}</span>)}</div></section><section className="preview-work"><div className="eyebrow">A SELECTION OF RECENT WORK</div><div className="preview-projects">{profile.projects.map(p=><article key={p.id}>{p.image?<img src={p.image} alt={p.title}/>:<div className="image-placeholder">IMAGE / PROJECT</div>}<div className="project-caption"><div><b>{p.title}</b><small>{p.category}</small></div><span>{p.year} ↗</span></div><p>{p.description}</p></article>)}</div></section><footer className="preview-footer"><h2>Have a good idea?</h2><a href={`mailto:${profile.email}`}>{profile.email} ↗</a><span>© {new Date().getFullYear()} {profile.name}</span></footer></div></div>}
  </div>;
}