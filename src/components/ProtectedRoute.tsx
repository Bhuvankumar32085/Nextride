"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { loggedUser, loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loading && !loggedUser) {
      router.replace("/login");
    }
  }, [loading, loggedUser, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!loggedUser) {
    return null;
  }

  return <>{children}</>;
}
