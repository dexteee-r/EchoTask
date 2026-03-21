// src/ui/AuthScreen.tsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';

export default function AuthScreen() {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const [emailFocused, setEmailFocused] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setMessage({ text: "Supabase n'est pas configuré. Vérifiez vos variables d'environnement.", type: 'error' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session && data.user) {
          setMessage({ text: 'Inscription réussie ! Confirmez votre email pour continuer.', type: 'success' });
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const ghost: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: '10px 0',
    fontFamily: 'var(--font-family)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text)',
    lineHeight: 1.5,
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)',
      position: 'relative',
    }}>
      {/* Controls */}
      <div style={{ position: 'fixed', top: 'var(--space-4)', right: 'var(--space-4)', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 380 }}
      >
        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2.8rem, 10vw, 3.8rem)',
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
            lineHeight: 1.1,
          }}>
            EchoTask
          </h1>
          <p style={{
            margin: 'var(--space-3) 0 0',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 1.6,
          }}>
            Capturez vos idées, synchronisez votre vie.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {(['login', 'signup'] as const).map(v => (
            <button key={v} type="button"
              onClick={() => { setView(v); setMessage(null); }}
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family)',
                color: view === v ? 'var(--color-text)' : 'var(--color-text-tertiary)',
                fontWeight: view === v ? 'var(--font-medium)' : 400,
                position: 'relative', paddingBottom: 6,
                transition: 'color 200ms ease',
              }}>
              {v === 'login' ? 'Connexion' : 'Inscription'}
              {view === v && (
                <motion.div
                  layoutId="auth-tab-indicator"
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                    background: 'var(--color-text)',
                    borderRadius: 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Email */}
          <div>
            <label style={{
              display: 'block', marginBottom: 2,
              fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={ghost}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: emailFocused ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background 200ms ease',
              }} />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label style={{
              display: 'block', marginBottom: 2,
              fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required minLength={6}
                style={{ ...ghost, paddingRight: 32 }}
                onFocus={() => setPwdFocused(true)}
                onBlur={() => setPwdFocused(false)}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: pwdFocused ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background 200ms ease',
              }} />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? (
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
            </div>
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 'var(--text-sm)',
                  background: message.type === 'error'
                    ? 'rgba(248,113,113,0.10)'
                    : 'rgba(52,211,153,0.10)',
                  color: message.type === 'error'
                    ? 'var(--color-error)'
                    : 'var(--color-success)',
                  lineHeight: 1.5,
                }}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '12px var(--space-4)',
              background: 'var(--color-text)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              fontFamily: 'var(--font-family)', cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 200ms ease',
            }}
          >
            {loading ? '...' : view === 'login' ? 'Se connecter' : 'Créer un compte'}
          </motion.button>
        </form>

        <p style={{
          marginTop: 'var(--space-8)',
          fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
          lineHeight: 1.6, textAlign: 'center',
        }}>
          Vos données sont stockées de manière sécurisée.
        </p>
      </motion.div>
    </div>
  );
}
