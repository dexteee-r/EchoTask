import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Task } from './types';
import { localRewrite, cloudRewrite } from './rewrite';
import { ToastHost, toast } from './ui/Toast';
import { useI18n, LANG_META } from './i18n';
import LanguageSwitch from './ui/LanguageSwitch';
import AddTaskForm from './ui/AddTaskForm';
import TaskList from './ui/TaskList';
import FilterBar from './ui/FilterBar';
import VoiceButtons from './ui/VoiceButtons';
import ThemeToggle from './ui/ThemeToggle';
import EmptyState from './ui/EmptyState';
import TaskStats from './ui/TaskStats';
import SettingsModal from './ui/SettingsModal';
import AuthScreen from './ui/AuthScreen';
import ErrorBoundary from './ui/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';

// Chargement différé — code splitting pour les composants conditionnels
const DraftEditor   = lazy(() => import('./ui/DraftEditor'));
const WelcomeModal  = lazy(() => import('./ui/WelcomeModal'));
const EditTaskModal = lazy(() => import('./ui/EditTaskModal'));
import { useTaskManager } from './hooks/useTaskManager';
import { useSTT } from './hooks/useSTT';
import { useDraft } from './hooks/useDraft';
import { useSync } from './lib/sync';

export default function App() {
  const { user, isLoading: authLoading, mode } = useAuth();
  const { t, lang } = useI18n();
  const meta = LANG_META[lang];

  // Config Cloud AI (persistée)
  const [allowCloudAI, setAllowCloudAI] = useState(() => 
    localStorage.getItem("allowCloud") === "1"
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem("apiKey") || ""
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('hasVisited'));
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    localStorage.setItem("allowCloud", allowCloudAI ? "1" : "0");
  }, [allowCloudAI]);

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  // Hooks métier
  const manager = useTaskManager();
  const draft = useDraft();
  const { isSyncing } = useSync(manager.refresh);

  const stt = useSTT(
    (text) => draft.updateDraft(text, true),
    meta.stt,
    meta.whisper,
    apiKey,
    (code) => {
      if (code === 'service-not-allowed') toast(t("toast.sttBlocked"), { type: 'error' });
      else if (code === 'not-allowed') toast(t("toast.micPermission"), { type: 'error' });
      else toast(t("toast.sttUnsupported"), { type: 'info' });
    }
  );

  // Badge PWA
  useEffect(() => {
    const activeCount = manager.tasks.filter(t => t.status !== 'done').length;
    if ('setAppBadge' in navigator) {
      if (activeCount > 0) (navigator as any).setAppBadge(activeCount).catch(() => {});
      else (navigator as any).clearAppBadge?.().catch(() => {});
    }
  }, [manager.tasks]);

  // Chargement initial de l'auth (seulement en mode cloud)
  if (mode === 'cloud' && authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="loader"></div>
      </div>
    );
  }

  // En mode cloud : connexion obligatoire
  if (mode === 'cloud' && !user) {
    return <AuthScreen />;
  }

  // Handlers
  async function handleAddTask(text: string, tags: string, due?: string | null) {
    await manager.add(text, null, tags, due);
    toast(t("toast.added"), { type: 'success' });
  }

  return (
    <div className="app-container fade-in">
      <ToastHost />

      {/* Header */}
      <header className="app-header" role="banner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h1 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{t("app.title")}</h1>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
            {new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
          </span>
        </div>

        <div className="app-header-end">
          {mode === 'cloud' && isSyncing && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>↻</span>}
          <select value={manager.filter} onChange={e=>manager.setFilter(e.target.value as any)} className="badge" aria-label={t("filter.label")}>
            <option value="all">{t("filter.all")}</option>
            <option value="active">{t("filter.active")}</option>
            <option value="done">{t("filter.done")}</option>
          </select>

          <button onClick={() => setShowSettings(true)} className="btn-icon" aria-label="Paramètres">⚙️</button>
          <ThemeToggle />
          <LanguageSwitch />
        </div>
      </header>

      <main>
        <FilterBar
          search={manager.search}
          tagFilter={manager.tagFilter}
          onSearchChange={manager.setSearch}
          onTagFilterChange={manager.setTagFilter}
          searchPlaceholder={t("search.placeholder")}
          tagFilterPlaceholder={t("tags.filter.placeholder")}
        />

        <TaskStats
          active={manager.tasks.filter(t => t.status !== 'done').length}
          done={manager.tasks.filter(t => t.status === 'done').length}
          activeLabel={t("stats.active")}
          doneLabel={t("stats.done")}
        />

        <AddTaskForm
          onSubmit={handleAddTask}
          placeholderText={t("input.placeholder")}
          placeholderTags={t("input.tags.placeholder")}
          dueLabel={t("due.label")}
          buttonLabel={t("btn.add")}
        />

        <VoiceButtons
          listeningLocal={stt.listeningLocal}
          listeningCloud={stt.listeningCloud}
          sttSupported={stt.isSupported}
          onStartLocal={() => stt.startLocal()}
          onStopLocal={() => stt.stopLocal()}
          onStartCloud={() => stt.startCloud()}
          onStopCloud={() => stt.stopCloud()}
          localLabel={t("btn.local")}
          cloudLabel={t("btn.cloud")}
          unsupportedTooltip={t("toast.sttUnsupported")}
        />

        {draft.draft && (
          <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <DraftEditor
              draft={draft.draft}
              clean={draft.clean}
              tags={draft.tags}
              onDraftChange={draft.setDraft}
              onCleanChange={draft.setClean}
              onTagsChange={draft.setTags}
              onImprove={async () => {
                if (allowCloudAI && apiKey) await draft.improveCloud(apiKey, lang);
                else draft.improveLocal();
              }}
              onSave={async () => {
                const c = draft.getContent();
                await manager.add(c.raw, c.clean, c.tags);
                draft.clear();
                toast(t("toast.saved"), { type: 'success' });
              }}
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
          </ErrorBoundary>
        )}

        <TaskList
          tasks={manager.tasks}
          onToggleDone={manager.toggle}
          onDelete={manager.remove}
          onEdit={(id) => setEditingTask(manager.tasks.find(t => t.id === id) || null)}
          onTagClick={(tag) => manager.setTagFilter(tag)}
          onAddSubtask={manager.addSubtask}
          onToggleSubtask={manager.toggleSubtask}
          onRemoveSubtask={manager.removeSubtask}
          onReorder={manager.reorderTasks}
          emptyMessage={t("empty")}
          toggleLabel={t("filter.done")}
          subtaskToggleLabel={t("subtask.toggle")}
          subtaskPlaceholder={t("subtask.placeholder")}
          dragLabel={t("task.drag")}
        />

        {manager.tasks.length === 0 && (
          <EmptyState
            title={t("empty.title")}
            microphoneHint={t("empty.microphoneHint")}
            keyboardHint={t("empty.keyboardHint")}
            improveHint={t("empty.improveHint")}
          />
        )}

        {showWelcome && (
          <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <WelcomeModal
              onClose={() => { setShowWelcome(false); localStorage.setItem('hasVisited', 'true'); }}
              title={t("welcome.title")} subtitle={t("welcome.subtitle")}
              step1={t("welcome.step1")} step2={t("welcome.step2")} step3={t("welcome.step3")}
              startButton={t("welcome.start")} learnMoreButton={t("welcome.learnMore")}
            />
          </Suspense>
          </ErrorBoundary>
        )}

        {editingTask && (
          <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <EditTaskModal
              task={editingTask}
              onSave={async (t) => { await manager.update(t); setEditingTask(null); toast(t("toast.updated"), { type: 'success' }); }}
              onCancel={() => setEditingTask(null)}
              onImprove={async () => {
                if (allowCloudAI && apiKey) return await cloudRewrite(editingTask.rawText, apiKey, lang);
                return localRewrite(editingTask.rawText);
              }}
              title={t("edit.title")} rawLabel={t("raw")} cleanLabel={t("clean")}
              tagsLabel={t("tags")} tagsPlaceholder={t("edit.tagsPlaceholder")}
              dueLabel={t("due.label")} duePlaceholder={t("due.placeholder")}
              filePathLabel={t("task.filepath")} filePathPlaceholder={t("task.filepath.placeholder")}
              saveButton={t("btn.save")} cancelButton={t("btn.cancel")} improveButton={t("btn.improve")}
            />
          </Suspense>
          </ErrorBoundary>
        )}

        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            allowCloudAI={allowCloudAI}
            apiKey={apiKey}
            onToggleCloudAI={() => setAllowCloudAI(v => !v)}
            onApiKeyChange={setApiKey}
          />
        )}
      </main>
    </div>
  );
}