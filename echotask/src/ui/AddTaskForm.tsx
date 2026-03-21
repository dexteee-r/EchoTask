// src/ui/AddTaskForm.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTaskFormProps {
  onSubmit: (text: string, tags: string, due?: string | null) => void;
  placeholderText: string;
  placeholderTags: string;
  dueLabel: string;
  buttonLabel: string;
}

/**
 * AddTaskForm — "Floating Whisper"
 * Input sans cadre, grand et élégant. Les champs secondaires se révèlent au focus.
 */
export default function AddTaskForm({
  onSubmit,
  placeholderText,
  placeholderTags,
  dueLabel,
  buttonLabel,
}: AddTaskFormProps) {
  const [input, setInput]       = useState('');
  const [inputTags, setInputTags] = useState('');
  const [inputDue, setInputDue]   = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim(), inputTags, inputDue || null);
    setInput('');
    setInputTags('');
    setInputDue('');
    setIsFocused(false);
  };

  const hasContent = isFocused || input.length > 0;

  return (
    <section style={{ marginBottom: 'var(--space-6)' }}>
      <form ref={formRef} onSubmit={handleSubmit}>

        {/* Champ principal — Floating Whisper */}
        <div style={{ position: 'relative', paddingBottom: 'var(--space-2)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { if (!input && !inputTags && !inputDue) setIsFocused(false); }}
            placeholder={placeholderText}
            aria-label={placeholderText}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 'clamp(1.25rem, 3vw, 1.6rem)',
              fontWeight: '300',
              fontFamily: 'var(--font-family)',
              color: 'var(--color-text)',
              padding: 'var(--space-2) 0',
              letterSpacing: '-0.01em',
              fontStyle: input ? 'normal' : 'italic',
            }}
          />
          {/* Underline animé au focus */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--color-border)', overflow: 'hidden' }}>
            <motion.div
              animate={{ x: hasContent ? '0%' : '-100%' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
              }}
            />
          </div>
        </div>

        {/* Champs secondaires — se révèlent au focus */}
        <AnimatePresence>
          {hasContent && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'center',
                paddingTop: 'var(--space-3)',
                flexWrap: 'wrap',
              }}>
                <input
                  value={inputTags}
                  onChange={e => setInputTags(e.target.value)}
                  placeholder={placeholderTags}
                  aria-label={placeholderTags}
                  style={{
                    flex: 1, minWidth: 120,
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    outline: 'none',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family)',
                    color: 'var(--color-text-secondary)',
                    padding: '6px 0',
                  }}
                />

                {/* Date picker */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {!inputDue && (
                    <span style={{
                      position: 'absolute', left: 0, top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-tertiary)',
                      pointerEvents: 'none',
                    }}>
                      {dueLabel}
                    </span>
                  )}
                  <input
                    type="date"
                    value={inputDue}
                    onChange={e => setInputDue(e.target.value)}
                    aria-label={dueLabel}
                    style={{
                      width: 130,
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid var(--color-border)',
                      outline: 'none',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family)',
                      color: inputDue ? 'var(--color-text-secondary)' : 'transparent',
                      padding: '6px 0', cursor: 'pointer',
                    }}
                  />
                </div>

                {/* Bouton submit — minimal */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.93 }}
                  disabled={!input.trim()}
                  style={{
                    background: input.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                    color: input.trim() ? 'white' : 'var(--color-text-tertiary)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px var(--space-5)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    fontFamily: 'var(--font-family)',
                    cursor: input.trim() ? 'pointer' : 'default',
                    transition: 'background 200ms ease, color 200ms ease',
                    letterSpacing: '0.01em',
                    flexShrink: 0,
                  }}
                >
                  {buttonLabel}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </section>
  );
}
