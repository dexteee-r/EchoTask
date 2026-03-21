import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskItem from '../TaskItem';
import { Task } from '../../types';

// Mock i18n
vi.mock('../../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    lang: 'fr'
  })
}));

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    attributes: {},
    listeners: {},
    isDragging: false
  })
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => ''
    }
  }
}));

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: '1',
    rawText: 'Test Task',
    cleanText: 'Clean Test Task',
    status: 'active',
    tags: ['urgent', 'work'],
    createdAt: '2026-03-12T10:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z',
    subtasks: [
      { id: 's1', text: 'Sub 1', done: false },
      { id: 's2', text: 'Sub 2', done: true }
    ],
    due: '2026-03-12' // Set to today for testing badge
  };

  const defaultProps = {
    task: mockTask,
    onToggleDone: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onTagClick: vi.fn(),
    onAddSubtask: vi.fn(),
    onToggleSubtask: vi.fn(),
    onRemoveSubtask: vi.fn(),
    toggleLabel: 'Toggle',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup fake timers for date testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T12:00:00Z'));
  });

  it('renders task content correctly', () => {
    render(<TaskItem {...defaultProps} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Clean Test Task')).toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
  });

  it('calls onToggleDone when clicking the checkbox button', () => {
    render(<TaskItem {...defaultProps} />);
    const toggleBtn = screen.getByLabelText('task.markDone'); // From mock t()
    fireEvent.click(toggleBtn);
    expect(defaultProps.onToggleDone).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when clicking edit button', () => {
    render(<TaskItem {...defaultProps} />);
    const editBtn = screen.getByLabelText('edit.title');
    fireEvent.click(editBtn);
    expect(defaultProps.onEdit).toHaveBeenCalledWith('1');
  });

  it('sets exit class when clicking delete button', async () => {
    render(<TaskItem {...defaultProps} />);
    const deleteBtn = screen.getByLabelText('task.delete');
    fireEvent.click(deleteBtn);
    
    // The component sets isRemoving=true, which triggers taskExit animation
    const li = screen.getByRole('listitem');
    expect(li).toHaveClass('task-exit');
    
    // Note: We don't test onAnimationEnd call because JSDOM doesn't handle it well
  });

  it('renders due date badge correctly (today)', () => {
    render(<TaskItem {...defaultProps} />);
    // Since mock system time is 2026-03-12 and due is 2026-03-12
    expect(screen.getByText('due.today')).toBeInTheDocument();
  });

  it('expands subtasks and interacts with them', () => {
    render(<TaskItem {...defaultProps} />);
    
    const expandBtn = screen.getByLabelText('sous-tâches');
    fireEvent.click(expandBtn);
    
    expect(screen.getByText('Sub 1')).toBeInTheDocument();
    expect(screen.getByText('Sub 2')).toBeInTheDocument();
    
    // Toggle subtask
    const sub1Btn = screen.getByText('Sub 1').previousElementSibling as HTMLButtonElement;
    fireEvent.click(sub1Btn);
    expect(defaultProps.onToggleSubtask).toHaveBeenCalledWith('1', 's1');
  });

  it('calls onAddSubtask when adding a new subtask', () => {
    render(<TaskItem {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Ajouter…');
    fireEvent.change(input, { target: { value: 'New Sub' } });
    
    const addBtn = screen.getByText('+');
    fireEvent.click(addBtn);
    
    expect(defaultProps.onAddSubtask).toHaveBeenCalledWith('1', 'New Sub');
  });

  it('copies file path to clipboard', async () => {
    // Disable fake timers for this test to avoid waitFor timeout
    vi.useRealTimers();
    
    const taskWithPath = { ...mockTask, filePath: '/path/to/file' };
    
    // Mock clipboard
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true
    });

    render(<TaskItem {...defaultProps} task={taskWithPath} />);
    
    const copyBtn = screen.getByLabelText('task.filepath.copy');
    fireEvent.click(copyBtn);
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('/path/to/file');
    
    await waitFor(() => {
      expect(screen.getByLabelText('task.filepath.copied')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
