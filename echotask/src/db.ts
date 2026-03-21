// src/db.ts
import Dexie, { Table } from 'dexie';
import { Task, TaskFilter } from './types';
import { STORAGE_KEYS, APP_CONFIG, SEPARATORS } from './constants';
import { nowIso, shortId } from './utils';

/** ID safe: génère toujours un UUID v4 valide, même sans crypto.randomUUID */
export function safeId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  // Fallback UUID v4 compatible (requis pour Supabase UUID primary key)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/** Détecte si IndexedDB est disponible (pas en Private mode iOS < 16, etc.) */
function hasIndexedDB(): boolean {
  try { return typeof indexedDB !== 'undefined'; } catch { return false; }
}

/** --- Dexie (si possible) --- */
class EchoTaskDB extends Dexie {
  tasks!: Table<Task, string>;
  constructor() {
    super(APP_CONFIG.DB_NAME);
    // On ajoute isDirty et user_id à l'index pour la synchronisation
    this.version(2).stores({ tasks: 'id, status, createdAt, isDirty, user_id' });
  }
}
const db = hasIndexedDB() ? new EchoTaskDB() : null;

/** --- Fallback localStorage --- */
function lsRead(): Task[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'); } catch { return []; }
}
function lsWrite(arr: Task[]) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(arr));
}

/** API unifiée (utilise Dexie si dispo, sinon localStorage) */
export async function createTask(t: Task): Promise<void> {
  // En mode cloud, on marque la tâche comme dirty lors de sa création locale
  const taskToSave = { ...t, isDirty: true };
  if (db) {
    await db.tasks.add(taskToSave);
    return;
  }
  const arr = lsRead(); 
  arr.unshift(taskToSave); 
  lsWrite(arr);
}

export async function listTasks(filter: TaskFilter = 'all', userId?: string): Promise<Task[]> {
  if (db) {
    let a: Task[] = await db.tasks.filter(t => !t.deleted && (!userId || t.user_id === userId)).toArray();
    if (filter !== 'all') a = a.filter(t => t.status === filter);
    return a.sort((b, c) => c.createdAt.localeCompare(b.createdAt));
  }
  const arr = lsRead().filter(t =>
    !t.deleted &&
    (!userId || t.user_id === userId) &&
    (filter === 'all' || t.status === filter)
  );
  return arr.sort((b, c) => c.createdAt.localeCompare(b.createdAt));
}

export async function toggleDone(id: string): Promise<void> {
  if (db) {
    const t = await db.tasks.get(id); 
    if (!t) return;
    const next = t.status === 'done' ? 'active' : 'done';
    await db.tasks.update(id, { status: next, updatedAt: nowIso(), isDirty: true });
    return;
  }
  const arr = lsRead();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) { 
    arr[i].status = arr[i].status==='done'?'active':'done'; 
    arr[i].updatedAt = nowIso(); 
    arr[i].isDirty = true;
  }
  lsWrite(arr);
}

export async function removeTask(id: string): Promise<void> {
  // Soft delete pour la synchro
  if (db) {
    await db.tasks.update(id, { deleted: true, isDirty: true, updatedAt: nowIso() });
    return;
  }
  const arr = lsRead();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) {
    arr[i].deleted = true;
    arr[i].isDirty = true;
    arr[i].updatedAt = nowIso();
    lsWrite(arr);
  }
}

export async function updateTask(t: Task): Promise<void> {
  const taskToSave = { ...t, isDirty: true };
  if (db) {
    await db.tasks.put(taskToSave);
    return;
  }
  const arr = lsRead();
  const i = arr.findIndex(x => x.id === t.id);
  if (i >= 0) { 
    arr[i] = taskToSave; 
    lsWrite(arr); 
  }
}

// --- Nouvelles fonctions pour la synchronisation ---

export async function getLocalDirtyTasks(): Promise<Task[]> {
  if (db) {
    return db.tasks.filter(t => !!t.isDirty).toArray();
  }
  return lsRead().filter(t => !!t.isDirty);
}

export async function markTaskAsSynced(id: string): Promise<void> {
  if (db) {
    await db.tasks.update(id, { isDirty: false });
    return;
  }
  const arr = lsRead();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) { arr[i].isDirty = false; lsWrite(arr); }
}

export async function bulkUpsertTasks(tasks: Task[]): Promise<void> {
  if (db) {
    await db.tasks.bulkPut(tasks);
    return;
  }
  let arr = lsRead();
  const map = new Map(arr.map(t => [t.id, t]));
  for (const t of tasks) {
    map.set(t.id, t);
  }
  lsWrite(Array.from(map.values()));
}

/** Export / Import JSON (compatible Dexie et LS) */
export async function exportTasksAsJSON(): Promise<string> {
  const all = db ? await db.tasks.toArray() : lsRead();
  return JSON.stringify({ version: 1, tasks: all }, null, 2);
}
export async function importTasksFromJSON(json: string): Promise<number> {
  const parsed = JSON.parse(json);
  const items: Task[] = Array.isArray(parsed?.tasks) ? parsed.tasks : [];
  if (db) { await db.tasks.bulkPut(items); return items.length; }
  const arr = lsRead(); lsWrite([...items, ...arr]); return items.length;
}