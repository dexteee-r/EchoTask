// src/ui/TaskStats.tsx
import React from 'react';

interface TaskStatsProps {
  active: number;
  done: number;
  activeLabel: string;
  doneLabel: string;
}

/**
 * TaskStats — barre compacte actives · faites + progress bar animée
 * Masquée si aucune tâche.
 */
export default function TaskStats({ active, done, activeLabel, doneLabel }: TaskStatsProps) {
  const total = active + done;
  if (total === 0) return null;

  const pct = Math.round((done / total) * 100);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-3)',
      padding: '0 var(--space-1)',
    }}>
      {/* Compteurs */}
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        fontWeight: 'var(--font-medium)',
        whiteSpace: 'nowrap',
        minWidth: 64,
      }}>
        <span style={{ color: 'var(--color-text)', fontWeight: 'var(--font-semibold)' }}>
          {active}
        </span>
        {' '}{activeLabel}
      </span>

      {/* Barre de progression */}
      <div style={{
        flex: 1,
        height: 4,
        borderRadius: 999,
        background: 'var(--color-bg-tertiary, var(--color-bg-secondary))',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 999,
          background: pct === 100
            ? 'var(--color-success)'
            : 'var(--color-primary)',
          transition: 'width 500ms cubic-bezier(0, 0, 0.58, 1)',
        }} />
      </div>

      {/* % + done */}
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        fontWeight: 'var(--font-medium)',
        whiteSpace: 'nowrap',
        minWidth: 64,
        textAlign: 'right',
      }}>
        <span style={{ color: 'var(--color-text)', fontWeight: 'var(--font-semibold)' }}>
          {done}
        </span>
        {' '}{doneLabel}
        <span style={{
          marginLeft: 'var(--space-2)',
          color: pct === 100 ? 'var(--color-success)' : 'var(--color-text-tertiary)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {pct}%
        </span>
      </span>
    </div>
  );
}
