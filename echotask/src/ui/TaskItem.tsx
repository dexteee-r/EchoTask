// src/ui/TaskItem.tsx
import React, { useState, useRef } from 'react';
import { Task } from '../types';
import { useI18n } from '../i18n';

interface TaskItemProps {
  task: Task;
  index?: number;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onTagClick?: (tag: string) => void;
  onAddSubtask?: (taskId: string, text: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onRemoveSubtask?: (taskId: string, subtaskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  toggleLabel: string;
  editLabel?: string;
  deleteLabel?: string;
  completeLabel?: string;
  subtaskToggleLabel?: string;
  subtaskPlaceholder?: string;
}

export default function TaskItem({
  task,
  index = 0,
  onToggleDone,
  onDelete,
  onEdit,
  onTagClick,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onCompleteTask,
  toggleLabel,
  editLabel = "✏️",
  deleteLabel = "🗑",
  completeLabel = "Achever",
  subtaskToggleLabel = "sous-tâches",
  subtaskPlaceholder = "Ajouter…",
}: TaskItemProps) {
  const { t } = useI18n();
  const [isRemoving, setIsRemoving] = useState(false);
  const isRemovingRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSub, setNewSub] = useState('');

  const subtasks = task.subtasks || [];
  const doneSubs = subtasks.filter(s => s.done).length;

  // Calcule le badge d'échéance (null si pas de date)
  const dueInfo = (() => {
    if (!task.due) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due + 'T00:00:00');
    const diff = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
    if (diff < 0)   return { label: t('due.overdue'),  color: 'var(--color-error)',          bg: 'var(--color-error-light)'   };
    if (diff === 0) return { label: t('due.today'),    color: 'var(--color-primary)',        bg: 'var(--color-primary-light)' };
    if (diff === 1) return { label: t('due.tomorrow'), color: 'var(--color-primary)',        bg: 'var(--color-primary-light)' };
    if (diff === 2) return { label: t('due.in2'),      color: 'var(--color-primary)',        bg: 'var(--color-primary-light)' };
    if (diff === 3) return { label: t('due.in3'),      color: 'var(--color-primary)',        bg: 'var(--color-primary-light)' };
    if (diff === 4) return { label: t('due.in4'),      color: 'var(--color-primary)',        bg: 'var(--color-primary-light)' };
    if (diff === 5) return { label: t('due.in5'),      color: 'var(--color-primary)',        bg: 'var(--color-primary-light)' };
    return { label: task.due, color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-secondary)' };
  })();

  function handleDelete() {
    isRemovingRef.current = true;
    setIsRemoving(true);
  }

  function handleAnimationEnd(e: React.AnimationEvent<HTMLLIElement>) {
    if (isRemovingRef.current && e.animationName === 'taskExit') {
      onDelete(task.id);
    }
  }

  function handleAddSub() {
    if (!newSub.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, newSub.trim());
    setNewSub('');
  }

  return (
    <li
      className={`card ${isRemoving ? 'task-exit' : 'task-enter'}`}
      style={{
        '--task-index': Math.min(index, 7),
        marginBottom: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow var(--transition-base)',
      } as React.CSSProperties}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* === Rangée principale === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>

        {/* Bouton toggle done */}
        <button
          type="button"
          onClick={() => onToggleDone(task.id)}
          aria-label={task.status === 'done' ? t('task.markActive') : t('task.markDone')}
          aria-pressed={task.status === 'done'}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            transition: 'transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1)',
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
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        >
          {task.status === 'done' ? '☑' : '☐'}
        </button>

        {/* Contenu de la tâche */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            opacity: task.status === 'done' ? 0.6 : 1,
            marginBottom: task.cleanText ? 'var(--space-1)' : 0,
            transition: 'opacity var(--transition-base), text-decoration var(--transition-base)',
          }}>
            {task.rawText}
          </div>

