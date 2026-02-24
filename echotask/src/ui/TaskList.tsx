// src/ui/TaskList.tsx
import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
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
  onRemoveSubtask?: (taskId: string, subtaskId: string) => void;
  onReorder?: (orderedIds: string[]) => void;
  emptyMessage: string;
  toggleLabel: string;
  subtaskToggleLabel?: string;
  subtaskPlaceholder?: string;
  dragLabel?: string;
}

export default function TaskList({
  tasks,
  onToggleDone,
  onDelete,
  onEdit,
  onTagClick,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onReorder,
  emptyMessage,
  toggleLabel,
  subtaskToggleLabel,
  subtaskPlaceholder,
  dragLabel,
}: TaskListProps) {

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    onReorder?.(reordered.map(t => t.id));
  }

  if (tasks.length === 0) {
    return (
      <p style={{ color: '#666', marginTop: 16 }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <section style={{ marginTop: 16 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
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
                onRemoveSubtask={onRemoveSubtask}
                toggleLabel={toggleLabel}
                subtaskToggleLabel={subtaskToggleLabel}
                subtaskPlaceholder={subtaskPlaceholder}
                dragLabel={dragLabel}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}
