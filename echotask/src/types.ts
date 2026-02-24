// src/types.ts

/**
 * Sous-tâche associée à une tâche principale
 */
export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}

/**
 * Type principal : Tâche
 */
export type Task = {
  /** Identifiant unique de la tâche */
  id: string;
  
  /** Texte brut (saisi ou dicté) */
  rawText: string;
  
  /** Texte amélioré/réécrit (optionnel) */
  cleanText?: string | null;
  
  /** Statut de la tâche */
  status: TaskStatus;
  
  /** Tags associés (tableau de strings en minuscules) */
  tags?: string[];
  
  /** Date d'échéance ISO (optionnel, futur) */
  due?: string | null;

  /** Sous-tâches de cette tâche */
  subtasks?: SubTask[];

  /** Chemin vers un fichier ou dossier local (optionnel) */
  filePath?: string | null;

  /** Date de création ISO */
  createdAt: string;
  
  /** Date de dernière mise à jour ISO */
  updatedAt: string;
};

/**
 * Statut possible d'une tâche
 */
export type TaskStatus = 'active' | 'done';

/**
 * Type de filtre pour la liste des tâches
 */
export type TaskFilter = 'all' | 'active' | 'done';

/**
 * Métadonnées de langue pour STT et direction
 */
export type LangMeta = {
  /** Code langue pour Web Speech API (ex: 'fr-FR') */
  stt: string;
  
  /** Code langue pour Whisper API (ex: 'fr') */
  whisper: string;
  
  /** Direction du texte (LTR ou RTL) */
  dir: 'ltr' | 'rtl';
};

/**
 * Langues supportées par l'application
 */
export type SupportedLang = 'fr' | 'en' | 'ar';

/**
 * Type de toast (notification)
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Options pour un toast
 */
export type ToastOptions = {
  /** Type de toast (détermine la couleur) */
  type?: ToastType;
  
  /** Durée d'affichage en ms (défaut: 3000) */
  duration?: number;
};

/**
 * Ton de réécriture pour l'IA
 */
export type RewriteTone = 'neutral' | 'professional' | 'friendly' | 'casual';

/**
 * Contenu du brouillon structuré
 */
export type DraftContent = {
  /** Texte brut */
  raw: string;
  
  /** Texte amélioré (peut être null) */
  clean: string | null;
  
  /** Tags (chaîne séparée par virgules) */
  tags: string;
};

/**
 * Configuration Cloud persistée
 */
export type CloudConfig = {
  /** Cloud activé ? */
  allowCloud: boolean;
  
  /** Clé API OpenAI */
  apiKey: string;
};

/**
 * Props pour le composant TaskItem
 */
export type TaskItemProps = {
  task: Task;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  toggleLabel: string;
  deleteLabel?: string;
};

/**
 * Props pour le composant TaskList
 */
export type TaskListProps = {
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  toggleLabel: string;
};

/**
 * Props pour le composant AddTaskForm
 */
export type AddTaskFormProps = {
  onSubmit: (text: string, tags: string) => void;
  placeholderText: string;
  placeholderTags: string;
  buttonLabel: string;
};

/**
 * Retour du hook useTaskManager
 */
export type UseTaskManagerReturn = {
  tasks: Task[];
  filter: TaskFilter;
  search: string;
  tagFilter: string;
  setFilter: (filter: TaskFilter) => void;
  setSearch: (search: string) => void;
  setTagFilter: (tags: string) => void;
  add: (raw: string, cleanText?: string | null, tagsStr?: string, due?: string | null) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  update: (task: Task) => Promise<void>;
  addSubtask: (taskId: string, text: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  removeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => void;
  refresh: () => Promise<void>;
};

/**
 * Retour du hook useSTT
 */
export type UseSTTReturn = {
  isSupported: boolean;
  listeningLocal: boolean;
  listeningCloud: boolean;
  startLocal: () => void;
  stopLocal: () => void;
  startCloud: () => Promise<void>;
  stopCloud: () => Promise<void>;
};

/**
 * Retour du hook useDraft
 */
export type UseDraftReturn = {
  draft: string;
  clean: string;
  tags: string;
  hasContent: boolean;
  setDraft: (text: string) => void;
  setClean: (text: string) => void;
  setTags: (tags: string) => void;
  updateDraft: (text: string, autoImprove?: boolean) => void;
  updateClean: (text: string) => void;
  updateTags: (tags: string) => void;
  improveLocal: () => void;
  improveCloud: (apiKey: string, lang?: string, tone?: RewriteTone) => Promise<void>;
  clear: () => void;
  getContent: () => DraftContent;
};