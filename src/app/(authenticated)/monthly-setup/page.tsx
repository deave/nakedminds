"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatMonthYear } from "@/lib/month";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MonthlySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [habitAdopt, setHabitAdopt] = useState("");
  const [habitRemove, setHabitRemove] = useState("");
  const [focusChallenge, setFocusChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingEntry, setExistingEntry] = useState<any>(null);

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  const monthLabel = formatMonthYear(currentYear, currentMonth);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/entries/me");
        if (res.ok) {
          const entries = await res.json();
          const existing = entries.find(
            (e: any) => e.year === currentYear && e.month === currentMonth
          );
          if (existing) {
            setExistingEntry(existing);
            setHabitAdopt(existing.habitAdopt);
            setHabitRemove(existing.habitRemove);
            setFocusChallenge(existing.focusChallenge);
          }
        }
      } catch {}
      setChecking(false);
    };
    check();
  }, [currentYear, currentMonth]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = existingEntry
        ? `/api/entries/${existingEntry.id}`
        : "/api/entries";
      const method = existingEntry ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitAdopt, habitRemove, focusChallenge }),
      });

      if (res.ok) {
        router.push("/feed");
      }
    } catch {}
    setLoading(false);
  };

  if (checking) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-stone-800 mb-1">
          {existingEntry ? "Edit" : "Set"} your {monthLabel} focus
        </h1>
        <p className="text-sm text-stone-500">
          Choose one habit to build, one to let go, and one challenge to face.
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-brand-500" : "bg-stone-200"
            }`}
          />
        ))}
      </div>

      <div className="card p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="badge-adopt mb-3">Adopt</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                What habit do you want to build?
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                Pick one habit you&apos;d like to make part of your life this
                month. Keep it specific and achievable.
              </p>
              <textarea
                value={habitAdopt}
                onChange={(e) => setHabitAdopt(e.target.value)}
                className="textarea h-20"
                placeholder="e.g., Meditate for 10 minutes every morning"
                maxLength={200}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!habitAdopt.trim()}
              className="btn-primary w-full"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="badge-remove mb-3">Remove</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                What habit do you want to let go?
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                Pick one habit that&apos;s holding you back. Be honest with
                yourself.
              </p>
              <textarea
                value={habitRemove}
                onChange={(e) => setHabitRemove(e.target.value)}
                className="textarea h-20"
                placeholder="e.g., Scrolling social media before bed"
                maxLength={200}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!habitRemove.trim()}
                className="btn-primary flex-1"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="badge-focus mb-3">Focus challenge</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                What are you working through?
              </h2>
              <p className="text-sm text-stone-500 mb-4">
                Describe the one thing you&apos;re focused on this month that
                feels difficult or important. Your Circle will see this and can
                offer support.
              </p>
              <textarea
                value={focusChallenge}
                onChange={(e) => setFocusChallenge(e.target.value)}
                className="textarea h-28"
                placeholder="e.g., I'm working on having difficult conversations instead of avoiding them. I tend to shut down when things get uncomfortable..."
                maxLength={1000}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!focusChallenge.trim()}
                className="btn-primary flex-1"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">
              Review your {monthLabel} focus
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
                <div className="badge-adopt mb-1">Adopt</div>
                <p className="text-sm text-stone-800">{habitAdopt}</p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="badge-remove mb-1">Remove</div>
                <p className="text-sm text-stone-800">{habitRemove}</p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="badge-focus mb-1">Focus challenge</div>
                <p className="text-sm text-stone-800">{focusChallenge}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary flex-1">
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading
                  ? "Saving..."
                  : existingEntry
                    ? "Update"
                    : "Confirm & share"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
