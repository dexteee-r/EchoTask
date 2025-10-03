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

class EchoTaskDB extends Dexie {
  tasks!: Table<Task, string>;
  constructor() {
    super('echotask');
    this.version(1).stores({
      tasks: 'id, status, createdAt'
    });
  }
}
export const db = new EchoTaskDB();

export async function createTask(t: Task) { await db.tasks.add(t); }
export async function listTasks(filter: 'all'|'active'|'done'='all') {
  const coll = filter==='all' ? db.tasks : db.tasks.where('status').equals(filter);
  return coll.reverse().sortBy('createdAt').then(arr => arr.reverse());
}
export async function toggleDone(id: string) {
  const t = await db.tasks.get(id); if (!t) return;
  await db.tasks.update(id, { status: t.status==='done'?'active':'done', updatedAt: new Date().toISOString() });
}
export async function removeTask(id: string) { await db.tasks.delete(id); }
export async function updateTask(t: Task) { await db.tasks.put(t); }


export async function exportTasksAsJSON(): Promise<string> {
  const all = await db.tasks.toArray();
  return JSON.stringify({ version: 1, tasks: all }, null, 2);
}

export async function importTasksFromJSON(json: string): Promise<number> {
  const parsed = JSON.parse(json);
  if (!parsed || !Array.isArray(parsed.tasks)) throw new Error("Fichier invalide");
  await db.tasks.bulkPut(parsed.tasks);
  return parsed.tasks.length;
}