// src/utils.ts
import { REGEX, SEPARATORS } from './constants';

/**
 * Génère un timestamp ISO de maintenant
 * 
 * @returns {string} Date au format ISO 8601
 * @example nowIso() // "2025-10-10T14:30:00.000Z"
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Parse une chaîne de tags séparés par virgules
 * 
 * - Sépare par virgules
 * - Trim les espaces
 * - Convertit en minuscules
 * - Supprime les entrées vides
 * 
 * @param {string} s - Chaîne de tags (ex: "urgent, travail, important")
 * @returns {string[]} Tableau de tags nettoyés
 * @example parseTags("urgent, Travail,  ") // ["urgent", "travail"]
 */
export function parseTags(s: string): string[] {
  return s
    .split(SEPARATORS.TAGS)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Formate une liste de tags en chaîne
 * 
 * @param {string[]} tags - Tableau de tags
 * @returns {string} Chaîne formatée (ex: "urgent, travail")
 */
export function formatTags(tags: string[]): string {
  return tags.join(', ');
}

/**
 * Vérifie si une chaîne se termine par une ponctuation
 * 
 * @param {string} text - Texte à vérifier
 * @returns {boolean} true si se termine par . ! ? …
 */
export function hasPunctuation(text: string): boolean {
  return REGEX.HAS_PUNCTUATION.test(text);
}

/**
 * Nettoie les espaces multiples d'une chaîne
 * 
 * @param {string} text - Texte à nettoyer
 * @returns {string} Texte avec espaces simples
 * @example cleanSpaces("hello  world   !") // "hello world !"
 */
export function cleanSpaces(text: string): string {
  return text.replace(REGEX.MULTIPLE_SPACES, ' ').trim();
}

/**
 * Capitalise la première lettre d'une chaîne
 * 
 * @param {string} text - Texte à capitaliser
 * @returns {string} Texte avec première lettre en majuscule
 * @example capitalize("hello") // "Hello"
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Ajoute une ponctuation finale si absente
 * 
 * @param {string} text - Texte à ponctuer
 * @param {string} punctuation - Ponctuation à ajouter (défaut: ".")
 * @returns {string} Texte avec ponctuation finale
 * @example ensurePunctuation("hello") // "hello."
 */
export function ensurePunctuation(text: string, punctuation: string = '.'): string {
  return hasPunctuation(text) ? text : text + punctuation;
}

/**
 * Tronque un texte à une longueur maximale
 * 
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @param {string} suffix - Suffixe si tronqué (défaut: "...")
 * @returns {string} Texte tronqué
 * @example truncate("Hello world", 5) // "Hello..."
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Vérifie si une valeur est vide (null, undefined, chaîne vide)
 * 
 * @param {any} value - Valeur à vérifier
 * @returns {boolean} true si vide
 */
export function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Vérifie si une chaîne est vide après trim
 * 
 * @param {string} text - Texte à vérifier
 * @returns {boolean} true si vide après trim
 */
export function isBlank(text: string): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Génère un ID aléatoire court (pour fallback)
 * 
 * @returns {string} ID court (ex: "abc123")
 */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Formate une date ISO en format lisible
 * 
 * @param {string} isoDate - Date au format ISO
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date formatée
 * @example formatDate("2025-10-10T14:30:00.000Z") // "10/10/2025"
 */
export function formatDate(isoDate: string, locale: string = 'fr-FR'): string {
  try {
    return new Date(isoDate).toLocaleDateString(locale);
  } catch {
    return isoDate;
  }
}

/**
 * Formate une date ISO en format date + heure
 * 
 * @param {string} isoDate - Date au format ISO
 * @param {string} locale - Locale (défaut: 'fr-FR')
 * @returns {string} Date et heure formatées
 */
export function formatDateTime(isoDate: string, locale: string = 'fr-FR'): string {
  try {
    return new Date(isoDate).toLocaleString(locale);
  } catch {
    return isoDate;
  }
}

/**
 * Calcule le temps relatif ("il y a 2 heures")
 * 
 * @param {string} isoDate - Date au format ISO
 * @param {string} locale - Locale (défaut: 'fr')
 * @returns {string} Temps relatif
 */
export function relativeTime(isoDate: string, locale: string = 'fr'): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return locale === 'fr' ? 'À l\'instant' : 'Just now';
    if (diffMins < 60) return locale === 'fr' ? `Il y a ${diffMins} min` : `${diffMins} min ago`;
    if (diffHours < 24) return locale === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
    if (diffDays < 7) return locale === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`;
    
    return formatDate(isoDate, locale === 'fr' ? 'fr-FR' : 'en-US');
  } catch {
    return isoDate;
  }
}

/**
 * Vérifie si une clé API est valide (format OpenAI)
 * 
 * @param {string} apiKey - Clé API à vérifier
 * @returns {boolean} true si format valide
 */
export function isValidApiKey(apiKey: string): boolean {
  return /^sk-[A-Za-z0-9]{48}$/.test(apiKey);
}

/**
 * Masque une clé API pour l'affichage (garde début et fin)
 * 
 * @param {string} apiKey - Clé API à masquer
 * @returns {string} Clé masquée (ex: "sk-abc...xyz")
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) return '***';
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-3)}`;
}

