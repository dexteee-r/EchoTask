// src/ui/FilterBar.tsx (Modernisé)
import React from 'react';

interface FilterBarProps {
  search: string;
  tagFilter: string;
  onSearchChange: (value: string) => void;
  onTagFilterChange: (value: string) => void;
  searchPlaceholder: string;
  tagFilterPlaceholder: string;
}

/**
 * Composant FilterBar - Recherche et filtrage (Modernisé)
 * 
 * Utilise le Design System pour :
 * - Inputs avec focus states
 * - Icônes de recherche
 * - Grid layout responsive
 */
export default function FilterBar({
  search,
  tagFilter,
  onSearchChange,
  onTagFilterChange,
  searchPlaceholder,
  tagFilterPlaceholder
}: FilterBarProps) {
  
  return (
    <div style={{ 
      marginTop: 'var(--space-3)', 
      display: 'grid', 
      gap: 'var(--space-2)',
    }}>
      {/* Recherche texte */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: 'var(--space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1.25rem',
          pointerEvents: 'none',
          opacity: 0.5,
        }}>
          🔍
        </span>
        <input
          type="text"
          className="input"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          style={{ paddingLeft: 'calc(var(--space-3) + 1.5rem)' }}
          aria-label="Recherche"
        />
      </div>

      {/* Filtre tags */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: 'var(--space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '1.25rem',
          pointerEvents: 'none',
          opacity: 0.5,
        }}>
          🏷️
        </span>
        <input
          type="text"
          className="input"
          value={tagFilter}
          onChange={e => onTagFilterChange(e.target.value)}
          placeholder={tagFilterPlaceholder}
          style={{ paddingLeft: 'calc(var(--space-3) + 1.5rem)' }}
          aria-label="Filtre par tags"
        />
      </div>
    </div>
  );
}