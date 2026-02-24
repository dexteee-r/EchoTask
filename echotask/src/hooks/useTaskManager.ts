// src/hooks/useTaskManager.ts
import { useEffect, useState } from 'react';
import { createTask, listTasks, removeTask, toggleDone, updateTask, safeId } from '../db';
import { Task, SubTask } from '../types';

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
 * Hook useTaskManager
 * 
 * Gère toute la logique des tâches :
 * - Liste des tâches avec filtres (statut, recherche, tags)
 * - Ajout, suppression, toggle done
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

  /**
   * Récupère les tags actifs du filtre
   */
  const activeFilterTags = () => parseTags(tagFilter);

  /**
   * Récupère la liste de base selon le filtre de statut
   */
  async function baseList() {
    return await listTasks(filter);
  }

  /**
   * Rafraîchit la liste avec tous les filtres appliqués
   * (statut, recherche texte, tags)
   */
  async function refresh() {
    const rows = await baseList();
    const q = search.trim().toLowerCase();
    const tags = activeFilterTags();

    const filtered = rows.filter(tk => {
      // Filtre recherche texte
      const matchText =
        !q ||
        tk.rawText?.toLowerCase().includes(q) ||
        (tk.cleanText || '').toLowerCase().includes(q);

      // Filtre tags (tous les tags doivent être présents)
      const matchTags =
        tags.length === 0 ||
        tags.every(tag => (tk.tags || []).map(s => s.toLowerCase()).includes(tag));

      return matchText && matchTags;
    });

    // Tri : tâches avec échéance en premier (date ASC → overdue apparaît en tête),
    // puis tâches sans échéance triées par date de création DESC
    const sorted = [...filtered].sort((a, b) => {
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setTasks(sorted);
  }

  // Rafraîchir automatiquement quand les filtres changent
  useEffect(() => {
    refresh();
  }, [filter, search, tagFilter]);

  /**
   * Ajoute une nouvelle tâche
   *
   * @param raw - Texte brut de la tâche
   * @param cleanText - Texte amélioré (optionnel)
   * @param tagsStr - Tags séparés par virgules (optionnel)
   * @param due - Date d'échéance YYYY-MM-DD (optionnel)
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
    await refresh();
  }

  /**
   * Toggle le statut fait/non fait d'une tâche
   * 
   * @param id - ID de la tâche
   */
  async function toggle(id: string) {
    await toggleDone(id);
    await refresh();
  }

  /**
   * Supprime une tâche
   * 
   * @param id - ID de la tâche
   */
  async function remove(id: string) {
    await removeTask(id);
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

  // API publique du hook
  return {
    // État
    tasks,
    filter,
    search,
    tagFilter,

    // Setters des filtres
    setFilter,
    setSearch,
    setTagFilter,

    // Actions
    add,
    toggle,
    remove,
    update,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    completeTask,
    refresh
  };
}