// src/ui/CloudConfig.tsx
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
 * Composant CloudConfig
 * 
 * Section de configuration Cloud :
 * - Toggle Cloud ON/OFF
 * - Champ API key (visible si Cloud activé)
 * - Message d'avertissement si Cloud activé sans clé
 * 
 * @param allowCloud - État du Cloud (activé/désactivé)
 * @param apiKey - Clé API OpenAI
 * @param onToggleCloud - Callback toggle Cloud
 * @param onApiKeyChange - Callback changement API key
 * @param cloudOnLabel - Label "Cloud: ON" (traduit)
 * @param cloudOffLabel - Label "Cloud: OFF" (traduit)
 * @param apiKeyPlaceholder - Placeholder clé API (traduit)
 * @param warningMessage - Message d'avertissement (traduit)
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
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #ccc',
          backgroundColor: allowCloud ? '#e3f2fd' : '#f5f5f5',
          fontWeight: 600
        }}
      >
        {allowCloud ? cloudOnLabel : cloudOffLabel}
      </button>

      {/* Section API Key (visible si Cloud activé) */}
      {allowCloud && (
        <div style={{ marginTop: 8 }}>
          <input
            type="password"
            placeholder={apiKeyPlaceholder}
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            style={{
              width: '100%',
              padding: 8,
              borderColor: !apiKey && allowCloud ? '#b00020' : '#ccc',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 8,
              fontSize: '0.95em'
            }}
            aria-label="Clé API OpenAI"
          />
          
          {/* Avertissement si pas de clé */}
          {allowCloud && !apiKey && (
            <div style={{ 
              color: '#b00020', 
              marginTop: 4,
              fontSize: '0.9em',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              ⚠️ {warningMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}