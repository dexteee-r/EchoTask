import React, { useEffect, useRef, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, Task, safeId } from './db';
import { localRewrite, cloudRewrite } from './rewrite';
import { sttSupported, startLocalSTT, recordAndTranscribeCloud } from './stt';
import { ToastHost, toast } from './ui/Toast';
import { useI18n, LANG_META } from './i18n';
import LanguageSwitch from './ui/LanguageSwitch';
import AddTaskForm from './ui/AddTaskForm';
import TaskList from './ui/TaskList';

const nowIso = () => new Date().toISOString();
const parseTags = (s: string) =>
  s.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

/**
 * Composant principal de l'application EchoTask
 * 
 * Gère :
 * - Liste des tâches avec filtres
 * - Ajout rapide (clavier)
 * - Dictée vocale (local + cloud)
 * - Brouillon avec réécriture
 * - Configuration Cloud (API key)
 */
export default function App() {
  // === État des tâches ===
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all'|'active'|'done'>('all');

  // === Recherche & filtres ===
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const activeFilterTags = () => parseTags(tagFilter);

  // === Brouillon STT ===
  const [draft, setDraft] = useState('');
  const [clean, setClean] = useState('');
  const [draftTags, setDraftTags] = useState('');

  // === État écoute vocale ===
  const [listeningLocal, setListeningLocal] = useState(false);
  const [listeningCloud, setListeningCloud] = useState(false);
  const stopLocalRef = useRef<null | (()=>void)>(null);

  // === Configuration Cloud (persistée) ===
  const [allowCloud, setAllowCloud] = useState(() => localStorage.getItem("allowCloud")==="1");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  
  // Persister les préférences Cloud
  useEffect(()=>{ localStorage.setItem("allowCloud", allowCloud ? "1":"0"); },[allowCloud]);
  useEffect(()=>{ localStorage.setItem("apiKey", apiKey); },[apiKey]);

  // === i18n ===
  const { t, lang } = useI18n();
  const meta = LANG_META[lang]; // { stt: 'fr-FR', whisper: 'fr', dir: 'ltr' }

  // === Gestion des tâches ===

  /**
   * Récupère la liste de base selon le filtre actif
   */
  async function baseList() {
    return await listTasks(filter);
  }

  /**
   * Rafraîchit la liste avec recherche et filtres tags
   */
  async function refresh() {
    const rows = await baseList();
    const q = search.trim().toLowerCase();
    const tags = activeFilterTags();
    
    const filtered = rows.filter(tk => {
      // Filtre texte (recherche dans raw et clean)
      const matchText =
        !q ||
        tk.rawText?.toLowerCase().includes(q) ||
        (tk.cleanText || '').toLowerCase().includes(q);
      
      // Filtre tags (tous les tags du filtre doivent être présents)
      const matchTags =
        tags.length === 0 ||
        tags.every(tag => (tk.tags || []).map(s=>s.toLowerCase()).includes(tag));
      
      return matchText && matchTags;
    });
    
    setTasks(filtered);
  }

  // Rafraîchir quand filtre/recherche change
  useEffect(() => { refresh(); }, [filter, search, tagFilter]);

  /**
   * Ajoute une nouvelle tâche
   */
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

  /**
   * Gère la soumission du formulaire d'ajout rapide
   */
  async function handleAddTask(text: string, tags: string) {
    await add(text, null, tags);
    toast(t("toast.added"), { type:'success' });
  }

  /**
   * Toggle le statut fait/non fait d'une tâche
   */
  async function handleToggleDone(id: string) {
    await toggleDone(id);
    await refresh();
  }

  /**
   * Supprime une tâche
   */
  async function handleDelete(id: string) {
    await removeTask(id);
    await refresh();
    toast(t("toast.deleted"), { type:'info' });
  }

  // === STT Local (Web Speech) ===

  /**
   * Démarre la dictée locale
   */
  function startLocal() {
    if (!sttSupported()) {
      toast(t("toast.sttUnsupported"), { type:'info' });
      return;
    }
    setListeningLocal(true);
    stopLocalRef.current = startLocalSTT(
      (tx)=>{ 
        setDraft(tx); 
        setClean(localRewrite(tx)); 
      },
      ()=> setListeningLocal(false),
      meta.stt // fr-FR / en-US / ar-SA
    );
  }

  /**
   * Arrête la dictée locale
   */
  function stopLocal() { 
    stopLocalRef.current?.(); 
    setListeningLocal(false); 
  }

  // === STT Cloud (Whisper) ===

  let cloudStop: null | (()=>Promise<void>) = null as any;

  /**
   * Démarre la dictée cloud (Whisper)
   */
  async function startCloud() {
    if (!allowCloud || !apiKey) { 
      toast(t("toast.recStartError"), { type:'error' }); 
      return; 
    }
    try {
      setListeningCloud(true);
      const rec = await recordAndTranscribeCloud(apiKey, meta.whisper);
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

  /**
   * Arrête la dictée cloud
   */
  async function stopCloud() { 
    if (cloudStop) await cloudStop(); 
  }

  // === Gestion du brouillon ===

  /**
   * Sauvegarde le brouillon comme nouvelle tâche
   */
  async function onSaveDraft() {
    try {
      if (!draft.trim() && !clean.trim()) { 
        toast(t("toast.nothingToSave"), { type:'info' }); 
        return; 
      }
      await add(draft.trim(), clean.trim() ? clean.trim() : null, draftTags);
      setDraft(''); 
      setClean(''); 
      setDraftTags('');
      await refresh();
      toast(t("toast.saved"), { type:'success' });
    } catch (e) {
      console.error(e);
      toast(t("toast.rewriteError"), { type:'error' });
    }
  }

  /**
   * Améliore le brouillon (réécriture)
   */
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

  // === Rendu ===

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <ToastHost />

      {/* === Header === */}
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <h1 style={{ margin:0 }}>{t("app.title")}</h1>

        <div className="input-row">
          {/* Filtre statut */}
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="badge">
            <option value="all">{t("filter.all")}</option>
            <option value="active">{t("filter.active")}</option>
            <option value="done">{t("filter.done")}</option>
          </select>

          {/* Toggle Cloud */}
          <button type="button" onClick={()=>setAllowCloud(v=>!v)} className="badge">
            {allowCloud ? t("cloud.on") : t("cloud.off")}
          </button>

          {/* Sélecteur de langue */}
          <LanguageSwitch />
        </div>
      </header>

      {/* === Configuration Cloud === */}
      {allowCloud && (
        <div style={{ marginTop:8 }}>
          <input
            placeholder={t("api.key.placeholder")}
            value={apiKey}
            onChange={e=>setApiKey(e.target.value)}
            style={{ 
              width:'100%', 
              padding:8, 
              borderColor: !apiKey && allowCloud ? '#b00020':'#ccc', 
              borderWidth:1, 
              borderStyle:'solid', 
              borderRadius:8 
            }}
          />
          {allowCloud && !apiKey && (
            <div style={{ color:'#b00020', marginTop:4 }}>
              ⚠️ {t("api.key.placeholder")}
            </div>
          )}
        </div>
      )}

      {/* === Barre recherche + filtre tags === */}
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

      {/* === Formulaire d'ajout rapide === */}
      <AddTaskForm
        onSubmit={handleAddTask}
        placeholderText={t("input.placeholder")}
        placeholderTags={t("input.tags.placeholder")}
        buttonLabel={t("btn.add")}
      />

      {/* === Boutons micro (local + cloud) === */}
      <div className="input-row" style={{ marginTop: 8 }}>
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

      {/* === Brouillon (si présent) === */}
      {draft && (
        <div style={{ border:'1px solid #eee', borderRadius:8, padding:12, marginTop:16 }}>
          <h3 style={{ marginTop:0 }}>{t("draft.title")}</h3>
          
          {/* Texte brut */}
          <label>{t("raw")}</label>
          <textarea 
            value={draft} 
            onChange={e=>setDraft(e.target.value)} 
            rows={3} 
            style={{ width:'100%' }} 
          />
          
          {/* Texte amélioré */}
          <label>{t("clean")}</label>
          <textarea 
            value={clean} 
            onChange={e=>setClean(e.target.value)} 
            rows={3} 
            style={{ width:'100%' }} 
          />
          
          {/* Tags du brouillon */}
          <input
            value={draftTags}
            onChange={e=>setDraftTags(e.target.value)}
            placeholder={t("draft.tags.placeholder")}
            style={{ marginTop:8, padding:10, border:'1px solid #ddd', borderRadius:8 }}
          />
          
          {/* Actions */}
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button type="button" onClick={onImprove}>
              {t("btn.improve")}
            </button>
            <button type="button" onClick={onSaveDraft}>
              {t("btn.save")}
            </button>
            <button type="button" onClick={()=>{ setDraft(''); setClean(''); setDraftTags(''); }}>
              {t("btn.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* === Liste des tâches === */}
      <TaskList
        tasks={tasks}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
        emptyMessage={t("empty")}
        toggleLabel={t("filter.done")}
      />
    </div>
  );
}