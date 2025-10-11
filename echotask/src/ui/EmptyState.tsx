// src/ui/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  // Labels traduits
  title: string;
  microphoneHint: string;
  keyboardHint: string;
  improveHint: string;
}

/**
 * EmptyState - État vide de la liste
 * 
 * Affiche des instructions quand aucune tâche n'existe
 * Guide l'utilisateur sur comment utiliser l'app
 */
export default function EmptyState({
  title,
  microphoneHint,
  keyboardHint,
  improveHint
}: EmptyStateProps) {
  
  return (
    <div 
      className="fade-in-scale"
      style={{
        textAlign: 'center',
        padding: 'var(--space-8)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--color-border)',
        marginTop: 'var(--space-4)'
      }}
    >
      {/* Icône principale */}
      <div style={{ 
        fontSize: '4rem',
        marginBottom: 'var(--space-4)',
        animation: 'bounce 1s ease infinite'
      }}>
        📋
      </div>

      {/* Titre */}
      <h3 style={{ 
        margin: 0,
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-4)'
      }}>
        {title}
      </h3>

      {/* Instructions */}
      <div style={{ 
        maxWidth: 400,
        margin: '0 auto',
        textAlign: 'left'
      }}>
        {/* Hint 1 : Microphone */}
        <div className="stagger-item" style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ 
            fontSize: '1.5rem',
            flexShrink: 0,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-md)'
          }}>
            🎤
          </div>
          <p style={{ 
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            {microphoneHint}
          </p>
        </div>

        {/* Hint 2 : Clavier */}
        <div className="stagger-item" style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ 
            fontSize: '1.5rem',
            flexShrink: 0,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-secondary-light)',
            borderRadius: 'var(--radius-md)'
          }}>
            ⌨️
          </div>
          <p style={{ 
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            {keyboardHint}
          </p>
        </div>

        {/* Hint 3 : Améliorer */}
        <div className="stagger-item" style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ 
            fontSize: '1.5rem',
            flexShrink: 0,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-accent-light)',
            borderRadius: 'var(--radius-md)'
          }}>
            ✨
          </div>
          <p style={{ 
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)'
          }}>
            {improveHint}
          </p>
        </div>
      </div>

      {/* Encouragement */}
      <p style={{ 
        marginTop: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-tertiary)',
        fontStyle: 'italic'
      }}>
        💡 Commencez dès maintenant !
      </p>
    </div>
  );
}