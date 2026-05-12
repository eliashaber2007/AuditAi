import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function UserMenu() {
  const { user, loading } = useAuth();
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
    return (
      <Link
        to="/auth"
        className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
      >
        Log in
      </Link>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const initial = user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white"
        aria-label="User menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="border-b border-neutral-100 px-3 py-2 text-xs text-neutral-500">
            Signed in as
            <div className="truncate text-sm font-medium text-neutral-900">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
