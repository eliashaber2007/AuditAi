import { Link } from "@tanstack/react-router";

type Variant = "light" | "dark";

export function SiteFooter({ variant = "light" }: { variant?: Variant }) {
  const isDark = variant === "dark";

  const wrapperCls = isDark
    ? "border-t border-white/5 px-6 py-10 text-neutral-400"
    : "border-t border-neutral-100 px-6 py-10 text-neutral-600";
  const brandCls = isDark
    ? "text-sm font-semibold text-white"
    : "text-sm font-semibold text-neutral-900";
  const accentCls = isDark ? "text-emerald-400" : "text-emerald-500";
  const linkCls = isDark
    ? "hover:text-white transition-colors"
    : "hover:text-neutral-900 transition-colors";
  const muteCls = isDark ? "text-xs text-neutral-600" : "text-xs text-neutral-500";

  return (
    <footer className={wrapperCls}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className={brandCls}>
          Audit<span className={accentCls}>.ai</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/pricing" className={linkCls}>Pricing</Link>
          <Link to="/faq" className={linkCls}>FAQ</Link>
          <Link to="/terms" className={linkCls}>Terms</Link>
          <Link to="/privacy" className={linkCls}>Privacy</Link>
          <Link to="/legal" className={linkCls}>Legal</Link>
        </nav>
        <div className={muteCls}>© {new Date().getFullYear()} Audit.ai</div>
      </div>
    </footer>
  );
}
