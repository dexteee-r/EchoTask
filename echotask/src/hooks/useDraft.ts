// src/hooks/useDraft.ts
import { useState } from 'react';
import { localRewrite, cloudRewrite } from '../rewrite';

/**
 * Hook useDraft
 * 
 * Gère le brouillon de tâche (dictée vocale) :
 * - Texte brut (rawText)
 * - Texte amélioré (cleanText)
 * - Tags du brouillon
 * - Amélioration locale/cloud
 * 
 * @returns {Object} État et méthodes pour gérer le brouillon
 */
export function useDraft() {
  // État du brouillon
  const [draft, setDraft] = useState('');
  const [clean, setClean] = useState('');
  const [tags, setTags] = useState('');

  /**
   * Met à jour le brouillon avec un nouveau texte
   * Peut aussi calculer automatiquement la version améliorée
   * 
   * @param text - Nouveau texte brut
   * @param autoImprove - Si true, améliore automatiquement avec localRewrite
   */
  function updateDraft(text: string, autoImprove: boolean = false) {
    setDraft(text);
    if (autoImprove) {
      setClean(localRewrite(text));
    }
  }

  /**
   * Met à jour la version améliorée
   * 
   * @param text - Nouveau texte amélioré
   */
  function updateClean(text: string) {
    setClean(text);
  }

  /**
   * Met à jour les tags du brouillon
   * 
   * @param newTags - Nouveaux tags (séparés par virgules)
   */
  function updateTags(newTags: string) {
    setTags(newTags);
  }

  /**
   * Améliore le brouillon avec réécriture locale
   */
  function improveLocal() {
    if (!draft.trim()) return;
    setClean(localRewrite(draft));
  }

  /**
   * Améliore le brouillon avec réécriture cloud (IA)
   * 
   * @param apiKey - Clé API OpenAI
   * @param lang - Langue cible (fr/en/ar)
   * @param tone - Ton de réécriture (neutral/pro/friendly)
   * @throws {Error} Si erreur API
   */
  async function improveCloud(apiKey: string, lang: string = 'fr', tone: string = 'neutral') {
    if (!draft.trim()) return;
    if (!apiKey) {
      throw new Error('Clé API requise pour amélioration cloud');
    }

    const improved = await cloudRewrite(draft, apiKey, lang, tone);
    setClean(improved);
  }

  /**
   * Vérifie si le brouillon a du contenu
   */
  function hasContent(): boolean {
    return draft.trim().length > 0 || clean.trim().length > 0;
  }

  /**
   * Réinitialise complètement le brouillon
   */
  function clear() {
    setDraft('');
    setClean('');
    setTags('');
  }

  /**
   * Récupère le contenu du brouillon pour sauvegarde
   */
  function getContent() {
    return {
      raw: draft.trim(),
      clean: clean.trim() || null,
      tags: tags
    };
  }

  // API publique du hook
  return {
    // État
    draft,
    clean,
    tags,
    hasContent: hasContent(),

    // Setters
    setDraft,
    setClean,
    setTags,
    updateDraft,
    updateClean,
    updateTags,

    // Actions
    improveLocal,
    improveCloud,
    clear,
    getContent
  };
}