"use client";

import { useGetCurrentUser } from "@/hooks/useGetCurrentUser";

export default function HoockProvider() {
  useGetCurrentUser();
  return null;
}