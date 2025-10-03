import React from "react";
import { useI18n } from "../i18n";

export default function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <label style={{ display:'flex', gap:6, alignItems:'center' }}>
      <span className="badge">{t("lang.label")}</span>
      <select
        value={lang}
        onChange={(e)=> setLang(e.target.value as any)}
        className="badge"
        aria-label={t("lang.label")}
      >
        <option value="fr">{t("lang.fr")}</option>
        <option value="en">{t("lang.en")}</option>
        <option value="ar">{t("lang.ar")}</option>
      </select>
    </label>
  );
}
