import React, { useEffect, useRef, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, Task, safeId } from './db';
import { localRewrite, cloudRewrite } from './rewrite';
import { sttSupported, startLocalSTT, recordAndTranscribeCloud } from './stt';
import { ToastHost, toast } from './ui/Toast';
import { useI18n, LANG_META } from './i18n';
import LanguageSwitch from './ui/LanguageSwitch';

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

  // Cloud (persisté)
  const [allowCloud, setAllowCloud] = useState(() => localStorage.getItem("allowCloud")==="1");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  useEffect(()=>{ localStorage.setItem("allowCloud", allowCloud ? "1":"0"); },[allowCloud]);
  useEffect(()=>{ localStorage.setItem("apiKey", apiKey); },[apiKey]);

  // i18n
  const { t, lang } = useI18n();
  const meta = LANG_META[lang]; // { stt: 'fr-FR'|'en-US'|'ar-SA', whisper: 'fr'|'en'|'ar', dir }

  async function baseList() {
    return await listTasks(filter);
  }

  async function refresh() {
    const rows = await baseList();
    const q = search.trim().toLowerCase();
    const tags = activeFilterTags();
    const filtered = rows.filter(tk => {
      const matchText =
        !q ||
        tk.rawText?.toLowerCase().includes(q) ||
        (tk.cleanText || '').toLowerCase().includes(q);
      const matchTags =
        tags.length === 0 ||
        tags.every(tag => (tk.tags || []).map(s=>s.toLowerCase()).includes(tag));
      return matchText && matchTags;
    });
    setTasks(filtered);
  }
  useEffect(() => { refresh(); }, [filter, search, tagFilter]);

  async function add(raw: string, cleanText?: string | null, tagsStr?: string) {
    const tsk: Task = {
      id: safeId(),
      rawText: raw,
      cleanText: cleanText ?? null,
      status: 'active',
      tags: parseTags(tagsStr || ''),
      due: null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await createTask(tsk);
    await refresh();
  }

  // === STT local (Web Speech)
  function startLocal() {
    if (!sttSupported()) {
      toast(t("toast.sttUnsupported"), { type:'info' });
      return;
    }
    setListeningLocal(true);
    stopLocalRef.current = startLocalSTT(
      (tx)=>{ setDraft(tx); setClean(localRewrite(tx)); },
      ()=> setListeningLocal(false),
      meta.stt // fr-FR / en-US / ar-SA
    );
  }
  function stopLocal() { stopLocalRef.current?.(); setListeningLocal(false); }

  // === STT cloud (Whisper) — opt-in
  let cloudStop: null | (()=>Promise<void>) = null as any;
  async function startCloud() {
    if (!allowCloud || !apiKey) { toast(t("toast.recStartError"), { type:'error' }); return; }
    try {
      setListeningCloud(true);
      const rec = await recordAndTranscribeCloud(apiKey, meta.whisper); // fr/en/ar
      cloudStop = async () => {
        const text = await rec.stop();
        setDraft(text);
        setClean(localRewrite(text));
        setListeningCloud(false);
        cloudStop = null;
      };
    } catch (e) {
      setListeningCloud(false);
      toast(t("toast.recStartError"), { type:'error' });
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
    toast(t("toast.added"), { type:'success' });
  }

  async function onSaveDraft() {
    try {
      if (!draft.trim() && !clean.trim()) { toast(t("toast.nothingToSave"), { type:'info' }); return; }
      await add(draft.trim(), clean.trim() ? clean.trim() : null, draftTags);
      setDraft(''); setClean(''); setDraftTags('');
      await refresh();
      toast(t("toast.saved"), { type:'success' });
    } catch (e) {
      console.error(e);
      toast(t("toast.rewriteError"), { type:'error' });
    }
  }

  async function onImprove() {
    try {
      if (allowCloud && apiKey) {
        const out = await cloudRewrite(draft, apiKey, lang, 'neutral');
        setClean(out);
      } else {
        setClean(localRewrite(draft));
      }
    } catch {
      toast(t("toast.rewriteError"), { type:'error' });
    }
  }

  const unsupportedSTT = !sttSupported();

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      {/* TOAST HOST */}
      <ToastHost />

      {/* Header */}
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <h1 style={{ margin:0 }}>{t("app.title")}</h1>

        <div className="input-row">
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="badge">
            <option value="all">{t("filter.all")}</option>
            <option value="active">{t("filter.active")}</option>
            <option value="done">{t("filter.done")}</option>
          </select>

          <button type="button" onClick={()=>setAllowCloud(v=>!v)} className="badge">
            {allowCloud ? t("cloud.on") : t("cloud.off")}
          </button>

          <LanguageSwitch />
        </div>
      </header>

      {/* Clé API (si Cloud visible) */}
      {allowCloud && (
        <div style={{ marginTop:8 }}>
          <input
            placeholder={t("api.key.placeholder")}
            value={apiKey}
            onChange={e=>setApiKey(e.target.value)}
            style={{ width:'100%', padding:8, borderColor: !apiKey && allowCloud ? '#b00020':'#ccc', borderWidth:1, borderStyle:'solid', borderRadius:8 }}
          />
          {allowCloud && !apiKey && (
            <div style={{ color:'#b00020', marginTop:4 }}>⚠️ {t("api.key.placeholder")}</div>
          )}
        </div>
      )}

      {/* Barre recherche + filtre tags */}
      <div style={{ marginTop:12, display:'grid', gap:8 }}>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          style={{ padding:12, border:'1px solid #ccc', borderRadius:8 }}
        />
        <input
          value={tagFilter}
          onChange={e=>setTagFilter(e.target.value)}
          placeholder={t("tags.filter.placeholder")}
          style={{ padding:12, border:'1px solid #ccc', borderRadius:8 }}
        />
      </div>

      {/* Ajout rapide (ENTER) + tags */}
      <section style={{ marginTop:16, display:'grid', gap:8 }}>
        <form onSubmit={onSubmitAdd} className="input-row">
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder={t("input.placeholder")}
            style={{ flex:1, padding:12, border:'1px solid #ccc', borderRadius:8 }}
          />
          <button type="submit">{t("btn.add")}</button>
        </form>
        <input
          value={inputTags}
          onChange={e=>setInputTags(e.target.value)}
          placeholder={t("input.tags.placeholder")}
          style={{ padding:10, border:'1px solid #ddd', borderRadius:8 }}
        />

        {/* Micro local / Cloud */}
        <div className="input-row">
          <button
            type="button"
            onPointerDown={startLocal}
            onPointerUp={stopLocal}
            disabled={unsupportedSTT}
            title={unsupportedSTT ? t("toast.sttUnsupported") : t("btn.local")}
          >
            🎤 {t("btn.local")} {listeningLocal ? '●' : ''}
          </button>

          <button
            type="button"
            onPointerDown={startCloud}
            onPointerUp={stopCloud}
            title={t("btn.cloud")}
          >
            ☁️ {t("btn.cloud")} {listeningCloud ? '●' : ''}
          </button>
        </div>

        {/* Brouillon */}
        {draft && (
          <div style={{ border:'1px solid #eee', borderRadius:8, padding:12 }}>
            <h3 style={{ marginTop:0 }}>{t("draft.title")}</h3>
            <label>{t("raw")}</label>
            <textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={3} style={{ width:'100%' }} />
            <label>{t("clean")}</label>
            <textarea value={clean} onChange={e=>setClean(e.target.value)} rows={3} style={{ width:'100%' }} />
            <input
              value={draftTags}
              onChange={e=>setDraftTags(e.target.value)}
              placeholder={t("draft.tags.placeholder")}
              style={{ marginTop:8, padding:10, border:'1px solid #ddd', borderRadius:8 }}
            />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button type="button" onClick={onImprove}>{t("btn.improve")}</button>
              <button type="button" onClick={onSaveDraft}>{t("btn.save")}</button>
              <button type="button" onClick={()=>{ setDraft(''); setClean(''); setDraftTags(''); }}>{t("btn.cancel")}</button>
            </div>
          </div>
        )}
      </section>

      {/* Liste */}
      <section style={{ marginTop:16 }}>
        {tasks.length === 0 && <p style={{ color:'#666' }}>{t("empty")}</p>}
        <ul style={{ listStyle:'none', padding:0 }}>
          {tasks.map(tk => (
            <li key={tk.id} style={{ borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button
                type="button"
                onClick={async ()=>{ await toggleDone(tk.id); await refresh(); }}
                aria-label="toggle"
                title={t("filter.done")}
              >
                {tk.status === 'done' ? '☑' : '☐'}
              </button>

              <div style={{ flex:1, margin:'0 8px' }}>
                <div style={{ fontWeight:600, textDecoration: tk.status==='done'?'line-through':'none' }}>{tk.rawText}</div>
                {tk.cleanText && <div style={{ color:'#666' }}>{tk.cleanText}</div>}
                {tk.tags && tk.tags.length>0 && (
                  <div className="chips">
                    {tk.tags.map(tag => <span className="chip" key={tag}>#{tag}</span>)}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={async ()=>{ await removeTask(tk.id); await refresh(); toast(t("toast.deleted"), { type:'info' }); }}
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
