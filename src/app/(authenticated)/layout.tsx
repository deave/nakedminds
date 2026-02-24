"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "@/components/layout/NavBar";
import MonthlySetupBanner from "@/components/ui/MonthlySetupBanner";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasMonthlyEntry, setHasMonthlyEntry] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && !(session.user as any).onboarded) {
      router.push("/onboarding");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const checkMonthly = async () => {
      try {
        const res = await fetch("/api/entries/me");
        if (res.ok) {
          const entries = await res.json();
          const now = new Date();
          const currentYear = now.getUTCFullYear();
          const currentMonth = now.getUTCMonth() + 1;
          const hasEntry = entries.some(
            (e: any) => e.year === currentYear && e.month === currentMonth
          );
          setHasMonthlyEntry(hasEntry);
        }
      } catch {
        setHasMonthlyEntry(null);
      }
    };

    checkMonthly();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {hasMonthlyEntry === false && <MonthlySetupBanner />}
        {children}
      </main>
    </div>
  );
}