          {task.cleanText && (
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
              lineHeight: 'var(--leading-relaxed)',
            }}>
              {task.cleanText}
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="chips" style={{ marginTop: 'var(--space-2)' }}>
              {task.tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="chip"
                  onClick={() => onTagClick?.(tag)}
                  aria-label={`Filtrer par #${tag}`}
                  style={{
                    cursor: onTagClick ? 'pointer' : 'default',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    font: 'inherit',
                    transition: 'transform 150ms cubic-bezier(0, 0, 0.58, 1)',
                  }}
                  onMouseEnter={e => { if (onTagClick) e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseDown={e => { if (onTagClick) e.currentTarget.style.transform = 'scale(0.96)'; }}
                  onMouseUp={e => { if (onTagClick) e.currentTarget.style.transform = 'scale(1.06)'; }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {dueInfo && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <span style={{
                display: 'inline-block',
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                color: dueInfo.color,
                background: dueInfo.bg,
                letterSpacing: '0.02em',
                transition: 'background var(--transition-base)',
              }}>
                {dueInfo.label}
              </span>
            </div>
          )}
        </div>

        {/* Bouton Achever — visible uniquement sur les tâches actives */}
        {task.status === 'active' && onCompleteTask && (
          <button
            type="button"
            onClick={() => onCompleteTask(task.id)}
            aria-label={completeLabel}
            title={completeLabel}
            style={{
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              padding: '3px var(--space-2)',
              borderRadius: 'var(--radius-md)',
              flexShrink: 0,
              color: 'var(--color-success)',
              letterSpacing: '0.02em',
              transition: 'transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-success-light, rgba(34,197,94,0.12))';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          >
            ✓ {completeLabel}
          </button>
        )}

        {/* Bouton éditer */}
        <button
          type="button"
          onClick={() => onEdit(task.id)}
          aria-label={t('edit.title')}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            transition: 'transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1), color 150ms cubic-bezier(0, 0, 0.58, 1)',
            color: 'var(--color-text-tertiary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary-light)';
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        >
          {editLabel}
        </button>

        {/* Bouton supprimer */}
        <button
          type="button"
          onClick={handleDelete}
          aria-label={t('task.delete')}
          disabled={isRemoving}
          style={{
            cursor: isRemoving ? 'default' : 'pointer',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            padding: 'var(--space-2)',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            transition: 'transform 150ms cubic-bezier(0, 0, 0.58, 1), background 150ms cubic-bezier(0, 0, 0.58, 1), color 150ms cubic-bezier(0, 0, 0.58, 1)',
            color: 'var(--color-text-tertiary)',
          }}
          onMouseEnter={(e) => {
            if (!isRemoving) {
              e.currentTarget.style.background = 'var(--color-error-light)';
              e.currentTarget.style.color = 'var(--color-error)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={(e) => { if (!isRemoving) e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { if (!isRemoving) e.currentTarget.style.transform = 'scale(1.1)'; }}
        >
          {deleteLabel}
        </button>
      </div>

      {/* === Section sous-tâches === */}
      <div style={{
        paddingLeft: 'calc(var(--space-2) * 2 + 1.5rem + var(--space-3))',
      }}>
        {/* Bouton toggle expand */}
        <button
          type="button"
          onClick={() => setIsExpanded(v => !v)}
          aria-expanded={isExpanded}
          aria-label={subtaskToggleLabel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-1) 0',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-tertiary)',
            transition: 'color 150ms cubic-bezier(0, 0, 0.58, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
        >
          <span style={{
            display: 'inline-block',
            fontSize: '0.6rem',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 240ms cubic-bezier(0, 0, 0.58, 1)',
          }}>
            ▾
          </span>
          {subtasks.length > 0
            ? `${doneSubs}/${subtasks.length} ${subtaskToggleLabel}`
            : `+ ${subtaskToggleLabel}`
          }
        </button>

        {/* Panneau accordéon */}
        <div className={`subtasks-wrap${isExpanded ? ' open' : ''}`}>
          <div>
            <div style={{ paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-3)' }}>

              {/* Liste des sous-tâches */}
              {subtasks.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    paddingTop: 'var(--space-2)',
                    paddingBottom: 'var(--space-1)',
                  }}
                >
                  {/* Checkbox circulaire */}
                  <button
                    type="button"
                    onClick={() => onToggleSubtask?.(task.id, sub.id)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `2px solid ${sub.done ? 'var(--color-success)' : 'var(--color-text-tertiary)'}`,
                      background: sub.done ? 'var(--color-success)' : 'transparent',
                      flexShrink: 0,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 200ms cubic-bezier(0, 0, 0.58, 1)',
                    }}
                    onMouseEnter={e => {
                      if (!sub.done) e.currentTarget.style.borderColor = 'var(--color-success)';
                    }}
                    onMouseLeave={e => {
                      if (!sub.done) e.currentTarget.style.borderColor = 'var(--color-text-tertiary)';
                    }}
                  >
                    {sub.done && (
                      <span style={{ color: 'white', fontSize: '9px', fontWeight: 'bold', lineHeight: '1' }}>
                        ✓
                      </span>
                    )}
                  </button>

                  {/* Texte */}
                  <span style={{
                    flex: 1,
                    fontSize: 'var(--text-sm)',
                    color: sub.done ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
                    textDecoration: sub.done ? 'line-through' : 'none',
                    transition: 'color 200ms cubic-bezier(0, 0, 0.58, 1), text-decoration 200ms cubic-bezier(0, 0, 0.58, 1)',
                  }}>
                    {sub.text}
                  </span>

                  {/* Bouton supprimer sous-tâche */}
                  {onRemoveSubtask && (
                    <button
                      type="button"
                      onClick={() => onRemoveSubtask(task.id, sub.id)}
                      aria-label="supprimer sous-tâche"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-tertiary)',
                        lineHeight: 1,
                        flexShrink: 0,
                        transition: 'color 150ms cubic-bezier(0, 0, 0.58, 1), transform 150ms cubic-bezier(0, 0, 0.58, 1)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--color-error)';
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--color-text-tertiary)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* Séparateur si sous-tâches existantes */}
              {subtasks.length > 0 && (
                <div style={{
                  height: 1,
                  background: 'var(--color-bg-secondary)',
                  margin: 'var(--space-2) 0',
                }} />
              )}

              {/* Input nouvelle sous-tâche */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <input
                  type="text"
                  value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSub(); }}
                  placeholder={subtaskPlaceholder}
                  aria-label={subtaskPlaceholder}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--color-bg-secondary)',
                    outline: 'none',
                    padding: '4px 2px',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                    transition: 'border-color 150ms cubic-bezier(0, 0, 0.58, 1)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--color-primary)'; }}
                  onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--color-bg-secondary)'; }}
                />
                <button
                  type="button"
                  onClick={handleAddSub}
                  disabled={!newSub.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: newSub.trim() ? 'pointer' : 'default',
                    color: newSub.trim() ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                    fontWeight: 'var(--font-bold)',
                    fontSize: '1.1rem',
                    padding: '2px var(--space-1)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 150ms cubic-bezier(0, 0, 0.58, 1), transform 150ms cubic-bezier(0, 0, 0.58, 1)',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => { if (newSub.trim()) e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  +
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
