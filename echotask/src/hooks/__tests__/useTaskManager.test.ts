import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskManager } from '../useTaskManager';
import * as db from '../../db';
import { Task } from '../../types';

// Mock du module db
vi.mock('../../db', () => ({
  createTask: vi.fn(),
  listTasks: vi.fn(),
  removeTask: vi.fn(),
  toggleDone: vi.fn(),
  updateTask: vi.fn(),
  safeId: () => 'test-id-' + Math.random().toString(36).substr(2, 9),
}));

describe('useTaskManager hook', () => {
  let mockTasks: Task[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockTasks = [
      {
        id: '1',
        rawText: 'Task 1',
        status: 'active',
        createdAt: '2026-03-12T10:00:00Z',
        updatedAt: '2026-03-12T10:00:00Z',
        tags: ['work']
      },
      {
        id: '2',
        rawText: 'Task 2',
        status: 'done',
        createdAt: '2026-03-12T11:00:00Z',
        updatedAt: '2026-03-12T11:00:00Z',
        tags: ['personal']
      }
    ];

    // Configuration par défaut des mocks
    (db.listTasks as any).mockImplementation(async (filter: string) => {
      if (filter === 'all') return mockTasks;
      return mockTasks.filter(t => t.status === filter);
    });

    (db.createTask as any).mockImplementation(async (t: Task) => {
      mockTasks.push(t);
    });

    (db.removeTask as any).mockImplementation(async (id: string) => {
      mockTasks = mockTasks.filter(t => t.id !== id);
    });

    (db.toggleDone as any).mockImplementation(async (id: string) => {
      const t = mockTasks.find(x => x.id === id);
      if (t) t.status = t.status === 'done' ? 'active' : 'done';
    });

    (db.updateTask as any).mockImplementation(async (t: Task) => {
      const i = mockTasks.findIndex(x => x.id === t.id);
      if (i >= 0) mockTasks[i] = t;
    });

    // Nettoyer localStorage
    localStorage.clear();
  });

  it('should load tasks on mount', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    // Attendre le premier refresh()
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(db.listTasks).toHaveBeenCalled();
  });

  it('should filter tasks by status', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    await act(async () => {
      result.current.setFilter('active');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('1');
  });

  it('should search tasks by text', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    await act(async () => {
      result.current.setSearch('Task 2');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].rawText).toBe('Task 2');
  });

  it('should add a new task', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    await act(async () => {
      await result.current.add('New Task', null, 'urgent');
    });

    expect(db.createTask).toHaveBeenCalled();
    expect(result.current.tasks.some(t => t.rawText === 'New Task')).toBe(true);
  });

  it('should toggle task status', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    await act(async () => {
      await result.current.toggle('1');
    });

    expect(db.toggleDone).toHaveBeenCalledWith('1');
    // Après toggle, Task 1 devrait être 'done' dans notre mockTasks
    const t1 = mockTasks.find(t => t.id === '1');
    expect(t1?.status).toBe('done');
  });

  it('should remove a task', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    await act(async () => {
      await result.current.remove('1');
    });

    expect(db.removeTask).toHaveBeenCalledWith('1');
    expect(result.current.tasks.find(t => t.id === '1')).toBeUndefined();
  });

  it('should handle subtasks correctly', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    // Attendre le chargement initial
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Ajouter une sous-tâche à la tâche 1
    await act(async () => {
      await result.current.addSubtask('1', 'Subtask A');
    });

    expect(db.updateTask).toHaveBeenCalled();
    const t1 = result.current.tasks.find(t => t.id === '1');
    expect(t1?.subtasks).toHaveLength(1);
    expect(t1?.subtasks?.[0].text).toBe('Subtask A');

    // Toggle sous-tâche
    const subId = t1?.subtasks?.[0].id!;
    await act(async () => {
      await result.current.toggleSubtask('1', subId);
    });

    const t1Updated = result.current.tasks.find(t => t.id === '1');
    expect(t1Updated?.subtasks?.[0].done).toBe(true);
  });

  it('should filter by tags', async () => {
    const { result } = renderHook(() => useTaskManager());
    
    await act(async () => {
      result.current.setTagFilter('personal');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].tags).toContain('personal');
  });
});
