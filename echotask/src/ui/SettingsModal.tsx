import React from 'react';
import { useAuth, StorageMode } from '../contexts/AuthContext';

interface SettingsModalProps {
  onClose: () => void;
  allowCloudAI: boolean;
  apiKey: string;
  onToggleCloudAI: () => void;
  onApiKeyChange: (key: string) => void;
}

export default function SettingsModal({
  onClose,
  allowCloudAI,
  apiKey,
  onToggleCloudAI,
  onApiKeyChange
}: SettingsModalProps) {
  const { user, logout, mode, setMode } = useAuth();

  const handleModeChange = (newMode: StorageMode) => {
    if (newMode === mode) return;
    if (newMode === 'cloud') {
      // Passer en cloud : on change le mode, App.tsx redirigera vers AuthScreen si pas connecté
      setMode('cloud');
      onClose();
    } else {
      // Passer en local : déconnexion + mode local
      logout();
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay fade-in"
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        className="card slide-up"
        onClick={e => e.stopPropagation()}
        style={{ width: '90%', maxWidth: 450, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)' }}
      >
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Paramètres</h2>
          <button onClick={onClose} className="btn-icon" aria-label="Fermer" style={{ fontSize: '1.5rem' }}>×</button>
        </div>

        {/* --- Section Stockage --- */}
        <section style={{ marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>Stockage</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            En mode <strong>local</strong>, vos données restent sur cet appareil — aucun compte requis.
            En mode <strong>cloud</strong>, elles sont synchronisées sur tous vos appareils via votre compte.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            <button
              onClick={() => handleModeChange('local')}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${mode === 'local' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: mode === 'local' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: mode === 'local' ? 'white' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
            >
              Local
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-normal)', marginTop: 2, opacity: 0.8 }}>
                Hors-ligne, privé
              </div>
            </button>

            <button
              onClick={() => handleModeChange('cloud')}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${mode === 'cloud' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: mode === 'cloud' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: mode === 'cloud' ? 'white' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
            >
              Cloud
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-normal)', marginTop: 2, opacity: 0.8 }}>
                Multi-appareils
              </div>
            </button>
          </div>
        </section>

        {/* --- Section Compte (seulement si connecté) --- */}
        {user && (
          <section style={{ marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>Mon Compte</h3>
            <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connecté en tant que</p>
                <p style={{ margin: '4px 0 0', fontWeight: 'var(--font-bold)', color: 'var(--color-text)' }}>{user.email}</p>
              </div>
              <button
                onClick={() => { logout(); onClose(); }}
                className="btn"
                style={{ width: '100%', color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent' }}
              >
                Se déconnecter
              </button>
            </div>
          </section>
        )}

        {/* --- Section IA Cloud (OpenAI) --- */}
        <section>
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>Intelligence Artificielle</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Clé OpenAI pour la dictée Whisper et la réécriture intelligente (GPT-4o-mini).
            Stockée uniquement sur cet appareil.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <button
              type="button"
              onClick={onToggleCloudAI}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                background: allowCloudAI ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: allowCloudAI ? 'white' : 'var(--color-text-secondary)',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
                width: 'fit-content',
                transition: 'all 0.2s',
              }}
            >
              {allowCloudAI ? 'IA activée' : 'IA désactivée'}
            </button>

            {allowCloudAI && (
              <div className="fade-in">
                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', display: 'block' }}>
                  Clé API OpenAI
                </label>
                <input
                  type="password"
                  className="input"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={e => onApiKeyChange(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
