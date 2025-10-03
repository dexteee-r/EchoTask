import React, { useEffect, useRef, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, Task, safeId } from './db';
import { localRewrite, cloudRewrite } from './rewrite';
import { sttSupported, startLocalSTT, recordAndTranscribeCloud } from './stt';
import { ToastHost, toast } from './ui/Toast';

const nowIso = () => new Date().toISOString();
const parseTags = (s: string) =>
  s.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all'|'active'|'done'>('all');

  // recherche & filtres
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState(''); // virgules
  const activeFilterTags = () => parseTags(tagFilter);

  // ajout simple
  const [input, setInput] = useState('');
  const [inputTags, setInputTags] = useState(''); // virgules

  // brouillon STT
  const [draft, setDraft] = useState('');
  const [clean, setClean] = useState('');
  const [draftTags, setDraftTags] = useState(''); // virgules

  // écoute
  const [listeningLocal, setListeningLocal] = useState(false);
  const [listeningCloud, setListeningCloud] = useState(false);
  const stopLocalRef = useRef<null | (()=>void)>(null);

  // Privacy / Cloud
  const [allowCloud, setAllowCloud] = useState(() => localStorage.getItem("allowCloud")==="1");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  useEffect(()=>{ localStorage.setItem("allowCloud", allowCloud ? "1":"0"); },[allowCloud]);
  useEffect(()=>{ localStorage.setItem("apiKey", apiKey); },[apiKey]);

  async function baseList() {
    return await listTasks(filter);
  }

  async function refresh() {
    // récupère puis filtre côté client (texte + tags)
    const rows = await baseList();
    const q = search.trim().toLowerCase();
    const tags = activeFilterTags();
    const filtered = rows.filter(t => {
      const matchText = !q || (t.rawText?.toLowerCase().includes(q) || (t.cleanText||'').toLowerCase().includes(q));
      const matchTags = tags.length === 0 || tags.every(tag => (t.tags||[]).map(s=>s.toLowerCase()).includes(tag));
      return matchText && matchTags;
    });
    setTasks(filtered);
  }
  useEffect(() => { refresh(); }, [filter, search, tagFilter]);

  async function add(raw: string, cleanText?: string | null, tagsStr?: string) {
    const t: Task = {
      id: safeId(),
      rawText: raw,
      cleanText: cleanText ?? null,
      status: 'active',
      tags: parseTags(tagsStr || ''),
      due: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await createTask(t);
    await refresh();
  }

  // === STT local (Web Speech)
  function startLocal() {
    if (!sttSupported()) {
      toast('STT local non supporté ici. Utilise Chrome/Edge ou le Cloud.', { type:'info' });
      return;
    }
    setListeningLocal(true);
    stopLocalRef.current = startLocalSTT(
      (t)=>{ setDraft(t); setClean(localRewrite(t)); },
      ()=> setListeningLocal(false),
      'fr-FR'
    );
  }
  function stopLocal() { stopLocalRef.current?.(); setListeningLocal(false); }

  // === STT cloud (Whisper) — opt-in
  let cloudStop: null | (()=>Promise<void>) = null as any;
  async function startCloud() {
    if (!allowCloud || !apiKey) { toast('Cloud OFF ou clé API manquante.', { type:'error' }); return; }
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
      toast('Impossible de démarrer l’enregistrement (HTTPS/permissions ?)', { type:'error' });
      console.error(e);
    }
  }
  async function stopCloud() { if (cloudStop) await cloudStop(); }

  // === Ajout via ENTER
  async function onSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await add(input.trim(), null, inputTags);
    setInput(''); setInputTags('');
    toast('Tâche ajoutée', { type:'success' });
  }

  async function onSaveDraft() {
    try {
      if (!draft.trim() && !clean.trim()) { toast('Rien à sauvegarder', { type:'info' }); return; }
      await add(draft.trim(), clean.trim() ? clean.trim() : null, draftTags);
      setDraft(''); setClean(''); setDraftTags('');
      await refresh();
      toast('Tâche enregistrée ✅', { type:'success' });
    } catch (e) {
      console.error(e);
      toast('Échec de la sauvegarde', { type:'error' });
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
    } catch {
      toast('Réécriture indisponible', { type:'error' });
    }
  }

  const unsupportedSTT = !sttSupported();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      {/* TOAST HOST */}
      <ToastHost />

      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <h1 style={{ margin:0 }}>EchoTask</h1>
        <div className="input-row">
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="badge">
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="done">Faits</option>
          </select>
          <button type="button" onClick={()=>setAllowCloud(v=>!v)} className="badge">
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

      {/* Barre recherche + filtre tags */}
      <div style={{ marginTop:12, display:'grid', gap:8 }}>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Rechercher (titre/clean)…"
          style={{ padding:12, border:'1px solid #ccc', borderRadius:8 }}
        />
        <input
          value={tagFilter}
          onChange={e=>setTagFilter(e.target.value)}
          placeholder="Filtrer par tags (séparés par des virgules)"
          style={{ padding:12, border:'1px solid #ccc', borderRadius:8 }}
        />
      </div>

      {/* Ajout rapide (ENTER) + tags */}
      <section style={{ marginTop:16, display:'grid', gap:8 }}>
        <form onSubmit={onSubmitAdd} className="input-row">
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="Tape ta tâche…"
            style={{ flex:1, padding:12, border:'1px solid #ccc', borderRadius:8 }}
          />
          <button type="submit">Ajouter</button>
        </form>
        <input
          value={inputTags}
          onChange={e=>setInputTags(e.target.value)}
          placeholder="Tags de la tâche (ex: école, appel)"
          style={{ padding:10, border:'1px solid #ddd', borderRadius:8 }}
        />

        <div className="input-row">
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
            <input
              value={draftTags}
              onChange={e=>setDraftTags(e.target.value)}
              placeholder="Tags du brouillon (virgules)"
              style={{ marginTop:8, padding:10, border:'1px solid #ddd', borderRadius:8 }}
            />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button type="button" onClick={onImprove}>Améliorer</button>
              <button type="button" onClick={onSaveDraft}>Sauver</button>
              <button type="button" onClick={()=>{ setDraft(''); setClean(''); setDraftTags(''); }}>Annuler</button>
            </div>
          </div>
        )}
      </section>

      {/* Liste */}
      <section style={{ marginTop:16 }}>
        {tasks.length === 0 && <p style={{ color:'#666' }}>Aucune tâche. Dites-la ou tapez-la ✨</p>}
        <ul style={{ listStyle:'none', padding:0 }}>
          {tasks.map(t => (
            <li key={t.id} style={{ borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button
                type="button"
                onClick={async ()=>{ await toggleDone(t.id); await refresh(); }}
                aria-label="toggle" title="Marquer fait/non fait"
              >
                {t.status === 'done' ? '☑' : '☐'}
              </button>

              <div style={{ flex:1, margin:'0 8px' }}>
                <div style={{ fontWeight:600, textDecoration: t.status==='done'?'line-through':'none' }}>{t.rawText}</div>
                {t.cleanText && <div style={{ color:'#666' }}>{t.cleanText}</div>}
                {t.tags && t.tags.length>0 && (
                  <div className="chips">
                    {t.tags.map(tag => <span className="chip" key={tag}>#{tag}</span>)}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={async ()=>{ await removeTask(t.id); await refresh(); toast('Tâche supprimée', { type:'info' }); }}
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
