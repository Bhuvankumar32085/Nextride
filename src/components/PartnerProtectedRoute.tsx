"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";

export default function PartnerProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { loggedUser, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loading) {
      if (!loggedUser) {
        router.replace("/login");
      } else if (loggedUser.role !== "partner") {
        router.replace("/");
      }
    }
  }, [loading, loggedUser, router]);

  if (loading) return null;

  if (!loggedUser) return null;

  if (loggedUser.role !== "partner") return null;

  return <>{children}</>;
}
