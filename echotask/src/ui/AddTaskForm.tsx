// src/ui/AddTaskForm.tsx (Modernisé)
import React, { useState } from 'react';

interface AddTaskFormProps {
  onSubmit: (text: string, tags: string) => void;
  placeholderText: string;
  placeholderTags: string;
  buttonLabel: string;
}

/**
 * Composant AddTaskForm - Formulaire d'ajout rapide (Modernisé)
 * 
 * Utilise le Design System pour :
 * - Input avec focus states
 * - Bouton primary stylé
 * - Transitions douces
 */
export default function AddTaskForm({ 
  onSubmit, 
  placeholderText, 
  placeholderTags, 
  buttonLabel 
}: AddTaskFormProps) {
  
  const [input, setInput] = useState('');
  const [inputTags, setInputTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input.trim(), inputTags);
    setInput('');
    setInputTags('');
  };

  return (
    <section style={{ marginTop: 'var(--space-4)' }}>
      {/* Formulaire principal */}
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

      {/* Champ tags */}
      <input
        className="input"
        value={inputTags}
        onChange={e => setInputTags(e.target.value)}
        placeholder={placeholderTags}
        style={{ marginTop: 'var(--space-2)' }}
      />
    </section>
  );
}