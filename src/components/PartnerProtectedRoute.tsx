"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";

export default function PartnerProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { loggedUser, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loading) {
      if (!loggedUser) {
        router.replace("/login");
        return;
      }

      const isOnboardingRoute = pathname.startsWith("/partner/onboarding");

      if (loggedUser.role !== "partner" && !isOnboardingRoute) {
        router.replace("/");
      }
    }
  }, [loading, loggedUser, pathname, router]);

  if (loading) return null;

  if (!loggedUser) return null;

  const isOnboardingRoute = pathname.startsWith("/partner/onboarding");

  if (loggedUser.role !== "partner" && !isOnboardingRoute) {
    return null;
  }

  return <>{children}</>;
}
