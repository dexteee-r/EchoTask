// src/db.ts
import Dexie, { Table } from 'dexie';

export type Task = {
  id: string;
  rawText: string;
  cleanText?: string | null;
  status: 'active' | 'done';
  tags?: string[];
  due?: string | null;
  createdAt: string;
  updatedAt: string;
};

/** ID safe: marche même sans crypto.randomUUID (HTTP, iOS PWA) */
export function safeId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Détecte si IndexedDB est disponible (pas en Private mode iOS < 16, etc.) */
function hasIndexedDB(): boolean {
  try { return typeof indexedDB !== 'undefined'; } catch { return false; }
}

/** --- Dexie (si possible) --- */
class EchoTaskDB extends Dexie {
  tasks!: Table<Task, string>;
  constructor() {
    super('echotask');
    // index sur id, status, createdAt
    this.version(1).stores({ tasks: 'id, status, createdAt' });
  }
}
const db = hasIndexedDB() ? new EchoTaskDB() : null;

/** --- Fallback localStorage --- */
const LS_KEY = 'echotask_tasks';
function lsRead(): Task[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsWrite(arr: Task[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

/** API unifiée (utilise Dexie si dispo, sinon localStorage) */
export async function createTask(t: Task): Promise<void> {
  if (db) return db.tasks.add(t);
  const arr = lsRead(); arr.unshift(t); lsWrite(arr);
}

export async function listTasks(filter: 'all'|'active'|'done'='all'): Promise<Task[]> {
  if (db) {
    if (filter === 'all') return db.tasks.toArray().then(a => a.sort((b,c)=> c.createdAt.localeCompare(b.createdAt)));
    const a = await db.tasks.where('status').equals(filter).toArray();
    return a.sort((b,c)=> c.createdAt.localeCompare(b.createdAt));
  }
  const arr = lsRead().filter(t => filter==='all' ? true : t.status===filter);
  return arr.sort((b,c)=> c.createdAt.localeCompare(b.createdAt));
}

export async function toggleDone(id: string): Promise<void> {
  if (db) {
    const t = await db.tasks.get(id); if (!t) return;
    const next = t.status === 'done' ? 'active' : 'done';
    return db.tasks.update(id, { status: next, updatedAt: new Date().toISOString() });
  }
  const arr = lsRead();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) { arr[i].status = arr[i].status==='done'?'active':'done'; arr[i].updatedAt = new Date().toISOString(); }
  lsWrite(arr);
}

export async function removeTask(id: string): Promise<void> {
  if (db) return db.tasks.delete(id);
  lsWrite(lsRead().filter(t => t.id !== id));
}

export async function updateTask(t: Task): Promise<void> {
  if (db) return db.tasks.put(t);
  const arr = lsRead();
  const i = arr.findIndex(x => x.id === t.id);
  if (i >= 0) { arr[i] = t; lsWrite(arr); }
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
