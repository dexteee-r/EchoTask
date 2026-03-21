// src/ui/TaskItem.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { useI18n } from '../i18n';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Physique de ressort zen
const zenSpring = { type: 'spring', stiffness: 60, damping: 18, mass: 1 } as const;

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
  toggleLabel: string;
  editLabel?: string;
  deleteLabel?: string;
  subtaskToggleLabel?: string;
  subtaskPlaceholder?: string;
  dragLabel?: string;
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
  toggleLabel,
  subtaskToggleLabel = "sous-tâches",
  subtaskPlaceholder = "Ajouter…",
  dragLabel = "Déplacer",
}: TaskItemProps) {
  const { t } = useI18n();
  const isDone = task.status === 'done';

  const [pathCopied, setPathCopied] = useState(false);
  async function handleCopyPath() {
    if (!task.filePath) return;
    try {
      await navigator.clipboard.writeText(task.filePath);
      setPathCopied(true);
      setTimeout(() => setPathCopied(false), 1800);
    } catch {}
  }

  const { setNodeRef, transform, transition, attributes, listeners, isDragging } = useSortable({ id: task.id });

  const [isRemoving, setIsRemoving] = useState(false);
  const isRemovingRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSub, setNewSub] = useState('');

  const subtasks = task.subtasks || [];
  const doneSubs = subtasks.filter(s => s.done).length;

  const dueInfo = (() => {
    if (!task.due) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due + 'T00:00:00');
    const diff = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
    if (diff < 0)   return { label: t('due.overdue'),  color: 'var(--color-error)'   };
    if (diff === 0) return { label: t('due.today'),    color: 'var(--color-primary)'  };
    if (diff === 1) return { label: t('due.tomorrow'), color: 'var(--color-primary)'  };
    if (diff <= 5)  return { label: `${diff}j`,        color: 'var(--color-primary)'  };
    return { label: task.due, color: 'var(--color-text-tertiary)' };
  })();

  function handleDelete() {
    isRemovingRef.current = true;
    setIsRemoving(true);
  }

  function handleAddSub() {
    if (!newSub.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, newSub.trim());
    setNewSub('');
  }

  return (
    <motion.li
      ref={setNodeRef}
      layout
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      animate={isRemoving
        ? { opacity: 0, x: -24, filter: 'blur(8px)' }
        : {
            opacity: isDone ? 0.38 : 1,
            y: 0,
            filter: 'blur(0px)',
            scale: isDone ? 0.984 : 1,
          }
      }
      exit={{ opacity: 0, x: -20, filter: 'blur(10px)', scale: 0.96 }}
      transition={
        isRemoving
          ? { duration: 0.22, ease: 'easeIn' }
          : { ...zenSpring, delay: Math.min(index, 6) * 0.045 }
      }
      onAnimationComplete={() => {
        if (isRemovingRef.current) onDelete(task.id);
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || undefined,
        opacity: isDragging ? 0.5 : undefined,
        zIndex: isDragging ? 10 : undefined,
        listStyle: 'none',
        marginBottom: 'var(--space-8)',
        cursor: 'default',
        position: 'relative',
      }}
    >
      {/* === Rangée principale === */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>

        {/* Poignée drag */}
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label={dragLabel}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            background: 'none', border: 'none',
            padding: '4px', color: 'var(--color-text-tertiary)',
            fontSize: '0.85rem', flexShrink: 0, lineHeight: 1,
            touchAction: 'none', borderRadius: 'var(--radius-sm)',
            opacity: 0.2, transition: 'opacity 150ms ease',
            marginTop: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.2'; }}
        >
          ⠿
        </button>

        {/* Checkbox organique — cercle */}
        <motion.button
          type="button"
          onClick={() => onToggleDone(task.id)}
          aria-label={isDone ? t('task.markActive') : t('task.markDone')}
          aria-pressed={isDone}
          whileTap={{ scale: 0.85 }}
          style={{
            cursor: 'pointer',
            background: 'none', border: 'none',
            padding: 0, flexShrink: 0,
            marginTop: '4px',
          }}
        >
          <motion.div
            animate={isDone
              ? { backgroundColor: '#1c1c1e', borderColor: '#1c1c1e', scale: 0.88 }
              : { backgroundColor: 'transparent', borderColor: 'rgba(0,0,0,0.18)', scale: 1 }
            }
            transition={{ ...zenSpring }}
            style={{
              width: 20, height: 20,
              borderRadius: '50%',
              border: '1.5px solid',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <AnimatePresence>
              {isDone && (
                <motion.svg
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                >
                  <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.button>

        {/* Contenu */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Texte principal — avec strikethrough animé */}
          <div
            className={`task-text-wrap${isDone ? ' task-text-wrap--done' : ''}`}
            style={{
              fontWeight: isDone ? 'var(--font-normal)' : 'var(--font-medium)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text)',
              lineHeight: '1.45',
              marginBottom: task.cleanText ? 'var(--space-1)' : 0,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              letterSpacing: '-0.01em',
            }}
          >
            {task.rawText}
          </div>

          {task.cleanText && (
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-1)',
              lineHeight: 'var(--leading-relaxed)',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              fontWeight: 'var(--font-normal)',
            }}>
              {task.cleanText}
            </div>
          )}

          {/* Tags flottants — minuscules et aérés */}
          {task.tags && task.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {task.tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick?.(tag)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    font: 'inherit', cursor: onTagClick ? 'pointer' : 'default',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: 'var(--color-text-tertiary)',
                    transition: 'color 200ms ease',
                  }}
                  onMouseEnter={e => { if (onTagClick) e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
                >
                  # {tag}
                </button>
              ))}
            </div>
          )}

          {/* Badge échéance */}
          {dueInfo && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-medium)',
                color: dueInfo.color,
                letterSpacing: '0.02em',
              }}>
                {dueInfo.label}
              </span>
            </div>
          )}

          {/* Lien fichier */}
          {task.filePath && (
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span style={{
                fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
                fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', maxWidth: '200px',
              }} title={task.filePath}>
                📄 {task.filePath}
              </span>
              <button
                type="button"
                onClick={handleCopyPath}
                aria-label={pathCopied ? t('task.filepath.copied') : t('task.filepath.copy')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '1px var(--space-1)', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  color: pathCopied ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                  transition: 'color 150ms ease',
                }}
              >
                {pathCopied ? '✓' : '⎘'}
              </button>
            </div>
          )}
        </div>

        {/* Actions — invisibles au repos, apparaissent au hover via CSS */}
        <div className="leaf-actions">
          <button
            type="button"
            onClick={() => onEdit(task.id)}
            aria-label={t('edit.title')}
            className="leaf-action-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label={t('task.delete')}
            disabled={isRemoving}
            className="leaf-action-btn leaf-action-delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* === Section sous-tâches === */}
      <div style={{ paddingLeft: 'calc(20px + var(--space-4) + var(--space-4))' }}>
        <button
          type="button"
          onClick={() => setIsExpanded(v => !v)}
          aria-expanded={isExpanded}
          aria-label={subtaskToggleLabel}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 'var(--space-1) 0', marginTop: 'var(--space-2)',
            fontSize: '0.68rem', fontWeight: 'var(--font-medium)',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: 'var(--color-text-tertiary)',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-block', fontSize: '0.55rem', lineHeight: 1 }}
          >▾</motion.span>
          {subtasks.length > 0 ? `${doneSubs}/${subtasks.length} ${subtaskToggleLabel}` : `+ ${subtaskToggleLabel}`}
        </button>

        <div className={`subtasks-wrap${isExpanded ? ' open' : ''}`}>
          <div>
            <div style={{ paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-3)' }}>
              {subtasks.map(sub => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingBottom: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => onToggleSubtask?.(task.id, sub.id)}
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `1.5px solid ${sub.done ? 'var(--color-text-secondary)' : 'var(--color-border-light)'}`,
                      background: sub.done ? 'var(--color-text-secondary)' : 'transparent',
                      flexShrink: 0, cursor: 'pointer', padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 200ms ease',
                    }}
                  >
                    {sub.done && <span style={{ color: 'white', fontSize: '7px', fontWeight: 'bold' }}>✓</span>}
                  </button>
                  <span style={{
                    flex: 1, fontSize: 'var(--text-sm)',
                    color: sub.done ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
                    textDecoration: sub.done ? 'line-through' : 'none',
                    transition: 'color 200ms ease',
                  }}>
                    {sub.text}
                  </span>
                  {onRemoveSubtask && (
                    <button
                      type="button"
                      onClick={() => onRemoveSubtask(task.id, sub.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '2px 4px', fontSize: '0.75rem',
                        color: 'var(--color-text-tertiary)',
                        transition: 'color 150ms ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-error)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
                    >×</button>
                  )}
                </div>
              ))}
              {subtasks.length > 0 && <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-2) 0' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="text" value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSub(); }}
                  placeholder={subtaskPlaceholder}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    outline: 'none', padding: '4px 2px',
                    fontSize: 'var(--text-sm)', color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button" onClick={handleAddSub} disabled={!newSub.trim()}
                  style={{
                    background: 'none', border: 'none',
                    cursor: newSub.trim() ? 'pointer' : 'default',
                    color: newSub.trim() ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                    fontWeight: 'bold', fontSize: '1.1rem', padding: '2px',
                  }}
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
