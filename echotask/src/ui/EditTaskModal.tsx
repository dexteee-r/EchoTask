// src/ui/EditTaskModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';

interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
  title: string;
  rawLabel: string;
  cleanLabel: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  dueLabel: string;
  duePlaceholder: string;
  filePathLabel: string;
  filePathPlaceholder: string;
  saveButton: string;
  cancelButton: string;
  improveButton: string;
  onImprove?: () => Promise<string>;
}

export default function EditTaskModal({
  task, onSave, onCancel,
  title, rawLabel, cleanLabel, tagsLabel, tagsPlaceholder,
  dueLabel, duePlaceholder, filePathLabel, filePathPlaceholder,
  saveButton, cancelButton, improveButton, onImprove,
}: EditTaskModalProps) {
  const [rawText, setRawText] = useState(task.rawText);
  const [cleanText, setCleanText] = useState(task.cleanText || '');
  const [tags, setTags] = useState((task.tags || []).join(', '));
  const [due, setDue] = useState(task.due || '');
  const [filePath, setFilePath] = useState(task.filePath || '');
  const [isImproving, setIsImproving] = useState(false);

  const ghost: React.CSSProperties = {
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-tertiary)',
    marginBottom: 4,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--color-primary)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--color-border)';
  };

  const handleSave = () => {
    onSave({
      ...task,
      rawText: rawText.trim(),
      cleanText: cleanText.trim() || null,
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      due: due || null,
      filePath: filePath.trim() || null,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleImprove = async () => {
    if (!onImprove || !rawText.trim()) return;
    setIsImproving(true);
    try {
      const improved = await onImprove();
      setCleanText(improved);
    } catch (err) {
      console.error('Erreur amélioration:', err);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="edit-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1400,
        }}
      />

      {/* Card */}
      <motion.div
        key="edit-card"
        initial={{ opacity: 0, y: 20, scale: 0.97, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(94vw, 460px)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-glass)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 24,
          border: '1px solid var(--color-glass-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
          padding: 'var(--space-7)',
          zIndex: 1401,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <p style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--color-text-tertiary)',
            fontWeight: 'var(--font-medium)',
          }}>
            {title}
          </p>
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={{ scale: 0.9 }}
            aria-label={cancelButton}
            style={{
              width: 28, height: 28, padding: 0,
              background: 'transparent', border: 'none',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Texte brut */}
          <div>
            <label style={labelStyle}>{rawLabel}</label>
            <textarea value={rawText} onChange={e => setRawText(e.target.value)} rows={3}
              style={ghost} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Texte amélioré */}
          <div>
            <label style={labelStyle}>{cleanLabel}</label>
            <textarea value={cleanText} onChange={e => setCleanText(e.target.value)} rows={3}
              style={ghost} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Améliorer */}
          {onImprove && (
            <motion.button
              type="button"
              onClick={handleImprove}
              disabled={isImproving || !rawText.trim()}
              whileTap={{ scale: 0.96 }}
              style={{
                alignSelf: 'flex-start',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                border: 'none', borderRadius: 'var(--radius-full)',
                padding: '7px var(--space-4)',
                fontSize: 'var(--text-xs)', cursor: 'pointer',
                fontFamily: 'var(--font-family)',
                opacity: isImproving || !rawText.trim() ? 0.5 : 1,
              }}
            >
              {isImproving ? '...' : `✦ ${improveButton}`}
            </motion.button>
          )}

          {/* Tags */}
          <div>
            <label style={labelStyle}>{tagsLabel}</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder={tagsPlaceholder}
              style={ghost} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>{dueLabel}</label>
            <div style={{ position: 'relative' }}>
              {!due && (
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', pointerEvents: 'none',
                }}>
                  {duePlaceholder}
                </span>
              )}
              <input type="date" value={due} onChange={e => setDue(e.target.value)}
                style={{ ...ghost, color: due ? 'var(--color-text)' : 'transparent', cursor: 'pointer' }}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Chemin fichier */}
          <div>
            <label style={labelStyle}>{filePathLabel}</label>
            <input value={filePath} onChange={e => setFilePath(e.target.value)} placeholder={filePathPlaceholder}
              style={{ ...ghost, fontFamily: 'monospace' }}
              onFocus={handleFocus} onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={!rawText.trim()}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              background: 'var(--color-text)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-full)',
              padding: '10px var(--space-4)',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              fontFamily: 'var(--font-family)', cursor: 'pointer',
              opacity: !rawText.trim() ? 0.4 : 1,
            }}
          >
            {saveButton}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              background: 'transparent', color: 'var(--color-text-tertiary)',
              border: 'none', borderRadius: 'var(--radius-full)',
              padding: '10px var(--space-4)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)', cursor: 'pointer',
            }}
          >
            {cancelButton}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
