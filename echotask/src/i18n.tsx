import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";

type Dict = Record<string, string>;
type Lang = "fr" | "en" | "ar" | "es" | "zh";

const dictionaries: Record<Lang, Dict> = { fr, en, ar, es, zh };

function detectLang(): Lang {
  const saved = localStorage.getItem("lang") as Lang | null;
  if (saved && dictionaries[saved]) return saved;
  const nav = (navigator.language || "en").toLowerCase();
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("zh")) return "zh";
  return "en";
}

// Map langue -> codes utiles
export const LANG_META: Record<Lang, { stt: string; whisper: string; dir: "ltr"|"rtl" }> = {
  fr: { stt: "fr-FR", whisper: "fr", dir: "ltr" },
  en: { stt: "en-US", whisper: "en", dir: "ltr" },
  ar: { stt: "ar-SA", whisper: "ar", dir: "rtl" },
  es: { stt: "es-ES", whisper: "es", dir: "ltr" },
  zh: { stt: "zh-CN", whisper: "zh", dir: "ltr" }
};

type Ctx = {
  lang: Lang;
  t: (key: string) => string;
  setLang: (l: Lang) => void;
};
const I18nContext = createContext<Ctx>({ lang: "en", t: (k)=>k, setLang: ()=>{} });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang());

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  // t() avec fallback clé si manquante
  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.en;
    return (key: string) => dict[key] ?? key;
  }, [lang]);

  // Appliquer lang/dir sur <html>
  useEffect(() => {
    const meta = LANG_META[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
