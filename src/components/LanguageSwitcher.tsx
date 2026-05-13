import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage, SUPPORTED_LANGS, type Lang } from "@/i18n";

const META: Record<Lang, { flag: string; code: string; name: string }> = {
  en: { flag: "🇬🇧", code: "EN", name: "English" },
  fr: { flag: "🇫🇷", code: "FR", name: "Français" },
  es: { flag: "🇪🇸", code: "ES", name: "Español" },
  de: { flag: "🇩🇪", code: "DE", name: "Deutsch" },
};

type Variant = "light" | "dark";

export function LanguageSwitcher({ variant = "light" }: { variant?: Variant }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = (SUPPORTED_LANGS as readonly string[]).includes(i18n.language)
    ? (i18n.language as Lang)
    : "en";
  const cur = META[current];

  const isDark = variant === "dark";
  const btnCls = isDark
    ? "inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-100 hover:bg-white/10"
    : "inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50";
  const menuCls = isDark
    ? "absolute right-0 z-50 mt-2 w-40 rounded-md border border-white/10 bg-neutral-900 py-1 shadow-xl text-neutral-100"
    : "absolute right-0 z-50 mt-2 w-40 rounded-md border border-neutral-200 bg-white py-1 shadow-lg text-neutral-900";
  const itemCls = (active: boolean) =>
    `flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
      isDark ? "hover:bg-white/5" : "hover:bg-neutral-50"
    } ${active ? "font-semibold" : ""}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={btnCls}
        aria-label={t("language.label")}
      >
        <span aria-hidden>{cur.flag}</span>
        <span className="tabular-nums">{cur.code}</span>
      </button>
      {open && (
        <div className={menuCls} role="listbox">
          {SUPPORTED_LANGS.map((l) => {
            const m = META[l];
            return (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLanguage(l);
                  setOpen(false);
                }}
                className={itemCls(l === current)}
                role="option"
                aria-selected={l === current}
              >
                <span aria-hidden>{m.flag}</span>
                <span>{m.name}</span>
                <span className="ml-auto text-xs text-neutral-400">{m.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
