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
 * Composant FilterBar
 * 
 * Barre de recherche et filtrage :
 * - Recherche texte (dans rawText et cleanText)
 * - Filtre par tags (multi-tags séparés par virgules)
 * 
 * @param search - Valeur de la recherche texte
 * @param tagFilter - Valeur du filtre tags
 * @param onSearchChange - Callback changement recherche
 * @param onTagFilterChange - Callback changement filtre tags
 * @param searchPlaceholder - Placeholder recherche (traduit)
 * @param tagFilterPlaceholder - Placeholder filtre tags (traduit)
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
      marginTop: 12, 
      display: 'grid', 
      gap: 8 
    }}>
      {/* Recherche texte */}
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        style={{ 
          padding: 12, 
          border: '1px solid #ccc', 
          borderRadius: 8,
          fontSize: '1em',
          width: '100%'
        }}
        aria-label="Recherche"
      />

      {/* Filtre tags */}
      <input
        type="text"
        value={tagFilter}
        onChange={e => onTagFilterChange(e.target.value)}
        placeholder={tagFilterPlaceholder}
        style={{ 
          padding: 12, 
          border: '1px solid #ccc', 
          borderRadius: 8,
          fontSize: '1em',
          width: '100%'
        }}
        aria-label="Filtre par tags"
      />
    </div>
  );
}