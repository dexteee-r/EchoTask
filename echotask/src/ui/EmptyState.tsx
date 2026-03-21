// src/ui/EmptyState.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  microphoneHint: string;
  keyboardHint: string;
  improveHint: string;
}

export default function EmptyState({ title, microphoneHint, keyboardHint, improveHint }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: 'center', paddingTop: 'var(--space-12)' }}
    >
      {/* SVG flottant */}
      <div className="empty-state-svg" style={{ marginBottom: 'var(--space-8)' }}>
        <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="13" y="18" width="44" height="48" rx="7" stroke="var(--color-text-tertiary)" strokeWidth="1.5"/>
          <rect x="25" y="12" width="22" height="12" rx="4" stroke="var(--color-text-tertiary)" strokeWidth="1.5"/>
          <line x1="21" y1="34" x2="51" y2="34" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="21" y1="44" x2="45" y2="44" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="21" y1="54" x2="48" y2="54" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="55" cy="19" r="9" fill="var(--color-primary-light)"/>
          <circle cx="55" cy="19" r="9" stroke="var(--color-primary)" strokeWidth="1.5"/>
          <line x1="55" y1="15" x2="55" y2="23" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="51" y1="19" x2="59" y2="19" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      <p style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
        fontWeight: 400,
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-8)',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </p>

      {/* Hints — minimalistes, espacés */}
      <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left' }}>
        {[
          { icon: '🎤', text: microphoneHint },
          { icon: '⌨️', text: keyboardHint },
          { icon: '✦', text: improveHint },
        ].map(({ icon, text }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}
          >
            <span style={{ fontSize: '1rem', opacity: 0.5, flexShrink: 0, marginTop: 2 }}>{icon}</span>
            <p style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-tertiary)',
              lineHeight: '1.6',
              fontWeight: 'var(--font-normal)',
            }}>
              {text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
