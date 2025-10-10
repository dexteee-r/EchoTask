import React, { useEffect, useState } from 'react';
import { ToastHost, toast } from './ui/Toast';
import { useI18n, LANG_META } from './i18n';
import LanguageSwitch from './ui/LanguageSwitch';
import AddTaskForm from './ui/AddTaskForm';
import TaskList from './ui/TaskList';
import FilterBar from './ui/FilterBar';
import CloudConfig from './ui/CloudConfig';
import VoiceButtons from './ui/VoiceButtons';
import DraftEditor from './ui/DraftEditor';
import { useTaskManager } from './hooks/useTaskManager';
import { useSTT } from './hooks/useSTT';
import { useDraft } from './hooks/useDraft';

/**
 * Composant principal EchoTask (Ultra-Simplifié)
 * 
 * Orchestration pure via hooks et composants dédiés.
 * Réduit de 315 → ~100 lignes.
 */
export default function App() {
  // i18n
  const { t, lang } = useI18n();
  const meta = LANG_META[lang];

  // Config Cloud (persistée)
  const [allowCloud, setAllowCloud] = useState(() => 
    localStorage.getItem("allowCloud") === "1"
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem("apiKey") || ""
  );

  useEffect(() => {
    localStorage.setItem("allowCloud", allowCloud ? "1" : "0");
  }, [allowCloud]);

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  // Hooks métier
  const manager = useTaskManager();
  const draft = useDraft();
  const stt = useSTT(
    (text) => draft.updateDraft(text, true),
    meta.stt,
    meta.whisper,
    apiKey
  );

  // Handlers
  async function handleAddTask(text: string, tags: string) {
    await manager.add(text, null, tags);
    toast(t("toast.added"), { type: 'success' });
  }

  async function handleToggleDone(id: string) {
    await manager.toggle(id);
  }

  async function handleDelete(id: string) {
    await manager.remove(id);
    toast(t("toast.deleted"), { type: 'info' });
  }

  function handleStartLocal() {
    try {
      stt.startLocal();
    } catch {
      toast(t("toast.sttUnsupported"), { type: 'info' });
    }
  }

  async function handleStartCloud() {
    try {
      await stt.startCloud();
    } catch {
      toast(t("toast.recStartError"), { type: 'error' });
    }
  }

  async function handleImprove() {
    try {
      if (allowCloud && apiKey) {
        await draft.improveCloud(apiKey, lang, 'neutral');
      } else {
        draft.improveLocal();
      }
    } catch {
      toast(t("toast.rewriteError"), { type: 'error' });
    }
  }

  async function handleSaveDraft() {
    if (!draft.hasContent) {
      toast(t("toast.nothingToSave"), { type: 'info' });
      return;
    }
    try {
      const content = draft.getContent();
      await manager.add(content.raw, content.clean, content.tags);
      draft.clear();
      toast(t("toast.saved"), { type: 'success' });
    } catch {
      toast(t("toast.rewriteError"), { type: 'error' });
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <ToastHost />

      {/* Header */}
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <h1 style={{ margin:0 }}>{t("app.title")}</h1>

        <div className="input-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={manager.filter} onChange={e=>manager.setFilter(e.target.value as any)} className="badge">
            <option value="all">{t("filter.all")}</option>
            <option value="active">{t("filter.active")}</option>
            <option value="done">{t("filter.done")}</option>
          </select>

          <CloudConfig
            allowCloud={allowCloud}
            apiKey={apiKey}
            onToggleCloud={() => setAllowCloud(v => !v)}
            onApiKeyChange={setApiKey}
            cloudOnLabel={t("cloud.on")}
            cloudOffLabel={t("cloud.off")}
            apiKeyPlaceholder={t("api.key.placeholder")}
            warningMessage={t("api.key.placeholder")}
          />

          <LanguageSwitch />
        </div>
      </header>

      {/* Filtres */}
      <FilterBar
        search={manager.search}
        tagFilter={manager.tagFilter}
        onSearchChange={manager.setSearch}
        onTagFilterChange={manager.setTagFilter}
        searchPlaceholder={t("search.placeholder")}
        tagFilterPlaceholder={t("tags.filter.placeholder")}
      />

      {/* Ajout rapide */}
      <AddTaskForm
        onSubmit={handleAddTask}
        placeholderText={t("input.placeholder")}
        placeholderTags={t("input.tags.placeholder")}
        buttonLabel={t("btn.add")}
      />

      {/* Boutons vocaux */}
      <VoiceButtons
        listeningLocal={stt.listeningLocal}
        listeningCloud={stt.listeningCloud}
        sttSupported={stt.isSupported}
        onStartLocal={handleStartLocal}
        onStopLocal={() => stt.stopLocal()}
        onStartCloud={handleStartCloud}
        onStopCloud={() => stt.stopCloud()}
        localLabel={t("btn.local")}
        cloudLabel={t("btn.cloud")}
        unsupportedTooltip={t("toast.sttUnsupported")}
      />

      {/* Brouillon */}
      {draft.draft && (
        <DraftEditor
          draft={draft.draft}
          clean={draft.clean}
          tags={draft.tags}
          onDraftChange={draft.setDraft}
          onCleanChange={draft.setClean}
          onTagsChange={draft.setTags}
          onImprove={handleImprove}
          onSave={handleSaveDraft}
          onCancel={() => draft.clear()}
          title={t("draft.title")}
          rawLabel={t("raw")}
          cleanLabel={t("clean")}
          tagsPlaceholder={t("draft.tags.placeholder")}
          improveLabel={t("btn.improve")}
          saveLabel={t("btn.save")}
          cancelLabel={t("btn.cancel")}
        />
      )}

      {/* Liste */}
      <TaskList
        tasks={manager.tasks}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
        emptyMessage={t("empty")}
        toggleLabel={t("filter.done")}
      />
    </div>
  );
}