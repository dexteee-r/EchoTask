// src/ui/VoiceButtons.tsx
import React from 'react';
import { motion } from 'framer-motion';

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
 * VoiceButtons — Sphères organiques fixées en bas
 * Deux cercles éthérés qui ondulent lorsqu'actifs.
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
  unsupportedTooltip,
}: VoiceButtonsProps) {

  const isAnyListening = listeningLocal || listeningCloud;

  return (
    <div style={{
      position: 'fixed',
      bottom: 48,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'center',
      zIndex: 1100,
    }}>

      {/* Bouton voix locale */}
      <motion.button
        type="button"
        onPointerDown={onStartLocal}
        onPointerUp={onStopLocal}
        disabled={!sttSupported}
        title={!sttSupported ? unsupportedTooltip : localLabel}
        aria-label={localLabel}
        whileHover={sttSupported ? { scale: 1.08 } : {}}
        whileTap={sttSupported ? { scale: 0.9 } : {}}
        style={{
          position: 'relative',
          width: 56, height: 56,
          borderRadius: '50%',
          background: listeningLocal
            ? 'rgba(28, 28, 30, 0.9)'
            : 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: listeningLocal
            ? '0 8px 32px rgba(0,0,0,0.20)'
            : '0 8px 32px rgba(0,0,0,0.08)',
          cursor: sttSupported ? 'pointer' : 'not-allowed',
          opacity: sttSupported ? 1 : 0.4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 300ms ease, box-shadow 300ms ease',
        }}
      >
        {/* Halo ondulant quand actif */}
        {listeningLocal && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'rgba(28, 28, 30, 0.15)',
            }}
          />
        )}
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={listeningLocal ? 'white' : 'var(--color-text-secondary)'}
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <span style={{
          position: 'absolute', bottom: -22,
          fontSize: '0.6rem', textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: listeningLocal ? 'var(--color-text)' : 'var(--color-text-tertiary)',
          whiteSpace: 'nowrap', fontWeight: '500',
        }}>
          {localLabel}
        </span>
      </motion.button>

      {/* Bouton voix cloud */}
      <motion.button
        type="button"
        onPointerDown={onStartCloud}
        onPointerUp={onStopCloud}
        aria-label={cloudLabel}
        title={cloudLabel}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'relative',
          width: 56, height: 56,
          borderRadius: '50%',
          background: listeningCloud
            ? 'rgba(129, 140, 248, 0.9)'
            : 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: listeningCloud
            ? '0 8px 32px rgba(129, 140, 248, 0.30)'
            : '0 8px 32px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 300ms ease, box-shadow 300ms ease',
        }}
      >
        {listeningCloud && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'rgba(129, 140, 248, 0.25)',
            }}
          />
        )}
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={listeningCloud ? 'white' : 'var(--color-text-secondary)'}
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span style={{
          position: 'absolute', bottom: -22,
          fontSize: '0.6rem', textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: listeningCloud ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
          whiteSpace: 'nowrap', fontWeight: '500',
        }}>
          {cloudLabel}
        </span>
      </motion.button>

    </div>
  );
}
