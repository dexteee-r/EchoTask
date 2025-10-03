import React, { useEffect, useRef, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, Task } from './db';
import { localRewrite, cloudRewrite } from './rewrite';
import { sttSupported, startLocalSTT, recordAndTranscribeCloud } from './stt';
import { useIOSInstallHint } from "./hooks/useInstallPrompt";
import { exportTasksAsJSON, importTasksFromJSON } from "./db";



export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all'|'active'|'done'>('all');
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState('');
  const [clean, setClean] = useState('');
  const [listening, setListening] = useState(false);
  const stopLocalRef = useRef<null | (()=>void)>(null);


  const { show, dismiss } = useIOSInstallHint();
  const nowIso = () => new Date().toISOString();

  // Cloud privacy
  const [allowCloud, setAllowCloud] = useState(() => localStorage.getItem("allowCloud")==="1");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");

  async function refresh() {
    setTasks(await listTasks(filter));
  }
  useEffect(() => { refresh(); }, [filter]);

  useEffect(()=>{ localStorage.setItem("allowCloud", allowCloud ? "1":"0"); },[allowCloud]);
  useEffect(()=>{ localStorage.setItem("apiKey", apiKey); },[apiKey]);

  async function add(raw: string, cleanText?: string | null) {
    const t: Task = {
      id: crypto.randomUUID(),
      rawText: raw,
      cleanText: cleanText ?? null,
      status: 'active',
      tags: [],
      due: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await createTask(t);
    setInput('');
    refresh();
  }

  // STT local (Web Speech) press-to-talk style
  function startLocal() {
    if (!sttSupported()) { alert('STT local non supporté sur ce navigateur.'); return; }
    setListening(true);
    stopLocalRef.current = startLocalSTT((t)=>{ setDraft(t); setClean(localRewrite(t)); }, ()=> setListening(false), 'fr-FR');
  }
  function stopLocal() {
    stopLocalRef.current?.();
    setListening(false);
  }

  // STT cloud (MediaRecorder + Whisper) — opt-in
  async function startCloud() {
    if (!allowCloud || !apiKey) { alert('Cloud désactivé'); return; }
    setListening(true);
    const rec = await recordAndTranscribeCloud(apiKey, 'fr');
    // l’utilisateur appuie à nouveau pour STOP :
    (window as any).__cloudStop = async () => {
      const text = await rec.stop();
      setDraft(text);
      setClean(localRewrite(text));
      setListening(false);
      (window as any).__cloudStop = null;
    };
  }
  function stopCloud() {
    if ((window as any).__cloudStop) (window as any).__cloudStop();
  }

  async function improve() {
    if (allowCloud && apiKey) {
      try { setClean(await cloudRewrite(draft, apiKey, 'fr', 'neutral')); }
      catch { alert('Réécriture cloud indisponible'); }
    } else {
      setClean(localRewrite(draft));
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <h1 style={{ margin:0 }}>EchoTask</h1>
        <div style={{ display:'flex', gap:8 }}>
          <select value={filter} onChange={e=>setFilter(e.target.value as any)}>
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="done">Faits</option>
          </select>
          <button onClick={()=>setAllowCloud(v=>!v)}>{allowCloud ? 'Cloud: ON' : 'Cloud: OFF'}</button>
        </div>
        <label style={{ display:'inline-block' }}>
          <input type="file" accept="application/json" style={{ display:'none' }}
                onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return;
                  const text = await f.text(); const n = await importTasksFromJSON(text); alert(`Import: ${n} tâches`);
                  await refresh();
                }}/>
          <span className="btn-like">Import</span>
        </label>
      </header>
      {show && (
          <div style={{background:'#1f3afe',color:'#fff',padding:12,borderRadius:8,marginTop:12}}>
            <b>Installer EchoTask</b> — Ouvre <i>Partager</i> → <i>Ajouter à l’écran d’accueil</i>.
            <button onClick={dismiss} style={{marginLeft:8,background:'#fff',border:'none',borderRadius:6,padding:'4px 8px'}}>OK</button>
          </div>
        )}

      {allowCloud && (
        <div style={{ marginTop:8 }}>
          <input placeholder="Clé API (stockée seulement dans ce navigateur)" value={apiKey} onChange={e=>setApiKey(e.target.value)} style={{ width:'100%', padding:8 }} />
          <small style={{ color:'#666' }}>Aucune donnée n’est envoyée tant que Cloud est OFF.</small>
        </div>
      )}
      {allowCloud && !apiKey && (
        <div style={{ color:'#b00020', marginTop:4 }}>⚠️ Clé API requise pour le mode Cloud.</div>
      )}

      <section style={{ marginTop:16, display:'grid', gap:8 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="Tape ta tâche…"
            style={{ flex:1, padding:12, border:'1px solid #ccc', borderRadius:8 }}
          />
          <button onClick={()=> input.trim() && add(input.trim(), null)}>Ajouter</button>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button
            onMouseDown={startLocal} onMouseUp={stopLocal} onTouchStart={startLocal} onTouchEnd={stopLocal}
            disabled={!sttSupported()}
            title={sttSupported() ? 'Maintenir pour parler (local)' : 'STT local non supporté'}
          >🎤 Local {listening && sttSupported() ? '●' : ''}</button>

          <button
            onMouseDown={startCloud} onMouseUp={stopCloud} onTouchStart={startCloud} onTouchEnd={stopCloud}
          >☁️ Cloud {listening && !sttSupported() ? '●' : ''}</button>
        </div>

        {draft && (
          <div style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
            <h3 style={{ marginTop:0 }}>Brouillon</h3>
            <label>RAW</label>
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={3} style={{ width:'100%' }} />
            <label>CLEAN</label>
            <textarea value={clean} onChange={e=>setClean(e.target.value)} rows={3} style={{ width:'100%' }} />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button onClick={improve}>Améliorer</button>
              <button onClick={()=>{ add(draft, clean || null); setDraft(''); setClean(''); }}>Sauver</button>
              <button onClick={()=>{ setDraft(''); setClean(''); }}>Annuler</button>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop:16 }}>
        {tasks.length === 0 && <p style={{ color:'#666' }}>Aucune tâche. Dites-la ou tapez-la ✨</p>}
        <ul style={{ listStyle:'none', padding:0 }}>
          {tasks.map(t => (
            <li key={t.id} style={{ borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button onClick={()=>toggleDone(t.id)} aria-label="toggle" title="Marquer fait/non fait">
                {t.status === 'done' ? '☑' : '☐'}
              </button>
              <div style={{ flex:1, margin:'0 8px' }}>
                <div style={{ fontWeight:600, textDecoration: t.status==='done'?'line-through':'none' }}>{t.rawText}</div>
                {t.cleanText && <div style={{ color:'#666' }}>{t.cleanText}</div>}
              </div>
              <button onClick={()=>removeTask(t.id)} aria-label="delete">🗑</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
