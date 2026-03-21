import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';

export default function AuthScreen() {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setMessage({ text: "Erreur : Supabase n'est pas configuré. Vérifiez vos variables d'environnement.", type: 'error' });
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
          setMessage({ text: "Inscription réussie ! Veuillez confirmer votre email pour continuer.", type: 'success' });
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 'var(--space-4)',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)' }}>
        <ThemeToggle />
      </div>

      <div className="card fade-in" style={{
        width: '100%',
        maxWidth: 400,
        padding: 'var(--space-8)',
        textAlign: 'center'
      }}>
        {/* Logo & Titre */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-2)' }}>🎙️</div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-black)' }}>
            Echo<span style={{ color: 'var(--color-primary)' }}>Task</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Capturez vos idées, synchronisez votre vie.
          </p>
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
          <button 
            onClick={() => { setView('login'); setMessage(null); }}
            style={{
              flex: 1, paddingBottom: 'var(--space-2)', border: 'none', background: 'none', cursor: 'pointer',
              color: view === 'login' ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              borderBottom: view === 'login' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: 'var(--font-bold)', transition: 'all 0.2s'
            }}
          >
            Connexion
          </button>
          <button 
            onClick={() => { setView('signup'); setMessage(null); }}
            style={{
              flex: 1, paddingBottom: 'var(--space-2)', border: 'none', background: 'none', cursor: 'pointer',
              color: view === 'signup' ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              borderBottom: view === 'signup' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: 'var(--font-bold)', transition: 'all 0.2s'
            }}
          >
            Inscription
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleAuth} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Email</label>
            <input 
              type="email" 
              className="input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="votre@email.com"
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
              >
                {showPassword ? (
                  // Oeil barré
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  // Oeil ouvert
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: 48, marginTop: 'var(--space-2)' }}>
            {loading ? 'Chargement...' : (view === 'login' ? 'Se connecter' : 'Créer un compte')}
          </button>

          {message && (
            <div style={{ 
              padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              background: message.type === 'error' ? 'var(--color-error-light)' : 'var(--color-success-light)',
              color: message.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
              border: `1px solid ${message.type === 'error' ? 'var(--color-error)' : 'var(--color-success)'}`,
              lineHeight: 1.4
            }}>
              {message.text}
            </div>
          )}
        </form>

        <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
          En continuant, vous acceptez que vos données soient stockées de manière sécurisée et synchronisées sur tous vos appareils.
        </p>
      </div>
    </div>
  );
}
