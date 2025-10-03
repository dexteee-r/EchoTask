import React, { useEffect, useRef, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, Task, safeId } from './db';
import { localRewrite, cloudRewrite } from './rewrite';
import { sttSupported, startLocalSTT, recordAndTranscribeCloud } from './stt';

// (optionnel) import { useIOSInstallHint } from "./hooks/useInstallPrompt";



export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all'|'active'|'done'>('all');
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState('');
  const [clean, setClean] = useState('');
  const [listeningLocal, setListeningLocal] = useState(false);
  const [listeningCloud, setListeningCloud] = useState(false);
  const stopLocalRef = useRef<null | (()=>void)>(null);
  const nowIso = () => new Date().toISOString();



  // Privacy / Cloud
  const [allowCloud, setAllowCloud] = useState(() => localStorage.getItem("allowCloud")==="1");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  useEffect(()=>{ localStorage.setItem("allowCloud", allowCloud ? "1":"0"); },[allowCloud]);
  useEffect(()=>{ localStorage.setItem("apiKey", apiKey); },[apiKey]);

  async function refresh() {
    const rows = await listTasks(filter);
    setTasks(rows);
  }
  useEffect(() => { refresh(); }, [filter]);

  async function add(raw: string, cleanText?: string | null) {
    const t: Task = {
      id: safeId(),
      rawText: raw,
      cleanText: cleanText ?? null,
      status: 'active',
      tags: [],
      due: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await createTask(t);
    await refresh();
  }


  // === STT local (Web Speech)
  function startLocal() {
    if (!sttSupported()) {
      alert('STT local non supporté par ce navigateur. Utilise Chrome/Edge ou le mode Cloud.');
      return;
    }
    setListeningLocal(true);
    stopLocalRef.current = startLocalSTT(
      (t)=>{ setDraft(t); setClean(localRewrite(t)); },
      ()=> setListeningLocal(false),
      'fr-FR'
    );
  }
  function stopLocal() {
    stopLocalRef.current?.();
    setListeningLocal(false);
  }

  // === STT cloud (Whisper) — opt-in
  let cloudStop: null | (()=>Promise<void>) = null as any;
  async function startCloud() {
    if (!allowCloud || !apiKey) { alert('Cloud désactivé. Active le switch Cloud et ajoute ta clé API.'); return; }
    try {
      setListeningCloud(true);
      const rec = await recordAndTranscribeCloud(apiKey, 'fr');
      cloudStop = async () => {
        const text = await rec.stop();
        setDraft(text);
        setClean(localRewrite(text));
        setListeningCloud(false);
        cloudStop = null;
      };
    } catch (e) {
      setListeningCloud(false);
      alert('Impossible de démarrer l’enregistrement (permissions ? HTTPS ?)');
    }
  }
  async function stopCloud() {
    if (cloudStop) await cloudStop();
  }

  async function onSaveDraft() {
    try {
      if (!draft.trim() && !clean.trim()) {
        alert('Rien à sauvegarder.');
        return;
      }
      await add(draft.trim(), clean.trim() ? clean.trim() : null);
      setDraft('');
      setClean('');
      await refresh(); // <-- garantit l’affichage instantané
      alert('Tâche enregistrée ✅');
    } catch (e:any) {
        console.error('SAVE_ERROR', e);
        alert('Échec de la sauvegarde. Détail console.');
      }
  }

  async function onImprove() {
    try {
      if (allowCloud && apiKey) {
        const out = await cloudRewrite(draft, apiKey, 'fr', 'neutral');
        setClean(out);
      } else {
        setClean(localRewrite(draft));
      }
    } catch (e) {
      alert('Réécriture indisponible.');
    }
  }

  async function onSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await add(input.trim(), null);
    setInput('');
  }

  const unsupportedSTT = !sttSupported();

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
          <button type="button" onClick={()=>setAllowCloud(v=>!v)}>
            {allowCloud ? 'Cloud: ON' : 'Cloud: OFF'}
          </button>
        </div>
      </header>

      {allowCloud && (
        <div style={{ marginTop:8 }}>
          <input
            placeholder="Clé API (stockée localement)"
            value={apiKey}
            onChange={e=>setApiKey(e.target.value)}
            style={{ width:'100%', padding:8, borderColor: !apiKey && allowCloud ? '#b00020':'#ccc', borderWidth:1, borderStyle:'solid', borderRadius:8 }}
          />
          {allowCloud && !apiKey && (
            <div style={{ color:'#b00020', marginTop:4 }}>⚠️ Clé API requise pour le mode Cloud.</div>
          )}
        </div>
      )}

      <section style={{ marginTop:16, display:'grid', gap:8 }}>
        <div style={{ display:'flex', gap:8 }}>
          <form onSubmit={onSubmitAdd} style={{ display:'flex', gap:8 }}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Tape ta tâche…"
              style={{ flex:1, padding:12, border:'1px solid #ccc', borderRadius:8 }}
            />
            <button type="submit">Ajouter</button>
          </form>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button
            type="button"
            onPointerDown={startLocal}
            onPointerUp={stopLocal}
            disabled={unsupportedSTT}
            title={unsupportedSTT ? 'STT local non supporté sur ce navigateur' : 'Maintenir pour parler (local)'}
          >
            🎤 Local {listeningLocal ? '●' : ''}
          </button>

          <button
            type="button"
            onPointerDown={startCloud}
            onPointerUp={stopCloud}
            title="Maintenir pour parler (Cloud)"
          >
            ☁️ Cloud {listeningCloud ? '●' : ''}
          </button>
        </div>

        {draft && (
          <div style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
            <h3 style={{ marginTop:0 }}>Brouillon</h3>
            <label>RAW</label>
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={3} style={{ width:'100%' }} />
            <label>CLEAN</label>
            <textarea value={clean} onChange={e=>setClean(e.target.value)} rows={3} style={{ width:'100%' }} />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button type="button" onClick={onImprove}>Améliorer</button>
              <button type="button" onClick={onSaveDraft}>Sauver</button>
              <button type="button" onClick={()=>{ setDraft(''); setClean(''); }}>Annuler</button>
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop:16 }}>
        {tasks.length === 0 && <p style={{ color:'#666' }}>Aucune tâche. Dites-la ou tapez-la ✨</p>}
        <ul style={{ listStyle:'none', padding:0 }}>
          {tasks.map(t => (
            <li key={t.id} style={{ borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button
                type="button"
                onClick={async ()=>{ await toggleDone(t.id); await refresh(); }}
                aria-label="toggle"
                title="Marquer fait/non fait"
              >
                {t.status === 'done' ? '☑' : '☐'}
              </button>

              <div style={{ flex:1, margin:'0 8px' }}>
                <div style={{ fontWeight:600, textDecoration: t.status==='done'?'line-through':'none' }}>{t.rawText}</div>
                {t.cleanText && <div style={{ color:'#666' }}>{t.cleanText}</div>}
              </div>

              <button
                type="button"
                onClick={async ()=>{ await removeTask(t.id); await refresh(); }}
                aria-label="delete"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
