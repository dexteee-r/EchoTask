// src/ui/TaskItem.tsx
import React from 'react';
import { Task } from '../db';

interface TaskItemProps {
  task: Task;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  toggleLabel: string;
  deleteLabel?: string;
}

/**
 * Composant TaskItem - Affiche une tâche individuelle
 * 
 * @param task - La tâche à afficher
 * @param onToggleDone - Callback pour marquer fait/non fait
 * @param onDelete - Callback pour supprimer la tâche
 * @param toggleLabel - Libellé pour le bouton toggle (traduction)
 * @param deleteLabel - Libellé optionnel pour le bouton supprimer
 */
export default function TaskItem({ 
  task, 
  onToggleDone, 
  onDelete, 
  toggleLabel,
  deleteLabel = "🗑"
}: TaskItemProps) {
  
  return (
    <li 
      style={{ 
        borderBottom: '1px solid #eee', 
        padding: '10px 0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}
    >
      {/* Bouton toggle fait/non fait */}
      <button
        type="button"
        onClick={() => onToggleDone(task.id)}
        aria-label="toggle"
        title={toggleLabel}
        style={{ 
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontSize: '1.2em'
        }}
      >
        {task.status === 'done' ? '☑' : '☐'}
      </button>

      {/* Contenu de la tâche */}
      <div style={{ flex: 1, margin: '0 8px' }}>
        {/* Texte brut (rawText) */}
        <div 
          style={{ 
            fontWeight: 600, 
            textDecoration: task.status === 'done' ? 'line-through' : 'none' 
          }}
        >
          {task.rawText}
        </div>

        {/* Texte amélioré (cleanText) si présent */}
        {task.cleanText && (
          <div style={{ color: '#666', marginTop: 4 }}>
            {task.cleanText}
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="chips" style={{ marginTop: 6 }}>
            {task.tags.map(tag => (
              <span className="chip" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bouton supprimer */}
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label="delete"
        style={{ 
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontSize: '1.2em'
        }}
      >
        {deleteLabel}
      </button>
    </li>
  );
}