import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  createTask, 
  listTasks, 
  toggleDone, 
  removeTask, 
  updateTask,
  exportTasksAsJSON,
  importTasksFromJSON,
  safeId
} from '../db';
import { Task } from '../types';

describe('Database API (db.ts)', () => {
  
  const sampleTask: Task = {
    id: 'test-1',
    rawText: 'Buy milk',
    status: 'active',
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z',
    tags: ['shopping']
  };

  beforeEach(async () => {
    // Clear the DB before each test
    const tasks = await listTasks('all');
    for (const t of tasks) {
      await removeTask(t.id);
    }
  });

  it('should create and list a task', async () => {
    await createTask(sampleTask);
    const tasks = await listTasks('all');
    
    expect(tasks).toHaveLength(1);
    expect(tasks[0].rawText).toBe('Buy milk');
    expect(tasks[0].id).toBe('test-1');
  });

  it('should filter tasks by status', async () => {
    await createTask(sampleTask); // active
    await createTask({
      ...sampleTask,
      id: 'test-2',
      status: 'done',
      rawText: 'Finished task'
    });

    const activeTasks = await listTasks('active');
    const doneTasks = await listTasks('done');
    const allTasks = await listTasks('all');

    expect(activeTasks).toHaveLength(1);
    expect(doneTasks).toHaveLength(1);
    expect(allTasks).toHaveLength(2);
  });

  it('should toggle task status', async () => {
    await createTask(sampleTask);
    await toggleDone('test-1');
    
    let tasks = await listTasks('done');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe('done');

    await toggleDone('test-1');
    tasks = await listTasks('active');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe('active');
  });

  it('should remove a task', async () => {
    await createTask(sampleTask);
    await removeTask('test-1');
    
    const tasks = await listTasks('all');
    expect(tasks).toHaveLength(0);
  });

  it('should update a task', async () => {
    await createTask(sampleTask);
    const updated = { ...sampleTask, rawText: 'Buy soy milk', tags: ['shopping', 'vegan'] };
    await updateTask(updated);
    
    const tasks = await listTasks('all');
    expect(tasks[0].rawText).toBe('Buy soy milk');
    expect(tasks[0].tags).toContain('vegan');
  });

  it('should export and import tasks via JSON', async () => {
    await createTask(sampleTask);
    const json = await exportTasksAsJSON();
    
    // Clear DB
    await removeTask(sampleTask.id);
    expect(await listTasks('all')).toHaveLength(0);

    // Import
    const count = await importTasksFromJSON(json);
    expect(count).toBe(1);
    
    const tasks = await listTasks('all');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].rawText).toBe('Buy milk');
  });

  it('should generate a safe ID', () => {
    const id = safeId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

});
