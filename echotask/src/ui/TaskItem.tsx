// src/ui/TaskItem.tsx (Modernisé)
import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  toggleLabel: string;
  deleteLabel?: string;
}

/**
 * Composant TaskItem - Affiche une tâche individuelle (Modernisé)
 * 
 * Utilise le Design System pour :
 * - Card avec hover effect
 * - Transitions douces
 * - Couleurs cohérentes
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
      className="card fade-in"
      style={{ 
        marginBottom: 'var(--space-3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-3)',
        transition: 'all var(--transition-base)',
      }}
    >
      {/* Bouton toggle */}
      <button
        type="button"
        onClick={() => onToggleDone(task.id)}
        aria-label="toggle"
        title={toggleLabel}
        style={{ 
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          transition: 'all var(--transition-fast)',
          color: task.status === 'done' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-secondary)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {task.status === 'done' ? '☑' : '☐'}
      </button>

      {/* Contenu de la tâche */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Texte brut (rawText) */}
        <div 
          style={{ 
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            opacity: task.status === 'done' ? 0.6 : 1,
            marginBottom: task.cleanText ? 'var(--space-1)' : 0,
            transition: 'all var(--transition-base)',
          }}
        >
          {task.rawText}
        </div>

        {/* Texte amélioré (cleanText) */}
        {task.cleanText && (
          <div 
            style={{ 
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
              lineHeight: 'var(--leading-relaxed)',
            }}
          >
            {task.cleanText}
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="chips" style={{ marginTop: 'var(--space-2)' }}>
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
          fontSize: '1.25rem',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          transition: 'all var(--transition-fast)',
          color: 'var(--color-text-tertiary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-error-light)';
          e.currentTarget.style.color = 'var(--color-error)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
          e.currentTarget.style.color = 'var(--color-text-tertiary)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {deleteLabel}
      </button>
    </li>
  );
}