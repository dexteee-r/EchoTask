// src/ui/CloudConfig.tsx (Modernisé)
import React from 'react';

interface CloudConfigProps {
  allowCloud: boolean;
  apiKey: string;
  onToggleCloud: () => void;
  onApiKeyChange: (key: string) => void;
  cloudOnLabel: string;
  cloudOffLabel: string;
  apiKeyPlaceholder: string;
  warningMessage: string;
}

/**
 * Composant CloudConfig - Configuration Cloud (Modernisé)
 * 
 * Utilise le Design System pour :
 * - Badge toggle stylé
 * - Input avec validation visuelle
 * - Message d'avertissement coloré
 */
export default function CloudConfig({
  allowCloud,
  apiKey,
  onToggleCloud,
  onApiKeyChange,
  cloudOnLabel,
  cloudOffLabel,
  apiKeyPlaceholder,
  warningMessage
}: CloudConfigProps) {
  
  return (
    <div>
      {/* Toggle Cloud */}
      <button 
        type="button" 
        onClick={onToggleCloud} 
        className="badge"
        style={{
          cursor: 'pointer',
          background: allowCloud ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
          color: allowCloud ? 'white' : 'var(--color-text-secondary)',
          fontWeight: 'var(--font-semibold)',
          transition: 'all var(--transition-fast)',
        }}
      >
        {allowCloud ? '☁️ ' + cloudOnLabel : '🔒 ' + cloudOffLabel}
      </button>

      {/* Section API Key (visible si Cloud activé) */}
      {allowCloud && (
        <div 
          className="card fade-in"
          style={{ 
            marginTop: 'var(--space-2)',
            padding: 'var(--space-3)',
            position: 'absolute',
            zIndex: 'var(--z-dropdown)',
            minWidth: 300,
            maxWidth: 400,
          }}
        >
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-1)',
          }}>
            🔑 {apiKeyPlaceholder}
          </label>
          <input
            type="password"
            className="input"
            placeholder="sk-..."
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            style={{
              borderColor: !apiKey ? 'var(--color-error)' : 'var(--color-border)',
            }}
            aria-label="Clé API OpenAI"
          />
          
          {/* Avertissement si pas de clé */}
          {!apiKey && (
            <div style={{ 
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: 'var(--color-error-light)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              ⚠️ <span>{warningMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}