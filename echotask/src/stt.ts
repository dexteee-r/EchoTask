// src/stt.ts

export type SttOpts = { language?: string; allowCloud?: boolean; whisperApiKey?: string };

// Détection Web Speech (Chrome/Edge/Android OK ; Safari iOS variable)
const SpeechRec: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function sttSupported(): boolean {
  return !!SpeechRec;
}

/**
 * STT local via Web Speech API
 * Renvoie une fonction stop() pour arrêter l’écoute.
 */
export function startLocalSTT(
  onResult: (text: string) => void,
  onEnd?: () => void,
  lang = 'fr-FR'
) {
  if (!SpeechRec) throw new Error('STT non supporté');
  const rec = new SpeechRec();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = true;

  let finalText = '';
  let raf = 0;

  rec.onresult = (e: any) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t + ' ';
      else interim += t;
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => onResult((finalText + interim).trim()));
  };

  rec.onend = () => onEnd && onEnd();
  rec.onerror = () => onEnd && onEnd();

  rec.start();
  return () => rec.stop();
}

/**
 * Fallback cloud (Whisper) : enregistre avec MediaRecorder puis POST vers l'API.
 * Usage :
 *   const rec = await recordAndTranscribeCloud(API_KEY)
 *   ... au stop(): const text = await rec.stop()
 */
export async function recordAndTranscribeCloud(
  whisperApiKey: string,
  language = 'fr'
) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: BlobPart[] = [];
  const mr = new MediaRecorder(stream);

  const done = new Promise<Blob>((resolve) => {
    mr.ondataavailable = (e) => chunks.push(e.data);
    mr.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }));
  });

  mr.start();

  return {
    stop: async () => {
      mr.stop();
      stream.getTracks().forEach((t) => t.stop());
      const blob = await done;

      const fd = new FormData();
      fd.append('file', blob, 'audio.webm');
      fd.append('model', 'whisper-1');
      fd.append('language', language);

      const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${whisperApiKey}` },
        body: fd,
      });
      if (!r.ok) throw new Error('STT cloud error');
      const j = await r.json();
      return (j.text as string) || '';
    },
  };
}
