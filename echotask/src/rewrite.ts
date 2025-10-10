// src/rewrite.ts
import { RewriteTone } from './types';
import { API_URLS, REWRITE_CONFIG } from './constants';
import { cleanSpaces, capitalize, ensurePunctuation } from './utils';

/**
 * Réécriture locale simple
 * - Nettoie les espaces multiples
 * - Capitalise la première lettre
 * - Ajoute une ponctuation finale si absente
 */
export function localRewrite(raw: string): string {
  const cleaned = cleanSpaces(raw);
  if (!cleaned) return '';
  const capitalized = capitalize(cleaned);
  return ensurePunctuation(capitalized);
}

/**
 * Réécriture cloud via GPT-4
 * 
 * @param raw - Texte brut à réécrire
 * @param apiKey - Clé API OpenAI
 * @param lang - Langue cible (fr/en/ar)
 * @param tone - Ton de réécriture (neutral/professional/friendly/casual)
 * @returns {Promise<string>} Texte réécrit
 */
export async function cloudRewrite(
  raw: string, 
  apiKey: string, 
  lang: string = 'fr', 
  tone: RewriteTone = 'neutral'
): Promise<string> {
  const system = REWRITE_CONFIG.DEFAULT_SYSTEM_PROMPT(lang, tone);
  
  const r = await fetch(API_URLS.CHAT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: REWRITE_CONFIG.MODEL,
      temperature: REWRITE_CONFIG.TEMPERATURE,
      messages: [
        { role: 'system', content: system }, 
        { role: 'user', content: raw }
      ]
    })
  });
  
  if (!r.ok) throw new Error('Rewrite cloud error');
  const j = await r.json();
  return j.choices?.[0]?.message?.content?.trim() ?? '';
}