import React from "react";
import { useI18n } from "../i18n";
import { toast } from "./Toast";

export default function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value as any;
    setLang(newLang);
    // Affiche un toast sympa quand on change de langue
    toast(`${t("lang.label")}: ${t("lang." + newLang)} 🌍`, { type: "info" });
  }

  return (
    <label style={{ display:'flex', gap:6, alignItems:'center' }}>
      <span className="badge">{t("lang.label")}</span>
      <select
        value={lang}
        onChange={handleChange}
        className="badge"
        aria-label={t("lang.label")}
      >
        <option value="fr">{t("lang.fr")}</option>
        <option value="en">{t("lang.en")}</option>
        <option value="ar">{t("lang.ar")}</option>
        <option value="es">{t("lang.es")}</option>
        <option value="zh">{t("lang.zh")}</option>
      </select>
    </label>
  );
}
