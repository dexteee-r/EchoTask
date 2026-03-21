// src/ui/WelcomeModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeModalProps {
  onClose: () => void;
  title: string;
  subtitle: string;
  step1: string;
  step2: string;
  step3: string;
  startButton: string;
  learnMoreButton: string;
}

const steps = [
  { icon: '✦', key: 'step1' as const },
  { icon: '◎', key: 'step2' as const },
  { icon: '◇', key: 'step3' as const },
];

export default function WelcomeModal({
  onClose,
  title, subtitle,
  step1, step2, step3,
  startButton, learnMoreButton,
}: WelcomeModalProps) {
  const stepTexts = { step1, step2, step3 };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="welcome-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
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
        key="welcome-card"
        initial={{ opacity: 0, y: 24, scale: 0.97, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 420px)',
          background: 'var(--color-glass)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 24,
          border: '1px solid var(--color-glass-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.10)',
          padding: 'var(--space-8)',
          zIndex: 1401,
        }}
      >
        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-7)' }}>
          <h2 style={{
            margin: '0 0 var(--space-2)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(1.6rem,5vw,2.2rem)',
            letterSpacing: '-0.02em',
            color: 'var(--color-text)',
          }}>
            {title}
          </h2>
          <p style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
          }}>
            {subtitle}
          </p>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 'var(--space-7)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {steps.map(({ icon, key }, i) => {
            const raw = stepTexts[key];
            const [head, ...rest] = raw.split(':');
            const body = rest.join(':').trim();
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}
              >
                <span style={{
                  width: 22, height: 22, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: 'var(--color-primary)', marginTop: 2,
                }}>
                  {icon}
                </span>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-text)' }}>
                    {head.trim()}
                  </p>
                  {body && (
                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                      {body}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '11px var(--space-4)',
              background: 'var(--color-text)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              fontFamily: 'var(--font-family)', cursor: 'pointer',
            }}
          >
            {startButton}
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '11px var(--space-4)',
              background: 'transparent', color: 'var(--color-text-tertiary)',
              border: 'none', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family)', cursor: 'pointer',
            }}
          >
            {learnMoreButton}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
