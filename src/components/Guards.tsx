"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui/Spinner";

// Requires a logged-in user; redirects to /login with a return path.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) return <PageLoader />;
  return <>{children}</>;
}

// Requires an admin user.
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login?next=/admin");
      else if (!isAdmin) router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) return <PageLoader />;
  return <>{children}</>;
}
