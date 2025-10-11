// src/ui/TaskList.tsx
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void; 
  emptyMessage: string;
  toggleLabel: string;
}

/**
 * Composant TaskList - Affiche la liste complète des tâches
 * 
 * Gère :
 * - Affichage d'un message si liste vide
 * - Rendu de chaque TaskItem
 * - Transmission des callbacks aux items
 * 
 * @param tasks - Tableau des tâches à afficher
 * @param onToggleDone - Callback pour marquer fait/non fait
 * @param onDelete - Callback pour supprimer une tâche
 * @param emptyMessage - Message affiché si la liste est vide
 * @param toggleLabel - Libellé pour le bouton toggle (traduction)
 */
export default function TaskList({ 
  tasks, 
  onToggleDone, 
  onDelete,
  onEdit, 
  emptyMessage, 
  toggleLabel 
}: TaskListProps) {
  
  // Afficher un message si aucune tâche
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
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            onEdit={onEdit}
            toggleLabel={toggleLabel}
          />
        ))}
      </ul>
    </section>
  );
}