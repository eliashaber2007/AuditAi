import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";
import de from "./de.json";

export const SUPPORTED_LANGS = ["en", "fr", "es", "de"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = "auditai.lang";

function detectInitial(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch {}
  return "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
    },
    lng: detectInitial(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnObjects: true,
  });
}

export function setLanguage(lang: Lang) {
  i18n.changeLanguage(lang);
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  } catch {}
}

export default i18n;
