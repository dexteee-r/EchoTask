// src/constants.ts

/**
 * Clés de stockage local (localStorage)
 */
export const STORAGE_KEYS = {
  /** Clé pour les tâches (fallback si IndexedDB indisponible) */
  TASKS: 'echotask_tasks',
  
  /** Clé pour la langue sélectionnée */
  LANG: 'lang',
  
  /** Clé pour l'activation du cloud */
  ALLOW_CLOUD: 'allowCloud',
  
  /** Clé pour l'API key OpenAI */
  API_KEY: 'apiKey',
} as const;

/**
 * Configuration de l'application
 */
export const APP_CONFIG = {
  /** Nom de l'application */
  NAME: 'EchoTask',
  
  /** Version de l'application */
  VERSION: '1.0.0',
  
  /** Nom de la base de données IndexedDB */
  DB_NAME: 'echotask',
  
  /** Version de la base de données */
  DB_VERSION: 1,
  
  /** Largeur maximale du contenu (px) */
  MAX_WIDTH: 980,
} as const;

/**
 * Configuration des toasts
 */
export const TOAST_CONFIG = {
  /** Durée par défaut d'affichage (ms) */
  DEFAULT_DURATION: 3000,
  
  /** Durée pour les erreurs (ms) */
  ERROR_DURATION: 5000,
  
  /** Position du toast */
  POSITION: 'bottom-center' as const,
} as const;

/**
 * URLs des APIs externes
 */
export const API_URLS = {
  /** URL de l'API Whisper (OpenAI) */
  WHISPER: 'https://api.openai.com/v1/audio/transcriptions',
  
  /** URL de l'API Chat Completions (OpenAI) */
  CHAT: 'https://api.openai.com/v1/chat/completions',
} as const;

/**
 * Configuration Whisper
 */
export const WHISPER_CONFIG = {
  /** Modèle utilisé */
  MODEL: 'whisper-1',
  
  /** Format audio */
  AUDIO_FORMAT: 'audio/webm',
  
  /** Nom du fichier audio */
  AUDIO_FILENAME: 'audio.webm',
} as const;

/**
 * Configuration de réécriture IA
 */
export const REWRITE_CONFIG = {
  /** Modèle GPT utilisé */
  MODEL: 'gpt-4o-mini',
  
  /** Température (créativité) */
  TEMPERATURE: 0.2,
  
  /** Prompt système par défaut */
  DEFAULT_SYSTEM_PROMPT: (lang: string, tone: string) =>
    `Reformule des mémos en phrases claires et actionnables. Langue: ${lang}. Ton: ${tone}. Ne renvoie que la phrase.`,
} as const;

/**
 * Configuration STT (Speech-to-Text)
 */
export const STT_CONFIG = {
  /** Résultats intermédiaires activés */
  INTERIM_RESULTS: true,
  
  /** Mode continu activé */
  CONTINUOUS: true,
} as const;

/**
 * Expressions régulières utiles
 */
export const REGEX = {
  /** Détecte si une phrase se termine par une ponctuation */
  HAS_PUNCTUATION: /[.!?…]$/,
  
  /** Détecte les espaces multiples */
  MULTIPLE_SPACES: /\s+/g,
} as const;

/**
 * Messages d'erreur par défaut
 */
export const ERROR_MESSAGES = {
  STT_NOT_SUPPORTED: 'Speech-to-Text non supporté par ce navigateur',
  API_KEY_REQUIRED: 'Clé API requise pour cette fonctionnalité',
  CLOUD_API_ERROR: 'Erreur lors de l\'appel API cloud',
  RECORDING_START_ERROR: 'Impossible de démarrer l\'enregistrement',
  REWRITE_ERROR: 'Erreur lors de la réécriture',
} as const;

/**
 * Valeurs par défaut
 */
export const DEFAULTS = {
  /** Statut par défaut d'une nouvelle tâche */
  TASK_STATUS: 'active' as const,
  
  /** Filtre par défaut */
  FILTER: 'all' as const,
  
  /** Langue par défaut */
  LANG: 'en' as const,
  
  /** Ton de réécriture par défaut */
  REWRITE_TONE: 'neutral' as const,
} as const;

/**
 * Limites de l'application
 */
export const LIMITS = {
  /** Longueur minimale pour sauvegarder une tâche */
  MIN_TASK_LENGTH: 1,
  
  /** Longueur maximale d'une tâche (caractères) */
  MAX_TASK_LENGTH: 5000,
  
  /** Nombre maximum de tags par tâche */
  MAX_TAGS: 10,
  
  /** Longueur maximale d'un tag */
  MAX_TAG_LENGTH: 30,
} as const;

/**
 * Séparateurs
 */
export const SEPARATORS = {
  /** Séparateur de tags */
  TAGS: ',',
  
  /** Séparateur pour l'ID de fallback */
  ID_PREFIX: 't_',
} as const;

/**
 * Classes CSS utiles
 */
export const CSS_CLASSES = {
  /** Classe pour les badges */
  BADGE: 'badge',
  
  /** Classe pour les chips (tags) */
  CHIP: 'chip',
  
  /** Conteneur de chips */
  CHIPS: 'chips',
  
  /** Row d'inputs */
  INPUT_ROW: 'input-row',
} as const;

/**
 * Styles inline réutilisables
 */
export const INLINE_STYLES = {
  /** Conteneur principal */
  CONTAINER: {
    maxWidth: APP_CONFIG.MAX_WIDTH,
    margin: '0 auto',
    padding: 16,
    fontFamily: 'system-ui, sans-serif',
  },
  
  /** Input standard */
  INPUT: {
    padding: 12,
    border: '1px solid #ccc',
    borderRadius: 8,
  },
  
  /** Input avec erreur */
  INPUT_ERROR: {
    padding: 12,
    border: '1px solid #b00020',
    borderRadius: 8,
  },
} as const;