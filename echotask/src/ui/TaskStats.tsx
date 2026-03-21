// src/ui/TaskStats.tsx
import React from 'react';

interface TaskStatsProps {
  active: number;
  done: number;
  activeLabel: string;
  doneLabel: string;
}

/**
 * TaskStats — Compteurs discrets, typo minuscule aérée.
 * La barre de progression est gérée dans App.tsx (position: fixed, top).
 */
export default function TaskStats({ active, done, activeLabel, doneLabel }: TaskStatsProps) {
  const total = active + done;
  if (total === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      opacity: 0.5,
    }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        <strong style={{ fontWeight: '600', color: 'var(--color-text)' }}>{active}</strong> {activeLabel}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        <strong style={{ fontWeight: '600', color: 'var(--color-text)' }}>{done}</strong> {doneLabel}
      </span>
    </div>
  );
}
