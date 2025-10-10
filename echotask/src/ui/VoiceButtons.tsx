// src/ui/VoiceButtons.tsx
import React from 'react';

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
 * Composant VoiceButtons
 * 
 * Boutons de dictée vocale :
 * - Bouton micro local (Web Speech API)
 * - Bouton micro cloud (Whisper API)
 * - Indicateur d'écoute (●)
 * - Désactivation si non supporté
 * 
 * Utilisation : Press & Hold (maintenir appuyé)
 * 
 * @param listeningLocal - État écoute locale
 * @param listeningCloud - État écoute cloud
 * @param sttSupported - Web Speech supporté ?
 * @param onStartLocal - Callback démarrage local
 * @param onStopLocal - Callback arrêt local
 * @param onStartCloud - Callback démarrage cloud
 * @param onStopCloud - Callback arrêt cloud
 * @param localLabel - Label bouton local (traduit)
 * @param cloudLabel - Label bouton cloud (traduit)
 * @param unsupportedTooltip - Tooltip si non supporté (traduit)
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
  unsupportedTooltip
}: VoiceButtonsProps) {
  
  return (
    <div className="input-row" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
      {/* Bouton micro local */}
      <button
        type="button"
        onPointerDown={onStartLocal}
        onPointerUp={onStopLocal}
        disabled={!sttSupported}
        title={!sttSupported ? unsupportedTooltip : localLabel}
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #ccc',
          backgroundColor: listeningLocal ? '#ffebee' : '#fff',
          cursor: sttSupported ? 'pointer' : 'not-allowed',
          opacity: sttSupported ? 1 : 0.5,
          fontWeight: 600,
          fontSize: '0.95em',
          transition: 'background-color 0.2s'
        }}
      >
        🎤 {localLabel} {listeningLocal ? '●' : ''}
      </button>

      {/* Bouton micro cloud */}
      <button
        type="button"
        onPointerDown={onStartCloud}
        onPointerUp={onStopCloud}
        title={cloudLabel}
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #ccc',
          backgroundColor: listeningCloud ? '#e3f2fd' : '#fff',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.95em',
          transition: 'background-color 0.2s'
        }}
      >
        ☁️ {cloudLabel} {listeningCloud ? '●' : ''}
      </button>
    </div>
  );
}