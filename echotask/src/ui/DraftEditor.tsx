// src/ui/DraftEditor.tsx
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
  // Labels traduits
  title: string;
  rawLabel: string;
  cleanLabel: string;
  tagsPlaceholder: string;
  improveLabel: string;
  saveLabel: string;
  cancelLabel: string;
}

/**
 * Composant DraftEditor
 * 
 * Affiche et édite le brouillon de tâche issu de la dictée vocale :
 * - Texte brut (rawText)
 * - Texte amélioré (cleanText)
 * - Tags
 * - Actions : Améliorer, Sauvegarder, Annuler
 * 
 * @param draft - Texte brut du brouillon
 * @param clean - Texte amélioré
 * @param tags - Tags (séparés par virgules)
 * @param onDraftChange - Callback changement texte brut
 * @param onCleanChange - Callback changement texte amélioré
 * @param onTagsChange - Callback changement tags
 * @param onImprove - Callback amélioration
 * @param onSave - Callback sauvegarde
 * @param onCancel - Callback annulation
 * @param title - Titre de la section (traduit)
 * @param rawLabel - Label texte brut (traduit)
 * @param cleanLabel - Label texte amélioré (traduit)
 * @param tagsPlaceholder - Placeholder tags (traduit)
 * @param improveLabel - Label bouton améliorer (traduit)
 * @param saveLabel - Label bouton sauvegarder (traduit)
 * @param cancelLabel - Label bouton annuler (traduit)
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
    <div style={{ 
      border: '1px solid #eee', 
      borderRadius: 8, 
      padding: 12, 
      marginTop: 16,
      backgroundColor: '#f9f9f9'
    }}>
      {/* Titre */}
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>
        {title}
      </h3>

      {/* Texte brut */}
      <label style={{ 
        display: 'block', 
        fontWeight: 600, 
        marginBottom: 4,
        fontSize: '0.9em'
      }}>
        {rawLabel}
      </label>
      <textarea
        value={draft}
        onChange={e => onDraftChange(e.target.value)}
        rows={3}
        style={{ 
          width: '100%', 
          padding: 8,
          border: '1px solid #ddd',
          borderRadius: 4,
          fontFamily: 'inherit',
          fontSize: '1em',
          resize: 'vertical'
        }}
      />

      {/* Texte amélioré */}
      <label style={{ 
        display: 'block', 
        fontWeight: 600, 
        marginTop: 12,
        marginBottom: 4,
        fontSize: '0.9em'
      }}>
        {cleanLabel}
      </label>
      <textarea
        value={clean}
        onChange={e => onCleanChange(e.target.value)}
        rows={3}
        style={{ 
          width: '100%', 
          padding: 8,
          border: '1px solid #ddd',
          borderRadius: 4,
          fontFamily: 'inherit',
          fontSize: '1em',
          resize: 'vertical'
        }}
      />

      {/* Tags */}
      <input
        value={tags}
        onChange={e => onTagsChange(e.target.value)}
        placeholder={tagsPlaceholder}
        style={{ 
          width: '100%',
          marginTop: 12, 
          padding: 10, 
          border: '1px solid #ddd', 
          borderRadius: 8,
          fontSize: '0.95em'
        }}
      />

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: 8, 
        marginTop: 12,
        flexWrap: 'wrap'
      }}>
        <button 
          type="button" 
          onClick={onImprove}
          style={{
            flex: '1 1 auto',
            minWidth: 100
          }}
        >
          ✨ {improveLabel}
        </button>
        <button 
          type="button" 
          onClick={onSave}
          style={{
            flex: '1 1 auto',
            minWidth: 100
          }}
        >
          💾 {saveLabel}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          style={{
            flex: '1 1 auto',
            minWidth: 100
          }}
        >
          ❌ {cancelLabel}
        </button>
      </div>
    </div>
  );
}