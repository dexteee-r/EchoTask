// src/ui/TaskList.tsx
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onAddSubtask?: (taskId: string, text: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  emptyMessage: string;
  toggleLabel: string;
  completeLabel?: string;
  subtaskToggleLabel?: string;
  subtaskPlaceholder?: string;
}

export default function TaskList({
  tasks,
  onToggleDone,
  onDelete,
  onEdit,
  onTagClick,
  onAddSubtask,
  onToggleSubtask,
  onCompleteTask,
  emptyMessage,
  toggleLabel,
  completeLabel,
  subtaskToggleLabel,
  subtaskPlaceholder,
}: TaskListProps) {

  if (tasks.length === 0) {
    return (
      <p style={{ color: '#666', marginTop: 16 }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <section style={{ marginTop: 16 }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((task, idx) => (
          <TaskItem
            key={task.id}
            task={task}
            index={idx}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            onEdit={onEdit}
            onTagClick={onTagClick}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            onCompleteTask={onCompleteTask}
            toggleLabel={toggleLabel}
            completeLabel={completeLabel}
            subtaskToggleLabel={subtaskToggleLabel}
            subtaskPlaceholder={subtaskPlaceholder}
          />
        ))}
      </ul>
    </section>
  );
}
