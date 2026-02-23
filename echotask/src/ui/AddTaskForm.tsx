// src/ui/AddTaskForm.tsx
import React, { useState } from 'react';

interface AddTaskFormProps {
  onSubmit: (text: string, tags: string, due?: string | null) => void;
  placeholderText: string;
  placeholderTags: string;
  dueLabel: string;
  buttonLabel: string;
}

/**
 * Composant AddTaskForm - Formulaire d'ajout rapide
 *
 * Champs : texte principal, tags, date d'échéance (optionnelle)
 */
export default function AddTaskForm({
  onSubmit,
  placeholderText,
  placeholderTags,
  dueLabel,
  buttonLabel
}: AddTaskFormProps) {

  const [input, setInput] = useState('');
  const [inputTags, setInputTags] = useState('');
  const [inputDue, setInputDue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim(), inputTags, inputDue || null);
    setInput('');
    setInputTags('');
    setInputDue('');
  };

  return (
    <section style={{ marginTop: 'var(--space-4)' }}>
      {/* Ligne principale : texte + bouton */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholderText}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">
          {buttonLabel}
        </button>
      </form>

      {/* Ligne secondaire : tags + date côte à côte */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <input
          className="input"
          value={inputTags}
          onChange={e => setInputTags(e.target.value)}
          placeholder={placeholderTags}
          style={{ flex: 1 }}
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Faux placeholder visible quand pas de date sélectionnée */}
          {!inputDue && (
            <span style={{
              position: 'absolute',
              left: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              {dueLabel}
            </span>
          )}
          <input
            type="date"
            className="input"
            value={inputDue}
            onChange={e => setInputDue(e.target.value)}
            style={{
              width: '150px',
              cursor: 'pointer',
              color: inputDue ? 'var(--color-text)' : 'transparent',
            }}
          />
        </div>
      </div>
    </section>
  );
}
