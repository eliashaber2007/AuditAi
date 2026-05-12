import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";

type Variant = "light" | "dark";

export function UserMenu({ variant = "light" }: { variant?: Variant }) {
  const { user, loading } = useAuth();
  const { credits } = useCredits();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) return null;

  if (!user) {
    const loginCls =
      variant === "dark"
        ? "rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-100 hover:bg-white/10"
        : "rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50";
    return (
      <Link to="/auth" className={loginCls}>
        Log in
      </Link>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send reset email");
    }
    setOpen(false);
  };

  const initial = user.email?.[0]?.toUpperCase() ?? "?";

  const isDark = variant === "dark";
  const avatarCls = isDark
    ? "flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-semibold text-neutral-900 ring-1 ring-white/20 hover:ring-white/40 transition"
    : "flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-base font-semibold text-white hover:bg-neutral-800 transition";

  const menuCls = isDark
    ? "absolute right-0 z-50 mt-2 w-64 rounded-md border border-white/10 bg-neutral-900 py-1 shadow-xl text-neutral-100"
    : "absolute right-0 z-50 mt-2 w-64 rounded-md border border-neutral-200 bg-white py-1 shadow-lg text-neutral-900";

  const headerSubCls = isDark ? "text-xs text-neutral-400" : "text-xs text-neutral-500";
  const headerEmailCls = isDark
    ? "truncate text-sm font-medium text-white"
    : "truncate text-sm font-medium text-neutral-900";
  const dividerCls = isDark ? "border-t border-white/10 my-1" : "border-t border-neutral-100 my-1";
  const itemCls = isDark
    ? "block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
    : "block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50";
  const creditsCls = isDark
    ? "flex items-center justify-between px-3 py-2 text-sm text-neutral-200"
    : "flex items-center justify-between px-3 py-2 text-sm text-neutral-700";
  const creditsValueCls = isDark
    ? "font-semibold text-emerald-400 tabular-nums"
    : "font-semibold text-neutral-900 tabular-nums";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={avatarCls}
        aria-label="User menu"
      >
        {initial}
      </button>
      {open && (
        <div className={menuCls}>
          <div className="px-3 py-2">
            <div className={headerSubCls}>Signed in as</div>
            <div className={headerEmailCls}>{user.email}</div>
          </div>
          <div className={dividerCls} />
          <div className={creditsCls}>
            <span>Credits</span>
            <span className={creditsValueCls}>{credits ?? "—"}</span>
          </div>
          <div className={dividerCls} />
          <button onClick={handleChangePassword} className={itemCls}>
            Change password
          </button>
          <button onClick={handleLogout} className={itemCls}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
