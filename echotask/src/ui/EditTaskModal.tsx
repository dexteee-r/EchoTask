// src/ui/EditTaskModal.tsx
import React, { useState } from 'react';
import { Task } from '../types';

interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
  // Labels traduits
  title: string;
  rawLabel: string;
  cleanLabel: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  dueLabel: string;
  duePlaceholder: string;
  saveButton: string;
  cancelButton: string;
  improveButton: string;
  onImprove?: () => Promise<string>; // Callback pour améliorer le texte
}

/**
 * EditTaskModal - Modal d'édition de tâche
 * 
 * Permet de modifier :
 * - Texte brut (rawText)
 * - Texte amélioré (cleanText)
 * - Tags
 * 
 * Avec possibilité d'améliorer le texte via l'IA
 */
export default function EditTaskModal({
  task,
  onSave,
  onCancel,
  title,
  rawLabel,
  cleanLabel,
  tagsLabel,
  tagsPlaceholder,
  dueLabel,
  duePlaceholder,
  saveButton,
  cancelButton,
  improveButton,
  onImprove
}: EditTaskModalProps) {
  
  // État local pour l'édition
  const [rawText, setRawText] = useState(task.rawText);
  const [cleanText, setCleanText] = useState(task.cleanText || '');
  const [tags, setTags] = useState((task.tags || []).join(', '));
  const [due, setDue] = useState(task.due || '');
  const [isImproving, setIsImproving] = useState(false);

  /**
   * Sauvegarde les modifications
   */
  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      rawText: rawText.trim(),
      cleanText: cleanText.trim() || null,
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      due: due || null,
      updatedAt: new Date().toISOString()
    };
    onSave(updatedTask);
  };

  /**
   * Améliore le texte brut
   */
  const handleImprove = async () => {
    if (!onImprove || !rawText.trim()) return;
    
    setIsImproving(true);
    try {
      const improved = await onImprove();
      setCleanText(improved);
    } catch (error) {
      console.error('Erreur amélioration:', error);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="backdrop fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="modal">
        <div className="modal-content fade-in-scale">
          {/* Header */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <h2 style={{ 
              margin: 0,
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)'
            }}>
              ✏️ {title}
            </h2>
            <button
              onClick={onCancel}
              aria-label={cancelButton}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
                color: 'var(--color-text-tertiary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>
          </div>

          {/* Formulaire */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            {/* Texte brut */}
            <label style={{ 
              display: 'block',
              fontWeight: 'var(--font-medium)',
              marginBottom: 'var(--space-1)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              {rawLabel}
            </label>
            <textarea
              className="input"
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={3}
              style={{ 
                width: '100%',
                marginBottom: 'var(--space-3)',
                resize: 'vertical'
              }}
            />

            {/* Texte amélioré */}
            <label style={{ 
              display: 'block',
              fontWeight: 'var(--font-medium)',
              marginBottom: 'var(--space-1)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              {cleanLabel}
            </label>
            <textarea
              className="input"
              value={cleanText}
              onChange={e => setCleanText(e.target.value)}
              rows={3}
              style={{ 
                width: '100%',
                marginBottom: 'var(--space-2)',
                resize: 'vertical'
              }}
            />

            {/* Bouton Améliorer */}
            {onImprove && (
              <button
                type="button"
                onClick={handleImprove}
                disabled={isImproving || !rawText.trim()}
                className="btn btn-ghost"
                style={{ width: '100%', marginBottom: 'var(--space-3)' }}
              >
                {isImproving ? (
                  <>
                    <span className="spinner" />
                    Amélioration en cours...
                  </>
                ) : (
                  <>✨ {improveButton}</>
                )}
              </button>
            )}

            {/* Tags */}
            <label style={{ 
              display: 'block',
              fontWeight: 'var(--font-medium)',
              marginBottom: 'var(--space-1)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              {tagsLabel}
            </label>
            <input
              className="input"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder={tagsPlaceholder}
              style={{ width: '100%', marginBottom: 'var(--space-3)' }}
            />

            {/* Date d'échéance */}
            <label style={{
              display: 'block',
              fontWeight: 'var(--font-medium)',
              marginBottom: 'var(--space-1)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              {dueLabel}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {!due && (
                <span style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-tertiary)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}>
                  {duePlaceholder}
                </span>
              )}
              <input
                type="date"
                className="input"
                value={due}
                onChange={e => setDue(e.target.value)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  color: due ? 'var(--color-text)' : 'transparent',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ 
            display: 'flex',
            gap: 'var(--space-2)'
          }}>
            <button
              onClick={handleSave}
              disabled={!rawText.trim()}
              className="btn btn-primary ripple"
              style={{ flex: 1 }}
            >
              💾 {saveButton}
            </button>
            <button
              onClick={onCancel}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              ❌ {cancelButton}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}