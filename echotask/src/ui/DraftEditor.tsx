// src/ui/DraftEditor.tsx (Modernisé)
import React from 'react';

interface DraftEditorProps {
  draft: string;
  clean: string;
  tags: string;
  onDraftChange: (text: string) => void;
  onCleanChange: (text: string) => void;
  onTagsChange: (tags: string) => void;
  onImprove: () => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  rawLabel: string;
  cleanLabel: string;
  tagsPlaceholder: string;
  improveLabel: string;
  saveLabel: string;
  cancelLabel: string;
}

/**
 * Composant DraftEditor - Édition du brouillon (Modernisé)
 * 
 * Utilise le Design System pour :
 * - Card avec ombre élégante
 * - Textareas stylées
 * - Boutons avec icônes
 */
export default function DraftEditor({
  draft,
  clean,
  tags,
  onDraftChange,
  onCleanChange,
  onTagsChange,
  onImprove,
  onSave,
  onCancel,
  title,
  rawLabel,
  cleanLabel,
  tagsPlaceholder,
  improveLabel,
  saveLabel,
  cancelLabel
}: DraftEditorProps) {
  
  return (
    <div 
      className="card slide-in"
      style={{ 
        marginTop: 'var(--space-4)',
        background: 'var(--color-surface)',
        border: '2px solid var(--color-primary-light)',
      }}
    >
      {/* Titre */}
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: 'var(--space-3)',
        color: 'var(--color-text)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--font-semibold)',
      }}>
        {title}
      </h3>

      {/* Texte brut */}
      <label style={{ 
        display: 'block', 
        fontWeight: 'var(--font-medium)',
        marginBottom: 'var(--space-1)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
      }}>
        {rawLabel}
      </label>
      <textarea
        className="input"
        value={draft}
        onChange={e => onDraftChange(e.target.value)}
        rows={3}
        style={{ 
          width: '100%',
          resize: 'vertical',
          fontFamily: 'var(--font-family)',
        }}
      />

      {/* Texte amélioré */}
      <label style={{ 
        display: 'block', 
        fontWeight: 'var(--font-medium)',
        marginTop: 'var(--space-3)',
        marginBottom: 'var(--space-1)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
      }}>
        {cleanLabel}
      </label>
      <textarea
        className="input"
        value={clean}
        onChange={e => onCleanChange(e.target.value)}
        rows={3}
        style={{ 
          width: '100%',
          resize: 'vertical',
          fontFamily: 'var(--font-family)',
        }}
      />

      {/* Tags */}
      <input
        className="input"
        value={tags}
        onChange={e => onTagsChange(e.target.value)}
        placeholder={tagsPlaceholder}
        style={{ marginTop: 'var(--space-3)' }}
      />

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-2)',
        marginTop: 'var(--space-3)',
        flexWrap: 'wrap',
      }}>
        <button 
          type="button" 
          onClick={onImprove}
          className="btn btn-primary"
          style={{ flex: '1 1 auto', minWidth: 100 }}
        >
          ✨ {improveLabel}
        </button>
        <button 
          type="button" 
          onClick={onSave}
          className="btn btn-primary"
          style={{ flex: '1 1 auto', minWidth: 100 }}
        >
          💾 {saveLabel}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-ghost"
          style={{ flex: '1 1 auto', minWidth: 100 }}
        >
          ❌ {cancelLabel}
        </button>
      </div>
    </div>
  );
}