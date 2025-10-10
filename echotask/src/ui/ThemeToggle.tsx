// src/ui/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../ThemeProvider';

/**
 * Composant ThemeToggle
 * 
 * Bouton pour basculer entre mode clair et sombre
 * Affiche une icône soleil (☀️) ou lune (🌙) selon le thème actuel
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-ghost"
      style={{
        width: 40,
        height: 40,
        padding: 0,
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        transition: 'all var(--transition-fast)',
      }}
      aria-label={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}