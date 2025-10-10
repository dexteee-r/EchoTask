// src/ui/AddTaskForm.tsx
import React, { useState } from 'react';

interface AddTaskFormProps {
  onSubmit: (text: string, tags: string) => void;
  placeholderText: string;
  placeholderTags: string;
  buttonLabel: string;
}

/**
 * Composant AddTaskForm - Formulaire d'ajout rapide de tâche
 * 
 * Permet de :
 * - Saisir du texte (ENTER pour valider)
 * - Ajouter des tags séparés par virgules
 * - Reset automatique après soumission
 * 
 * @param onSubmit - Callback appelé avec (texte, tags) lors de la soumission
 * @param placeholderText - Placeholder pour le champ texte
 * @param placeholderTags - Placeholder pour le champ tags
 * @param buttonLabel - Libellé du bouton (traduction)
 */
export default function AddTaskForm({ 
  onSubmit, 
  placeholderText, 
  placeholderTags, 
  buttonLabel 
}: AddTaskFormProps) {
  
  // État local du formulaire
  const [input, setInput] = useState('');
  const [inputTags, setInputTags] = useState('');

  /**
   * Gère la soumission du formulaire
   * - Vérifie que le texte n'est pas vide
   * - Appelle onSubmit avec les valeurs
   * - Reset les champs
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ne rien faire si le champ est vide
    if (!input.trim()) return;
    
    // Appeler le callback parent
    onSubmit(input.trim(), inputTags);
    
    // Reset des champs
    setInput('');
    setInputTags('');
  };

  return (
    <section style={{ marginTop: 16, display: 'grid', gap: 8 }}>
      {/* Formulaire principal (texte + bouton) */}
      <form onSubmit={handleSubmit} className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholderText}
          style={{ 
            flex: 1, 
            padding: 12, 
            border: '1px solid #ccc', 
            borderRadius: 8 
          }}
        />
        <button type="submit">
          {buttonLabel}
        </button>
      </form>

      {/* Champ tags (optionnel) */}
      <input
        value={inputTags}
        onChange={e => setInputTags(e.target.value)}
        placeholder={placeholderTags}
        style={{ 
          padding: 10, 
          border: '1px solid #ddd', 
          borderRadius: 8 
        }}
      />
    </section>
  );
}