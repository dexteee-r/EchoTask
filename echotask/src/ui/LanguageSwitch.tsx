// src/ui/LanguageSwitch.tsx
import React from "react";
import { useI18n } from "../i18n";
import { toast } from "./Toast";

export default function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value as any;
    setLang(newLang);
    toast(`${t("lang." + newLang)} 🌍`, { type: "info" });
  }

  return (
    <select
      value={lang}
      onChange={handleChange}
      aria-label={t("lang.label")}
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-tertiary)',
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        padding: '2px 4px',
        transition: 'color 200ms ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)'; }}
    >
      <option value="fr">FR</option>
      <option value="en">EN</option>
      <option value="ar">AR</option>
      <option value="es">ES</option>
      <option value="zh">ZH</option>
    </select>
  );
}
