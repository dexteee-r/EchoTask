import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Task } from './types';
import { localRewrite, cloudRewrite } from './rewrite';
import { ToastHost, toast } from './ui/Toast';
import { useI18n, LANG_META } from './i18n';
import LanguageSwitch from './ui/LanguageSwitch';
import AddTaskForm from './ui/AddTaskForm';
import TaskList from './ui/TaskList';
import FilterBar from './ui/FilterBar';
import CloudConfig from './ui/CloudConfig';
import VoiceButtons from './ui/VoiceButtons';
import ThemeToggle from './ui/ThemeToggle';
import EmptyState from './ui/EmptyState';
import TaskStats from './ui/TaskStats';

// Chargement différé — code splitting pour les composants conditionnels
const DraftEditor   = lazy(() => import('./ui/DraftEditor'));
const WelcomeModal  = lazy(() => import('./ui/WelcomeModal'));
const EditTaskModal = lazy(() => import('./ui/EditTaskModal'));
import { useTaskManager } from './hooks/useTaskManager';
import { useSTT } from './hooks/useSTT';
import { useDraft } from './hooks/useDraft';

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

  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('hasVisited');
  });
  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasVisited', 'true');
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
    apiKey,
    (code) => {
      if (code === 'service-not-allowed') {
        toast(t("toast.sttBlocked"), { type: 'error' });
      } else if (code === 'not-allowed') {
        toast(t("toast.micPermission"), { type: 'error' });
      } else {
        toast(t("toast.sttUnsupported"), { type: 'info' });
      }
    }
  );

  // PWA Badge — met à jour le badge avec le nombre de tâches actives
  useEffect(() => {
    const activeCount = manager.tasks.filter(t => t.status !== 'done').length;
    if ('setAppBadge' in navigator) {
      if (activeCount > 0) {
        (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> })
          .setAppBadge(activeCount).catch(() => {});
      } else {
        (navigator as Navigator & { clearAppBadge: () => Promise<void> })
          .clearAppBadge?.().catch(() => {});
      }
    }
  }, [manager.tasks]);

  // Handlers
  async function handleAddTask(text: string, tags: string, due?: string | null) {
    await manager.add(text, null, tags, due);
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

  function handleTagClick(tag: string) {
    const current = manager.tagFilter.split(',').map(t => t.trim()).filter(Boolean);
    if (current.includes(tag)) {
      manager.setTagFilter(current.filter(t => t !== tag).join(', '));
    } else {
      manager.setTagFilter(tag);
    }
  }

  function handleEdit(id: string) {
    const taskToEdit = manager.tasks.find(t => t.id === id);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
    }
  }
  async function handleSaveEdit(updatedTask: Task) {
    await manager.update(updatedTask);
    setEditingTask(null);
    toast(t("toast.updated"), { type: 'success' });
  }
  async function handleImproveInEdit(): Promise<string> {
    if (!editingTask) return '';
    try {
      if (allowCloud && apiKey) {
        return await cloudRewrite(editingTask.rawText, apiKey, lang, 'neutral');
      } else {
        return localRewrite(editingTask.rawText);
      }
    } catch {
      toast(t("toast.rewriteError"), { type: 'error' });
      return '';
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <ToastHost />

      {/* Header */}
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap' }}
        role="banner"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h1 style={{ margin: 0 }}>{t("app.title")}</h1>
          <span style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-medium)',
            textTransform: 'capitalize',
          }}>
            {new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang, {
              weekday: 'long', day: 'numeric', month: 'long'
            }).format(new Date())}
          </span>
        </div>

        <div className="input-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={manager.filter} onChange={e=>manager.setFilter(e.target.value as any)} className="badge" aria-label={t("filter.label")}>
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
          <ThemeToggle />
          <LanguageSwitch />
        </div>
      </header>

      {/* Contenu principal */}
      <main>

      {/* Filtres */}
      <FilterBar
        search={manager.search}
        tagFilter={manager.tagFilter}
        onSearchChange={manager.setSearch}
        onTagFilterChange={manager.setTagFilter}
        searchPlaceholder={t("search.placeholder")}
        tagFilterPlaceholder={t("tags.filter.placeholder")}
      />

      {/* Stats */}
      <TaskStats
        active={manager.tasks.filter(t => t.status !== 'done').length}
        done={manager.tasks.filter(t => t.status === 'done').length}
        activeLabel={t("stats.active")}
        doneLabel={t("stats.done")}
      />

      {/* Ajout rapide */}
      <AddTaskForm
        onSubmit={handleAddTask}
        placeholderText={t("input.placeholder")}
        placeholderTags={t("input.tags.placeholder")}
        dueLabel={t("due.label")}
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
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* === Liste des tâches === */}
      <TaskList
        tasks={manager.tasks}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onTagClick={handleTagClick}
        onAddSubtask={(taskId, text) => manager.addSubtask(taskId, text)}
        onToggleSubtask={(taskId, subId) => manager.toggleSubtask(taskId, subId)}
        onRemoveSubtask={(taskId, subId) => manager.removeSubtask(taskId, subId)}
        onCompleteTask={(taskId) => manager.completeTask(taskId)}
        emptyMessage={t("empty")}
        toggleLabel={t("filter.done")}
        completeLabel={t("task.complete")}
        subtaskToggleLabel={t("subtask.toggle")}
        subtaskPlaceholder={t("subtask.placeholder")}
      />

      {/* 🆕 Empty State (si liste vide) */}
      {manager.tasks.length === 0 && (
        <EmptyState
          title={t("empty.title")}
          microphoneHint={t("empty.microphoneHint")}
          keyboardHint={t("empty.keyboardHint")}
          improveHint={t("empty.improveHint")}
        />
      )}

      {/* 🆕 Welcome Modal (première visite) */}
      {showWelcome && (
        <Suspense fallback={null}>
        <WelcomeModal
          onClose={handleCloseWelcome}
          title={t("welcome.title")}
          subtitle={t("welcome.subtitle")}
          step1={t("welcome.step1")}
          step2={t("welcome.step2")}
          step3={t("welcome.step3")}
          startButton={t("welcome.start")}
          learnMoreButton={t("welcome.learnMore")}
        />
        </Suspense>
      )}
      {editingTask && (
        <Suspense fallback={null}>
        <EditTaskModal
          task={editingTask}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTask(null)}
          onImprove={handleImproveInEdit}
          title={t("edit.title")}
          rawLabel={t("raw")}
          cleanLabel={t("clean")}
          tagsLabel={t("tags")}
          tagsPlaceholder={t("edit.tagsPlaceholder")}
          dueLabel={t("due.label")}
          duePlaceholder={t("due.placeholder")}
          saveButton={t("btn.save")}
          cancelButton={t("btn.cancel")}
          improveButton={t("btn.improve")}
        />
        </Suspense>
      )}

      </main>
    </div>
  );
}