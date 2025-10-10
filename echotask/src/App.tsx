import React, { useEffect, useState } from 'react';
import { ToastHost, toast } from './ui/Toast';
import { useI18n, LANG_META } from './i18n';
import LanguageSwitch from './ui/LanguageSwitch';
import AddTaskForm from './ui/AddTaskForm';
import TaskList from './ui/TaskList';
import { useTaskManager } from './hooks/useTaskManager';
import { useSTT } from './hooks/useSTT';
import { useDraft } from './hooks/useDraft';

/**
 * Composant principal EchoTask
 * 
 * Utilise 3 hooks personnalisés pour simplifier la logique :
 * - useTaskManager : gestion des tâches
 * - useSTT : dictée vocale
 * - useDraft : brouillon
 */
export default function App() {
  // === i18n ===
  const { t, lang } = useI18n();
  const meta = LANG_META[lang];

  // === Configuration Cloud (persistée) ===
  const [allowCloud, setAllowCloud] = useState(() => 
    localStorage.getItem("allowCloud") === "1"
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem("apiKey") || ""
  );

  // Persister les préférences
  useEffect(() => {
    localStorage.setItem("allowCloud", allowCloud ? "1" : "0");
  }, [allowCloud]);

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  // === Hook 1 : Gestion des tâches ===
  const {
    tasks,
    filter,
    search,
    tagFilter,
    setFilter,
    setSearch,
    setTagFilter,
    add,
    toggle,
    remove
  } = useTaskManager();

  // === Hook 2 : Brouillon ===
  const draftManager = useDraft();

  // === Hook 3 : STT (Speech-to-Text) ===
  const stt = useSTT(
    // Callback quand on reçoit du texte transcrit
    (text) => {
      draftManager.updateDraft(text, true); // true = auto-amélioration locale
    },
    meta.stt,      // langue STT local
    meta.whisper,  // langue Whisper
    apiKey         // clé API
  );

  // === Handlers ===

  /**
   * Ajoute une tâche depuis le formulaire rapide
   */
  async function handleAddTask(text: string, tags: string) {
    await add(text, null, tags);
    toast(t("toast.added"), { type: 'success' });
  }

  /**
   * Toggle fait/non fait
   */
  async function handleToggleDone(id: string) {
    await toggle(id);
  }

  /**
   * Supprime une tâche
   */
  async function handleDelete(id: string) {
    await remove(id);
    toast(t("toast.deleted"), { type: 'info' });
  }

  /**
   * Démarre STT local
   */
  function handleStartLocal() {
    try {
      stt.startLocal();
    } catch (error) {
      toast(t("toast.sttUnsupported"), { type: 'info' });
    }
  }

  /**
   * Démarre STT cloud
   */
  async function handleStartCloud() {
    try {
      await stt.startCloud();
    } catch (error) {
      toast(t("toast.recStartError"), { type: 'error' });
      console.error(error);
    }
  }

  /**
   * Améliore le brouillon
   */
  async function handleImprove() {
    try {
      if (allowCloud && apiKey) {
        await draftManager.improveCloud(apiKey, lang, 'neutral');
      } else {
        draftManager.improveLocal();
      }
    } catch (error) {
      toast(t("toast.rewriteError"), { type: 'error' });
      console.error(error);
    }
  }

  /**
   * Sauvegarde le brouillon comme nouvelle tâche
   */
  async function handleSaveDraft() {
    if (!draftManager.hasContent) {
      toast(t("toast.nothingToSave"), { type: 'info' });
      return;
    }

    try {
      const content = draftManager.getContent();
      await add(content.raw, content.clean, content.tags);
      draftManager.clear();
      toast(t("toast.saved"), { type: 'success' });
    } catch (error) {
      toast(t("toast.rewriteError"), { type: 'error' });
      console.error(error);
    }
  }

  // === Rendu ===

  return (
    <div style={{ 
      maxWidth: 980, 
      margin: '0 auto', 
      padding: 16, 
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <ToastHost />

      {/* === Header === */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 8, 
        flexWrap: 'wrap' 
      }}>
        <h1 style={{ margin: 0 }}>{t("app.title")}</h1>

        <div className="input-row">
          {/* Filtre statut */}
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value as any)} 
            className="badge"
          >
            <option value="all">{t("filter.all")}</option>
            <option value="active">{t("filter.active")}</option>
            <option value="done">{t("filter.done")}</option>
          </select>

          {/* Toggle Cloud */}
          <button 
            type="button" 
            onClick={() => setAllowCloud(v => !v)} 
            className="badge"
          >
            {allowCloud ? t("cloud.on") : t("cloud.off")}
          </button>

          {/* Sélecteur de langue */}
          <LanguageSwitch />
        </div>
      </header>

      {/* === Configuration Cloud === */}
      {allowCloud && (
        <div style={{ marginTop: 8 }}>
          <input
            placeholder={t("api.key.placeholder")}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              borderColor: !apiKey && allowCloud ? '#b00020' : '#ccc',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 8
            }}
          />
          {allowCloud && !apiKey && (
            <div style={{ color: '#b00020', marginTop: 4 }}>
              ⚠️ {t("api.key.placeholder")}
            </div>
          )}
        </div>
      )}

      {/* === Barre recherche + filtres === */}
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}
        />
        <input
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          placeholder={t("tags.filter.placeholder")}
          style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}
        />
      </div>

      {/* === Formulaire d'ajout rapide === */}
      <AddTaskForm
        onSubmit={handleAddTask}
        placeholderText={t("input.placeholder")}
        placeholderTags={t("input.tags.placeholder")}
        buttonLabel={t("btn.add")}
      />

      {/* === Boutons micro === */}
      <div className="input-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          onPointerDown={handleStartLocal}
          onPointerUp={() => stt.stopLocal()}
          disabled={!stt.isSupported}
          title={!stt.isSupported ? t("toast.sttUnsupported") : t("btn.local")}
        >
          🎤 {t("btn.local")} {stt.listeningLocal ? '●' : ''}
        </button>

        <button
          type="button"
          onPointerDown={handleStartCloud}
          onPointerUp={() => stt.stopCloud()}
          title={t("btn.cloud")}
        >
          ☁️ {t("btn.cloud")} {stt.listeningCloud ? '●' : ''}
        </button>
      </div>

      {/* === Brouillon === */}
      {draftManager.draft && (
        <div style={{ 
          border: '1px solid #eee', 
          borderRadius: 8, 
          padding: 12, 
          marginTop: 16 
        }}>
          <h3 style={{ marginTop: 0 }}>{t("draft.title")}</h3>

          {/* Texte brut */}
          <label>{t("raw")}</label>
          <textarea
            value={draftManager.draft}
            onChange={e => draftManager.setDraft(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />

          {/* Texte amélioré */}
          <label>{t("clean")}</label>
          <textarea
            value={draftManager.clean}
            onChange={e => draftManager.setClean(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
          />

          {/* Tags */}
          <input
            value={draftManager.tags}
            onChange={e => draftManager.setTags(e.target.value)}
            placeholder={t("draft.tags.placeholder")}
            style={{ 
              marginTop: 8, 
              padding: 10, 
              border: '1px solid #ddd', 
              borderRadius: 8 
            }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={handleImprove}>
              {t("btn.improve")}
            </button>
            <button type="button" onClick={handleSaveDraft}>
              {t("btn.save")}
            </button>
            <button type="button" onClick={() => draftManager.clear()}>
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