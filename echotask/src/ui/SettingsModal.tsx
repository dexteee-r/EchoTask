// src/ui/SettingsModal.tsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  onClose, allowCloudAI, apiKey, onToggleCloudAI, onApiKeyChange, onImportDone,
}: SettingsModalProps) {
  const { user, logout, mode, setMode } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ghost: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    outline: 'none',
    padding: '8px 0',
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text)',
    lineHeight: 1.6,
    transition: 'border-color 200ms ease',
  };

  const sectionLabel: React.CSSProperties = {
    margin: '0 0 var(--space-4)',
    fontSize: 'var(--text-xs)',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: 'var(--color-text-tertiary)',
    fontWeight: 'var(--font-medium)',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--color-primary)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderBottomColor = 'var(--color-border)';
  };

  const handleModeChange = (newMode: StorageMode) => {
    if (newMode === mode) return;
    if (newMode === 'cloud') { setMode('cloud'); onClose(); }
    else { logout(); onClose(); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdMsg({ text: 'Les mots de passe ne correspondent pas.', ok: false }); return; }
    if (newPwd.length < 6) { setPwdMsg({ text: 'Minimum 6 caractères.', ok: false }); return; }
    setPwdLoading(true); setPwdMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdLoading(false);
    if (error) { setPwdMsg({ text: error.message, ok: false }); }
    else { setPwdMsg({ text: 'Mot de passe mis à jour.', ok: true }); setNewPwd(''); setConfirmPwd(''); }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'supprimer') return;
    setDeleteLoading(true);
    try {
      if (user) await supabase.from('tasks').delete().eq('user_id', user.id);
      await logout(); onClose();
      toast('Compte supprimé.', { type: 'info' });
    } catch { toast('Erreur lors de la suppression.', { type: 'error' }); }
    finally { setDeleteLoading(false); }
  };

  const handleExport = async () => {
    const json = await exportTasksAsJSON();
    downloadFile(json, `echotask-export-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
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
    } catch { toast('Fichier invalide.', { type: 'error' }); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const eyeButton = (show: boolean, toggle: () => void, label: string) => (
    <button type="button" onClick={toggle} aria-label={label} style={{
      position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', padding: 4,
      color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center',
    }}>
      <EyeIcon show={show} />
    </button>
  );

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="settings-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1400,
        }}
      />

      {/* Card */}
      <motion.div
        key="settings-card"
        initial={{ opacity: 0, y: 20, scale: 0.97, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(94vw, 460px)',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-glass)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 24,
          border: '1px solid var(--color-glass-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
          zIndex: 1401,
        }}
      >
        {/* Header fixe */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'var(--space-6) var(--space-7) var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <p style={sectionLabel}>Paramètres</p>
          <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.9 }} aria-label="Fermer" style={{
            width: 28, height: 28, padding: 0,
            background: 'transparent', border: 'none',
            borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-tertiary)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--space-6) var(--space-7)' }}>

          {/* Stockage */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <p style={sectionLabel}>Stockage</p>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
              Mode <em>local</em> — données sur cet appareil uniquement.<br />
              Mode <em>cloud</em> — synchronisation multi-appareils.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(['local', 'cloud'] as StorageMode[]).map(m => (
                <motion.button key={m} type="button" onClick={() => handleModeChange(m)} whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '9px var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: mode === m ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                    color: mode === m ? 'white' : 'var(--color-text-secondary)',
                    fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
                    fontWeight: mode === m ? 'var(--font-medium)' : 400,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {m === 'local' ? 'Local' : 'Cloud'}
                </motion.button>
              ))}
            </div>
          </section>

          {/* Compte */}
          {user && (
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <p style={sectionLabel}>Compte</p>

              {/* Email + déconnexion */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  Connecté en tant que
                </p>
                <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  {user.email}
                </p>
                <motion.button type="button" onClick={() => { logout(); onClose(); }} whileTap={{ scale: 0.97 }}
                  style={{
                    background: 'transparent', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)', padding: '7px var(--space-4)',
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)', cursor: 'pointer',
                  }}>
                  Se déconnecter
                </motion.button>
              </div>

              {/* Changer mot de passe */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <button type="button"
                  onClick={() => { setShowPwdForm(v => !v); setPwdMsg(null); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
                    fontFamily: 'var(--font-family)', display: 'flex', alignItems: 'center', gap: 6,
                    letterSpacing: '0.05em',
                  }}>
                  Changer le mot de passe
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showPwdForm ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                <AnimatePresence>
                  {showPwdForm && (
                    <motion.form
                      onSubmit={handleChangePassword}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28 }}
                      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <input type={showNewPwd ? 'text' : 'password'} placeholder="Nouveau mot de passe"
                          value={newPwd} onChange={e => setNewPwd(e.target.value)}
                          required minLength={6}
                          style={{ ...ghost, paddingRight: 28 }} onFocus={onFocus} onBlur={onBlur}
                        />
                        {eyeButton(showNewPwd, () => setShowNewPwd(v => !v), 'Afficher')}
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type={showConfirmPwd ? 'text' : 'password'} placeholder="Confirmer"
                          value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                          required minLength={6}
                          style={{ ...ghost, paddingRight: 28 }} onFocus={onFocus} onBlur={onBlur}
                        />
                        {eyeButton(showConfirmPwd, () => setShowConfirmPwd(v => !v), 'Afficher')}
                      </div>
                      {pwdMsg && (
                        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: pwdMsg.ok ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {pwdMsg.text}
                        </p>
                      )}
                      <motion.button type="submit" disabled={pwdLoading} whileTap={{ scale: 0.97 }}
                        style={{
                          alignSelf: 'flex-start',
                          background: 'var(--color-text)', color: 'white',
                          border: 'none', borderRadius: 'var(--radius-full)',
                          padding: '7px var(--space-4)',
                          fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
                          cursor: 'pointer', opacity: pwdLoading ? 0.5 : 1,
                        }}>
                        {pwdLoading ? 'Mise à jour...' : 'Mettre à jour'}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Zone dangereuse */}
              <div style={{
                padding: 'var(--space-4)',
                borderRadius: 14,
                border: '1px solid rgba(248,113,113,0.25)',
                background: 'rgba(248,113,113,0.05)',
              }}>
                <p style={{ margin: '0 0 var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Zone dangereuse
                </p>
                <p style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                  Supprime définitivement toutes vos tâches. Tapez <strong style={{ color: 'var(--color-text-secondary)' }}>supprimer</strong> pour confirmer.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input type="text" placeholder="supprimer" value={deleteInput}
                    onChange={e => setDeleteInput(e.target.value)}
                    style={{ ...ghost, flex: 1 }} onFocus={onFocus} onBlur={onBlur}
                  />
                  <motion.button type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'supprimer' || deleteLoading}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'transparent', border: '1px solid var(--color-error)',
                      borderRadius: 'var(--radius-full)', padding: '7px var(--space-3)',
                      fontSize: 'var(--text-xs)', color: 'var(--color-error)',
                      fontFamily: 'var(--font-family)', cursor: 'pointer', whiteSpace: 'nowrap',
                      opacity: deleteInput !== 'supprimer' || deleteLoading ? 0.4 : 1,
                    }}>
                    {deleteLoading ? '...' : 'Supprimer'}
                  </motion.button>
                </div>
              </div>
            </section>
          )}

          {/* Données */}
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <p style={sectionLabel}>Données</p>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
              Exportez ou importez vos tâches au format JSON.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {[
                { label: 'Exporter JSON', onClick: handleExport },
                { label: 'Importer JSON', onClick: () => fileInputRef.current?.click() },
              ].map(({ label, onClick }) => (
                <motion.button key={label} type="button" onClick={onClick} whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '9px var(--space-3)',
                    background: 'rgba(0,0,0,0.05)', border: 'none',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family)', cursor: 'pointer',
                  }}>
                  {label}
                </motion.button>
              ))}
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport}
              style={{ display: 'none' }} aria-hidden />
          </section>

          {/* IA */}
          <section style={{ paddingBottom: 'var(--space-2)' }}>
            <p style={sectionLabel}>Intelligence Artificielle</p>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
              Clé OpenAI pour Whisper et la réécriture. Stockée uniquement sur cet appareil.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <motion.button type="button" onClick={onToggleCloudAI} whileTap={{ scale: 0.97 }}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px var(--space-4)',
                  borderRadius: 'var(--radius-full)', border: 'none',
                  background: allowCloudAI ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                  color: allowCloudAI ? 'white' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {allowCloudAI ? 'IA activée' : 'IA désactivée'}
              </motion.button>

              <AnimatePresence>
                {allowCloudAI && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <label style={{ ...sectionLabel, display: 'block', marginBottom: 4 }}>Clé API OpenAI</label>
                    <input type="password" placeholder="sk-..." value={apiKey}
                      onChange={e => onApiKeyChange(e.target.value)}
                      style={ghost} onFocus={onFocus} onBlur={onBlur}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