/**
 * Debounce une fonction (retarde l'exécution)
 * 
 * @param {Function} func - Fonction à debouncer
 * @param {number} delay - Délai en ms
 * @returns {Function} Fonction debouncée
 * @example
 * const search = debounce((query) => console.log(query), 300);
 * search('hello'); // Attendra 300ms avant d'exécuter
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle une fonction (limite la fréquence d'exécution)
 * 
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Délai minimum entre exécutions (ms)
 * @returns {Function} Fonction throttlée
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Copie du texte dans le presse-papiers
 * 
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} true si succès
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback pour anciens navigateurs
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Télécharge un fichier (export JSON, etc.)
 * 
 * @param {string} content - Contenu du fichier
 * @param {string} filename - Nom du fichier
 * @param {string} mimeType - Type MIME (défaut: 'text/plain')
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Lit un fichier uploadé
 * 
 * @param {File} file - Fichier à lire
 * @returns {Promise<string>} Contenu du fichier
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Erreur lecture fichier'));
    reader.readAsText(file);
  });
}

/**
 * Détecte si on est sur mobile
 * 
 * @returns {boolean} true si appareil mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Détecte si on est sur iOS
 * 
 * @returns {boolean} true si iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Détecte si on est en mode standalone (PWA installée)
 * 
 * @returns {boolean} true si PWA installée
 */
export function isStandalone(): boolean {
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Attend un délai (promesse)
 * 
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 * @example await sleep(1000); // Attend 1 seconde
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry une fonction async avec backoff exponentiel
 * 
 * @param {Function} fn - Fonction async à retry
 * @param {number} maxRetries - Nombre max de tentatives
 * @param {number} baseDelay - Délai de base en ms
 * @returns {Promise<T>} Résultat de la fonction
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Valide un objet Task
 * 
 * @param {any} obj - Objet à valider
 * @returns {boolean} true si valide
 */
export function isValidTask(obj: any): boolean {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.rawText === 'string' &&
    (obj.status === 'active' || obj.status === 'done') &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  );
}

/**
 * Nettoie un objet en supprimant les valeurs null/undefined
 * 
 * @param {Record<string, any>} obj - Objet à nettoyer
 * @returns {Record<string, any>} Objet nettoyé
 */
export function cleanObject(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Fusionne deux tableaux sans doublons (par ID)
 * 
 * @param {Array<{id: string}>} arr1 - Premier tableau
 * @param {Array<{id: string}>} arr2 - Deuxième tableau
 * @returns {Array<{id: string}>} Tableau fusionné
 */
export function mergeById<T extends { id: string }>(arr1: T[], arr2: T[]): T[] {
  const map = new Map<string, T>();
  [...arr1, ...arr2].forEach(item => map.set(item.id, item));
  return Array.from(map.values());
}

/**
 * Trie un tableau d'objets par date (ISO)
 * 
 * @param {Array<{createdAt: string}>} items - Tableau à trier
 * @param {boolean} ascending - Tri ascendant (défaut: false)
 * @returns {Array<{createdAt: string}>} Tableau trié
 */
export function sortByDate<T extends { createdAt: string }>(
  items: T[],
  ascending: boolean = false
): T[] {
  return [...items].sort((a, b) => {
    const comparison = a.createdAt.localeCompare(b.createdAt);
    return ascending ? comparison : -comparison;
  });
}

/**
 * Groupe des éléments par clé
 * 
 * @param {Array<T>} items - Tableau d'éléments
 * @param {Function} keyFn - Fonction pour extraire la clé
 * @returns {Map<K, T[]>} Map groupée
 * @example groupBy(tasks, t => t.status) // Map { 'active' => [...], 'done' => [...] }
 */
export function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  return items.reduce((map, item) => {
    const key = keyFn(item);
    const group = map.get(key) || [];
    group.push(item);
    map.set(key, group);
    return map;
  }, new Map<K, T[]>());
}

/**
 * Compte les occurrences dans un tableau
 * 
 * @param {Array<T>} items - Tableau d'éléments
 * @returns {Map<T, number>} Map de comptage
 */
export function countOccurrences<T>(items: T[]): Map<T, number> {
  return items.reduce((map, item) => {
    map.set(item, (map.get(item) || 0) + 1);
    return map;
  }, new Map<T, number>());
}