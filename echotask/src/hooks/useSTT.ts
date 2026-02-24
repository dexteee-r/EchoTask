// src/hooks/useSTT.ts
import { useRef, useState } from 'react';
import { sttSupported, startLocalSTT, recordAndTranscribeCloud } from '../stt';

/**
 * Hook useSTT
 * 
 * Gère la dictée vocale (locale et cloud) :
 * - Détection du support Web Speech
 * - Démarrage/arrêt STT local
 * - Démarrage/arrêt STT cloud (Whisper)
 * - Gestion des états d'écoute
 * 
 * @param onTranscript - Callback appelé avec le texte transcrit
 * @param sttLang - Code langue pour STT local (ex: 'fr-FR')
 * @param whisperLang - Code langue pour Whisper (ex: 'fr')
 * @param apiKey - Clé API OpenAI (pour cloud)
 * 
 * @returns {Object} Méthodes et état pour gérer le STT
 */
export function useSTT(
  onTranscript: (text: string) => void,
  sttLang: string = 'fr-FR',
  whisperLang: string = 'fr',
  apiKey?: string,
  onSttError?: (code: string) => void
) {
  // États d'écoute
  const [listeningLocal, setListeningLocal] = useState(false);
  const [listeningCloud, setListeningCloud] = useState(false);

  // Références pour arrêter l'écoute
  const stopLocalRef = useRef<null | (() => void)>(null);
  const stopCloudRef = useRef<null | (() => Promise<void>)>(null);

  /**
   * Vérifie si Web Speech est supporté
   */
  const isSupported = sttSupported();

  /**
   * Démarre la dictée locale (Web Speech API)
   * 
   * @throws {Error} Si Web Speech non supporté
   */
  function startLocal() {
    if (!isSupported) {
      throw new Error('STT non supporté par ce navigateur');
    }

    setListeningLocal(true);
    stopLocalRef.current = startLocalSTT(
      (text) => onTranscript(text),
      () => setListeningLocal(false),
      sttLang,
      (code) => {
        setListeningLocal(false);
        onSttError?.(code);
      }
    );
  }

  /**
   * Arrête la dictée locale
   */
  function stopLocal() {
    stopLocalRef.current?.();
    setListeningLocal(false);
  }

  /**
   * Démarre la dictée cloud (Whisper API)
   * 
   * @throws {Error} Si pas de clé API fournie
   * @throws {Error} Si erreur d'enregistrement
   */
  async function startCloud() {
    if (!apiKey) {
      throw new Error('Clé API requise pour STT cloud');
    }

    try {
      setListeningCloud(true);
      const recorder = await recordAndTranscribeCloud(apiKey, whisperLang);

      // Stocker la fonction stop
      stopCloudRef.current = async () => {
        const text = await recorder.stop();
        onTranscript(text);
        setListeningCloud(false);
        stopCloudRef.current = null;
      };
    } catch (error) {
      setListeningCloud(false);
      throw error;
    }
  }

  /**
   * Arrête la dictée cloud
   */
  async function stopCloud() {
    if (stopCloudRef.current) {
      await stopCloudRef.current();
    }
  }

  // API publique du hook
  return {
    // État
    isSupported,
    listeningLocal,
    listeningCloud,

    // Actions locales
    startLocal,
    stopLocal,

    // Actions cloud
    startCloud,
    stopCloud
  };
}