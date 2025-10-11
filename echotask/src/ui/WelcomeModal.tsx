// src/ui/WelcomeModal.tsx
import React, { useEffect, useState } from 'react';

interface WelcomeModalProps {
  onClose: () => void;
  // Labels traduits
  title: string;
  subtitle: string;
  step1: string;
  step2: string;
  step3: string;
  startButton: string;
  learnMoreButton: string;
}

/**
 * WelcomeModal - Écran d'accueil première visite
 * 
 * Affiche :
 * - Titre et description
 * - 3 étapes principales
 * - Boutons d'action
 * 
 * S'affiche uniquement à la première visite (localStorage)
 */
export default function WelcomeModal({
  onClose,
  title,
  subtitle,
  step1,
  step2,
  step3,
  startButton,
  learnMoreButton
}: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Petit délai pour l'animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Attendre la fin de l'animation
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`backdrop ${isVisible ? 'fade-in' : 'fade-out'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="modal">
        <div className={`modal-content ${isVisible ? 'fade-in-scale' : 'fade-out-scale'}`}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: 'var(--space-3)',
              animation: 'bounce 0.6s ease'
            }}>
            </div>
            <h2 style={{ 
              margin: 0,
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-2)'
            }}>
              {title}
            </h2>
            <p style={{ 
              margin: 0,
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              {subtitle}
            </p>
          </div>

          {/* Steps */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            {/* Step 1 */}
            <div className="stagger-item" style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ 
                fontSize: '2rem',
                flexShrink: 0,
              }}>
                📝
              </div>
              <div>
                <h3 style={{ 
                  margin: 0,
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {step1.split(':')[0]}
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-normal)'
                }}>
                  {step1.split(':')[1]}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="stagger-item" style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ 
                fontSize: '2rem',
                flexShrink: 0,
              }}>
                ✨
              </div>
              <div>
                <h3 style={{ 
                  margin: 0,
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {step2.split(':')[0]}
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-normal)'
                }}>
                  {step2.split(':')[1]}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="stagger-item" style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ 
                fontSize: '2rem',
                flexShrink: 0,
              }}>
                ✅
              </div>
              <div>
                <h3 style={{ 
                  margin: 0,
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {step3.split(':')[0]}
                </h3>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-normal)'
                }}>
                  {step3.split(':')[1]}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ 
            display: 'flex',
            gap: 'var(--space-2)',
            flexDirection: 'column'
          }}>
            <button 
              onClick={handleClose}
              className="btn btn-primary ripple"
              style={{ width: '100%' }}
            >
              {startButton}
            </button>
            <button 
              onClick={handleClose}
              className="btn btn-ghost"
              style={{ width: '100%' }}
            >
              {learnMoreButton}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}