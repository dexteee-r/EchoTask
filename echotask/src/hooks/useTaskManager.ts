// src/hooks/useTaskManager.ts
import { useEffect, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, updateTask, safeId } from '../db';
import { Task, SubTask } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * Utilitaire : génère un ISO timestamp
 */
const nowIso = () => new Date().toISOString();

/**
 * Utilitaire : parse les tags depuis une chaîne (virgules)
 */
const parseTags = (s: string) =>
  s.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

/**
 * Charge l'ordre personnalisé depuis localStorage
 */
function loadOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASK_ORDER) || '[]');
  } catch {
    return [];
  }
}

/**
 * Sauvegarde l'ordre personnalisé dans localStorage
 */
function saveOrder(order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASK_ORDER, JSON.stringify(order));
  } catch {}
}

/**
 * Hook useTaskManager
 *
 * Gère toute la logique des tâches :
 * - Liste des tâches avec filtres (statut, recherche, tags)
 * - Ajout, suppression, toggle done
 * - Ordre personnalisé (drag & drop)
 * - Rafraîchissement automatique
 *
 * @returns {Object} Méthodes et état pour gérer les tâches
 */
export function useTaskManager() {
  // État des tâches
  const [tasks, setTasks] = useState<Task[]>([]);

  // Filtres
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Ordre personnalisé (drag & drop) — persisté en localStorage
  const [customOrder, setCustomOrder] = useState<string[]>(loadOrder);

  /**
   * Récupère les tags actifs du filtre
   */
  const activeFilterTags = () => parseTags(tagFilter);

  /**
   * Applique l'ordre personnalisé à une liste de tâches.
   * Si aucun ordre n'est défini, utilise le tri par date d'échéance puis création.
   */
  function applyOrder(items: Task[]): Task[] {
    if (customOrder.length === 0) {
      // Tri automatique : échéances en tête, puis plus récentes en premier
      return [...items].sort((a, b) => {
        if (a.due && b.due) return a.due.localeCompare(b.due);
        if (a.due) return -1;
        if (b.due) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    // Tri selon l'ordre drag & drop
    const orderMap = new Map(customOrder.map((id, i) => [id, i]));
    return [...items].sort((a, b) => {
      const ia = orderMap.has(a.id) ? orderMap.get(a.id)! : customOrder.length;
      const ib = orderMap.has(b.id) ? orderMap.get(b.id)! : customOrder.length;
      return ia - ib;
    });
  }

  /**
   * Rafraîchit la liste avec tous les filtres appliqués
   * (statut, recherche texte, tags, ordre personnalisé)
   */
  async function refresh() {
    const rows = await listTasks(filter);
    const q = search.trim().toLowerCase();
    const tags = activeFilterTags();

    const filtered = rows.filter(tk => {
      const matchText =
        !q ||
        tk.rawText?.toLowerCase().includes(q) ||
        (tk.cleanText || '').toLowerCase().includes(q);

      const matchTags =
        tags.length === 0 ||
        tags.every(tag => (tk.tags || []).map(s => s.toLowerCase()).includes(tag));

      return matchText && matchTags;
    });

    setTasks(applyOrder(filtered));
  }

  // Rafraîchir quand les filtres ou l'ordre changent
  useEffect(() => {
    refresh();
  }, [filter, search, tagFilter, customOrder]);

  /**
   * Ajoute une nouvelle tâche — la place en tête de l'ordre personnalisé
   */
  async function add(raw: string, cleanText?: string | null, tagsStr?: string, due?: string | null) {
    const task: Task = {
      id: safeId(),
      rawText: raw,
      cleanText: cleanText ?? null,
      status: 'active',
      tags: parseTags(tagsStr || ''),
      due: due ?? null,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await createTask(task);

    // Si un ordre personnalisé est actif, prepend la nouvelle tâche
    if (customOrder.length > 0) {
      const newOrder = [task.id, ...customOrder];
      setCustomOrder(newOrder);
      saveOrder(newOrder);
    }

    await refresh();
  }

  /**
   * Toggle le statut fait/non fait d'une tâche
   */
  async function toggle(id: string) {
    await toggleDone(id);
    await refresh();
  }

  /**
   * Supprime une tâche — la retire aussi de l'ordre personnalisé
   */
  async function remove(id: string) {
    await removeTask(id);
    if (customOrder.includes(id)) {
      const newOrder = customOrder.filter(oid => oid !== id);
      setCustomOrder(newOrder);
      saveOrder(newOrder);
    }
    await refresh();
  }

  /**
   * Met à jour une tâche existante
   */
  async function update(task: Task) {
    await updateTask(task);
    await refresh();
  }

  /**
   * Ajoute une sous-tâche à une tâche existante
   */
  async function addSubtask(taskId: string, text: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !text.trim()) return;
    const sub: SubTask = { id: safeId(), text: text.trim(), done: false };
    await updateTask({
      ...task,
      subtasks: [...(task.subtasks || []), sub],
      updatedAt: nowIso()
    });
    await refresh();
  }

  /**
   * Toggle le statut fait/non fait d'une sous-tâche
   */
  async function toggleSubtask(taskId: string, subtaskId: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTask({
      ...task,
      subtasks: (task.subtasks || []).map(s =>
        s.id === subtaskId ? { ...s, done: !s.done } : s
      ),
      updatedAt: nowIso()
    });
    await refresh();
  }

  /**
   * Supprime une sous-tâche d'une tâche existante
   */
  async function removeSubtask(taskId: string, subtaskId: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTask({
      ...task,
      subtasks: (task.subtasks || []).filter(s => s.id !== subtaskId),
      updatedAt: nowIso()
    });
    await refresh();
  }

  /**
   * Achève une tâche : status → done + toutes les sous-tâches → done
   */
  async function completeTask(taskId: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTask({
      ...task,
      status: 'done',
      subtasks: (task.subtasks || []).map(s => ({ ...s, done: true })),
      updatedAt: nowIso()
    });
    await refresh();
  }

  /**
   * Réordonne les tâches selon un tableau d'IDs (résultat d'un drag & drop).
   * Persiste l'ordre dans localStorage.
   */
  function reorderTasks(orderedIds: string[]) {
    // Inclure les IDs déjà connus mais absents de orderedIds (ex: filtre actif)
    const allKnown = customOrder.length > 0 ? customOrder : tasks.map(t => t.id);
    const extras = allKnown.filter(id => !orderedIds.includes(id));
    const merged = [...orderedIds, ...extras];
    setCustomOrder(merged);
    saveOrder(merged);
  }

  // API publique du hook
  return {
    tasks,
    filter,
    search,
    tagFilter,

    setFilter,
    setSearch,
    setTagFilter,

    add,
    toggle,
    remove,
    update,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    completeTask,
    reorderTasks,
    refresh,
  };
}
