import React, { useRef, useState } from 'react';
import { useAuth, StorageMode } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { exportTasksAsJSON, importTasksFromJSON } from '../db';
import { downloadFile, readFile } from '../utils';
import { toast } from './Toast';

interface SettingsModalProps {
  onClose: () => void;
  allowCloudAI: boolean;
  apiKey: string;
  onToggleCloudAI: () => void;
  onApiKeyChange: (key: string) => void;
  onImportDone: () => void;
}

export default function SettingsModal({
  onClose,
  allowCloudAI,
  apiKey,
  onToggleCloudAI,
  onApiKeyChange,
  onImportDone,
}: SettingsModalProps) {
  const { user, logout, mode, setMode } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Changer mot de passe ---
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // --- Supprimer le compte ---
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleModeChange = (newMode: StorageMode) => {
    if (newMode === mode) return;
    if (newMode === 'cloud') {
      setMode('cloud');
      onClose();
    } else {
      logout();
      onClose();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setPwdMsg({ text: 'Les mots de passe ne correspondent pas.', ok: false });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ text: 'Le mot de passe doit contenir au moins 6 caractères.', ok: false });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) {
      setPwdMsg({ text: error.message, ok: false });
    } else {
      setPwdMsg({ text: 'Mot de passe mis à jour.', ok: true });
      setNewPwd('');
      setConfirmPwd('');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'supprimer') return;
    setDeleteLoading(true);
    try {
      // Supprimer toutes les tâches de l'utilisateur en DB
      if (user) await supabase.from('tasks').delete().eq('user_id', user.id);
      await logout();
      onClose();
      toast('Compte supprimé. Vos données ont été effacées.', { type: 'info' });
    } catch {
      toast('Erreur lors de la suppression.', { type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    const json = await exportTasksAsJSON();
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(json, `echotask-export-${date}.json`, 'application/json');
    toast('Export téléchargé.', { type: 'success' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await readFile(file);
      const count = await importTasksFromJSON(json, user?.id);
      onImportDone();
      toast(`${count} tâche${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''}.`, { type: 'success' });
    } catch {
      toast('Fichier invalide.', { type: 'error' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Réutilisables ---
  const sectionStyle: React.CSSProperties = {
    marginBottom: 'var(--space-8)',
    paddingBottom: 'var(--space-6)',
    borderBottom: '1px solid var(--color-border)',
  };
  const eyeBtn = (show: boolean, toggle: () => void, label: string) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      style={{
        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center',
      }}
    >
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <div
      className="modal-overlay fade-in"
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
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

        {/* --- Stockage --- */}
        <section style={sectionStyle}>
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>Stockage</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            En mode <strong>local</strong>, vos données restent sur cet appareil.
            En mode <strong>cloud</strong>, elles sont synchronisées sur tous vos appareils.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {(['local', 'cloud'] as StorageMode[]).map(m => (
              <button key={m} onClick={() => handleModeChange(m)} style={{
                padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                border: `2px solid ${mode === m ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: mode === m ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: mode === m ? 'white' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
                transition: 'all 0.2s', textAlign: 'center',
              }}>
                {m === 'local' ? 'Local' : 'Cloud'}
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-normal)', marginTop: 2, opacity: 0.8 }}>
                  {m === 'local' ? 'Hors-ligne, privé' : 'Multi-appareils'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* --- Compte (si connecté) --- */}
        {user && (
          <section style={sectionStyle}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)' }}>Mon Compte</h3>

            {/* Email + déconnexion */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
              <p style={{ margin: '0 0 4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connecté en tant que</p>
              <p style={{ margin: '0 0 var(--space-4)', fontWeight: 'var(--font-bold)' }}>{user.email}</p>
              <button onClick={() => { logout(); onClose(); }} className="btn" style={{ width: '100%', color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent' }}>
                Se déconnecter
              </button>
            </div>

            {/* Changer mot de passe */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <button
                onClick={() => { setShowPwdForm(v => !v); setPwdMsg(null); }}
                className="btn"
                style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}
              >
                <span>Changer le mot de passe</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: showPwdForm ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showPwdForm && (
                <form onSubmit={handleChangePassword} className="fade-in" style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      className="input"
                      placeholder="Nouveau mot de passe"
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      required minLength={6}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    {eyeBtn(showNewPwd, () => setShowNewPwd(v => !v), 'Afficher le nouveau mot de passe')}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPwd ? 'text' : 'password'}
                      className="input"
                      placeholder="Confirmer le mot de passe"
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      required minLength={6}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    {eyeBtn(showConfirmPwd, () => setShowConfirmPwd(v => !v), 'Afficher la confirmation')}
                  </div>
                  {pwdMsg && (
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: pwdMsg.ok ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {pwdMsg.text}
                    </p>
                  )}
                  <button type="submit" disabled={pwdLoading} className="btn btn-primary">
                    {pwdLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </form>
              )}
            </div>

            {/* Supprimer le compte */}
            <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-error)', background: 'var(--color-error-light)' }}>
              <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-error)' }}>
                Zone dangereuse
              </p>
              <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Supprime définitivement toutes vos tâches. Tapez <strong>supprimer</strong> pour confirmer.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="supprimer"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'supprimer' || deleteLoading}
                  className="btn"
                  style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent', whiteSpace: 'nowrap' }}
                >
                  {deleteLoading ? '...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* --- Données (Export / Import) --- */}
        <section style={sectionStyle}>
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>Données</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Exportez vos tâches en JSON ou importez un fichier existant.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={handleExport} className="btn" style={{ flex: 1 }}>
              Exporter JSON
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn" style={{ flex: 1 }}>
              Importer JSON
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            aria-hidden
          />
        </section>

        {/* --- IA Cloud (OpenAI) --- */}
        <section>
          <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-base)' }}>Intelligence Artificielle</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Clé OpenAI pour la dictée Whisper et la réécriture intelligente.
            Stockée uniquement sur cet appareil.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <button type="button" onClick={onToggleCloudAI} style={{
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
              border: 'none', cursor: 'pointer',
              background: allowCloudAI ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
              color: allowCloudAI ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
              width: 'fit-content', transition: 'all 0.2s',
            }}>
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
