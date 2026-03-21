// src/ui/FilterBar.tsx
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
 * FilterBar — Ghost minimal, discret, s'efface quand vide
 */
export default function FilterBar({
  search,
  tagFilter,
  onSearchChange,
  onTagFilterChange,
  searchPlaceholder,
  tagFilterPlaceholder,
}: FilterBarProps) {

  const hasFilter = search.length > 0 || tagFilter.length > 0;

  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-3)',
      marginBottom: 'var(--space-4)',
      opacity: hasFilter ? 1 : 0.45,
      transition: 'opacity 250ms ease',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = hasFilter ? '1' : '0.45'; }}
    >
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label="Recherche"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${search ? 'var(--color-primary)' : 'var(--color-border)'}`,
          outline: 'none',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)',
          color: 'var(--color-text-secondary)',
          padding: '6px 0',
          transition: 'border-color 200ms ease',
        }}
      />
      <input
        type="text"
        value={tagFilter}
        onChange={e => onTagFilterChange(e.target.value)}
        placeholder={tagFilterPlaceholder}
        aria-label="Filtre par tags"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${tagFilter ? 'var(--color-primary)' : 'var(--color-border)'}`,
          outline: 'none',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family)',
          color: 'var(--color-text-secondary)',
          padding: '6px 0',
          transition: 'border-color 200ms ease',
        }}
      />
    </div>
  );
}
