export function localRewrite(raw: string): string {
  const t = raw.trim().replace(/\s+/g, ' ');
  if (!t) return '';
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?…]$/.test(cap) ? cap : cap + '.';
}

export async function cloudRewrite(raw: string, apiKey: string, lang='fr', tone='neutral') {
  const system = `Reformule des mémos en phrases claires et actionnables. Langue: ${lang}. Ton: ${tone}. Ne renvoie que la phrase.`;
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [{ role:'system', content: system }, { role:'user', content: raw }]
    })
  });
  if (!r.ok) throw new Error('Rewrite cloud error');
  const j = await r.json();
  return j.choices?.[0]?.message?.content?.trim() ?? '';
}
