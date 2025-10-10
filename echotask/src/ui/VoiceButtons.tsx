// src/ui/VoiceButtons.tsx (Modernisé)
import React from 'react';

interface VoiceButtonsProps {
  listeningLocal: boolean;
  listeningCloud: boolean;
  sttSupported: boolean;
  onStartLocal: () => void;
  onStopLocal: () => void;
  onStartCloud: () => void;
  onStopCloud: () => void;
  localLabel: string;
  cloudLabel: string;
  unsupportedTooltip: string;
}

/**
 * Composant VoiceButtons - Boutons de dictée (Modernisé)
 * 
 * Utilise le Design System pour :
 * - Boutons stylés avec états
 * - Animation pulse pendant l'écoute
 * - Feedback visuel clair
 */
export default function VoiceButtons({
  listeningLocal,
  listeningCloud,
  sttSupported,
  onStartLocal,
  onStopLocal,
  onStartCloud,
  onStopCloud,
  localLabel,
  cloudLabel,
  unsupportedTooltip
}: VoiceButtonsProps) {
  
  return (
    <div style={{ 
      marginTop: 'var(--space-2)', 
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-2)',
    }}>
      {/* Bouton micro local */}
      <button
        type="button"
        onPointerDown={onStartLocal}
        onPointerUp={onStopLocal}
        disabled={!sttSupported}
        title={!sttSupported ? unsupportedTooltip : localLabel}
        className="btn"
        style={{
          background: listeningLocal ? 'var(--color-error)' : 'var(--color-surface)',
          color: listeningLocal ? 'white' : 'var(--color-text)',
          border: `2px solid ${listeningLocal ? 'var(--color-error)' : 'var(--color-border)'}`,
          opacity: sttSupported ? 1 : 0.5,
          cursor: sttSupported ? 'pointer' : 'not-allowed',
          fontWeight: 'var(--font-semibold)',
          position: 'relative',
          animation: listeningLocal ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      >
        🎤 {localLabel} {listeningLocal && <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'white',
          marginLeft: 'var(--space-1)',
          animation: 'pulse 1s ease-in-out infinite',
        }} />}
      </button>

      {/* Bouton micro cloud */}
      <button
        type="button"
        onPointerDown={onStartCloud}
        onPointerUp={onStopCloud}
        title={cloudLabel}
        className="btn"
        style={{
          background: listeningCloud ? 'var(--color-primary)' : 'var(--color-surface)',
          color: listeningCloud ? 'white' : 'var(--color-text)',
          border: `2px solid ${listeningCloud ? 'var(--color-primary)' : 'var(--color-border)'}`,
          cursor: 'pointer',
          fontWeight: 'var(--font-semibold)',
          animation: listeningCloud ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      >
        ☁️ {cloudLabel} {listeningCloud && <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'white',
          marginLeft: 'var(--space-1)',
          animation: 'pulse 1s ease-in-out infinite',
        }} />}
      </button>
    </div>
  );
}