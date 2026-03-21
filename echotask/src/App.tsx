import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
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

  const [allowCloudAI, setAllowCloudAI] = useState(() =>
    localStorage.getItem("allowCloud") === "1"
  );
  const [apiKey, setApiKey] = useState(() =>
    localStorage.getItem("apiKey") || ""
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('hasVisited'));
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => { localStorage.setItem("allowCloud", allowCloudAI ? "1" : "0"); }, [allowCloudAI]);
  useEffect(() => { localStorage.setItem("apiKey", apiKey); }, [apiKey]);

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

  useEffect(() => {
    const activeCount = manager.tasks.filter(t => t.status !== 'done').length;
    if ('setAppBadge' in navigator) {
      if (activeCount > 0) (navigator as any).setAppBadge(activeCount).catch(() => {});
      else (navigator as any).clearAppBadge?.().catch(() => {});
    }
  }, [manager.tasks]);

  if (mode === 'cloud' && authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader" />
      </div>
    );
  }

  if (mode === 'cloud' && !user) return <AuthScreen />;

  async function handleAddTask(text: string, tags: string, due?: string | null) {
    await manager.add(text, null, tags, due);
    toast(t("toast.added"), { type: 'success' });
  }

  // Calcul du progress pour la barre fixée en haut
  const total  = manager.tasks.length;
  const done   = manager.tasks.filter(t => t.status === 'done').length;
  const pct    = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="zen-app fade-in">
      <ToastHost />

      {/* Barre de progression éthérée — fixée en haut du viewport */}
      {total > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 2,
          background: 'rgba(129, 140, 248, 0.12)',
          zIndex: 1300,
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #c7d2fe, #ddd6fe, #fbcfe8)',
              position: 'relative',
            }}
          >
            {/* Shimmer glissant */}
            <motion.div
              animate={{ x: ['-100%', '250%'] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                width: '40%',
              }}
            />
          </motion.div>
        </div>
      )}

      {/* Contrôles discrets — coin supérieur droit */}
      <div className="zen-corner">
        {mode === 'cloud' && isSyncing && (
          <span style={{ fontSize: '0.75rem', opacity: 0.4, color: 'var(--color-text-tertiary)' }}>↻</span>
        )}
        <select
          value={manager.filter}
          onChange={e => manager.setFilter(e.target.value as any)}
          className="zen-filter-select"
          aria-label={t("filter.label")}
        >
          <option value="all">{t("filter.all")}</option>
          <option value="active">{t("filter.active")}</option>
          <option value="done">{t("filter.done")}</option>
        </select>
        <button onClick={() => setShowSettings(true)} className="btn-icon" aria-label="Paramètres">⚙️</button>
        <ThemeToggle />
        <LanguageSwitch />
      </div>

      <main className="zen-main">

        {/* Header centré — typographie haute couture */}
        <motion.header
          className="zen-header"
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="zen-title">EchoTask</h1>
          <time className="zen-date">
            {new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
          </time>
        </motion.header>

        {/* Floating Whisper — input sans cadre */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AddTaskForm
            onSubmit={handleAddTask}
            placeholderText={t("input.placeholder")}
            placeholderTags={t("input.tags.placeholder")}
            dueLabel={t("due.label")}
            buttonLabel={t("btn.add")}
          />
        </motion.div>

        {/* Voix — intégré sous le whisper */}
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

        {/* DraftEditor */}
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

        {/* Stats discrètes */}
        <TaskStats
          active={manager.tasks.filter(t => t.status !== 'done').length}
          done={done}
          activeLabel={t("stats.active")}
          doneLabel={t("stats.done")}
        />

        {/* Filtre — ghost minimal */}
        <FilterBar
          search={manager.search}
          tagFilter={manager.tagFilter}
          onSearchChange={manager.setSearch}
          onTagFilterChange={manager.setTagFilter}
          searchPlaceholder={t("search.placeholder")}
          tagFilterPlaceholder={t("tags.filter.placeholder")}
        />

        {/* Liste de tâches */}
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

      </main>

      {/* Modals */}
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
          onImportDone={manager.refresh}
        />
      )}
    </div>
  );
}
