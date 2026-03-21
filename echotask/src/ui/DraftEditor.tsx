// src/ui/DraftEditor.tsx
import React from 'react';
import { motion } from 'framer-motion';

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
 * DraftEditor — Zen inline, sans carte rigide
 */
export default function DraftEditor({
  draft, clean, tags,
  onDraftChange, onCleanChange, onTagsChange,
  onImprove, onSave, onCancel,
  title, rawLabel, cleanLabel, tagsPlaceholder,
  improveLabel, saveLabel, cancelLabel,
}: DraftEditorProps) {

  const ghostInput: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    outline: 'none',
    padding: '8px 0',
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text)',
    lineHeight: 1.6,
    resize: 'none',
    transition: 'border-color 200ms ease',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 'var(--space-6)',
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Titre */}
      <p style={{
        margin: '0 0 var(--space-4)',
        fontSize: 'var(--text-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: 'var(--color-text-tertiary)',
        fontWeight: 'var(--font-medium)',
      }}>
        {title}
      </p>

      {/* Texte brut */}
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {rawLabel}
      </label>
      <textarea
        value={draft}
        onChange={e => onDraftChange(e.target.value)}
        rows={3}
        style={{ ...ghostInput, marginBottom: 'var(--space-4)' }}
        onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--color-primary)'; }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--color-border)'; }}
      />

      {/* Texte amélioré */}
      <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>
        {cleanLabel}
      </label>
      <textarea
        value={clean}
        onChange={e => onCleanChange(e.target.value)}
        rows={3}
        style={{ ...ghostInput, marginBottom: 'var(--space-3)' }}
        onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--color-primary)'; }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--color-border)'; }}
      />

      {/* Tags */}
      <input
        value={tags}
        onChange={e => onTagsChange(e.target.value)}
        placeholder={tagsPlaceholder}
        style={{ ...ghostInput, marginBottom: 'var(--space-5)' }}
        onFocus={e => { e.currentTarget.style.borderBottomColor = 'var(--color-primary)'; }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = 'var(--color-border)'; }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <motion.button type="button" onClick={onImprove} whileTap={{ scale: 0.95 }}
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px var(--space-4)', fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
          ✦ {improveLabel}
        </motion.button>
        <motion.button type="button" onClick={onSave} whileTap={{ scale: 0.95 }}
          style={{ background: 'var(--color-text)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px var(--space-4)', fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: 'var(--font-family)', fontWeight: 'var(--font-medium)' }}>
          {saveLabel}
        </motion.button>
        <motion.button type="button" onClick={onCancel} whileTap={{ scale: 0.95 }}
          style={{ background: 'transparent', color: 'var(--color-text-tertiary)', border: 'none', borderRadius: 'var(--radius-full)', padding: '8px var(--space-4)', fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: 'var(--font-family)' }}>
          {cancelLabel}
        </motion.button>
      </div>
    </motion.div>
  );
}
