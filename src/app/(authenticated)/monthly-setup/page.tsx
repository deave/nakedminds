"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatMonthYear } from "@/lib/month";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MonthlySetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [oneThing, setOneThing] = useState("");
  const [keyActions, setKeyActions] = useState("");
  const [firstStep, setFirstStep] = useState("");
  const [timeBlockDay, setTimeBlockDay] = useState("");
  const [timeBlockTime, setTimeBlockTime] = useState("");
  const [definitionOfProgress, setDefinitionOfProgress] = useState("");
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
            setOneThing(existing.oneThing);
            setKeyActions(existing.keyActions);
            setFirstStep(existing.firstStep);
            setTimeBlockDay(existing.timeBlockDay);
            setTimeBlockTime(existing.timeBlockTime);
            setDefinitionOfProgress(existing.definitionOfProgress);
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
        body: JSON.stringify({ oneThing, keyActions, firstStep, timeBlockDay, timeBlockTime, definitionOfProgress }),
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
          Plan your month with focus and intention.
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((s) => (
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
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">1. ONE Thing</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                What is the ONE thing you want to move forward this month?
              </h2>
              <p className="text-sm text-stone-500 italic mb-4">
                (One short sentence.)
              </p>
              <textarea
                value={oneThing}
                onChange={(e) => setOneThing(e.target.value)}
                className="textarea h-20"
                placeholder="e.g., Launch the new product landing page"
                maxLength={200}
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!oneThing.trim()}
              className="btn-primary w-full"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">2. Key Actions</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                What 2–3 actions will move this forward?
              </h2>
              <textarea
                value={keyActions}
                onChange={(e) => setKeyActions(e.target.value)}
                className="textarea h-28"
                placeholder="e.g., 1. Write the copy&#10;2. Design the layout&#10;3. Set up analytics"
                maxLength={500}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!keyActions.trim()}
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
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">3. First Step</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                What is the first step you will take this week?
              </h2>
              <textarea
                value={firstStep}
                onChange={(e) => setFirstStep(e.target.value)}
                className="textarea h-20"
                placeholder="e.g., Draft the hero section copy by Wednesday"
                maxLength={200}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!firstStep.trim()}
                className="btn-primary flex-1"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">4. Time Block</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                When will you protect time to work on this?
              </h2>
              <div className="space-y-3 mt-4">
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1 block">Day</label>
                  <input
                    type="text"
                    value={timeBlockDay}
                    onChange={(e) => setTimeBlockDay(e.target.value)}
                    className="input"
                    placeholder="e.g., Monday, Every weekday morning"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 mb-1 block">Time</label>
                  <input
                    type="text"
                    value={timeBlockTime}
                    onChange={(e) => setTimeBlockTime(e.target.value)}
                    className="input"
                    placeholder="e.g., 9:00 AM, After lunch"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={!timeBlockDay.trim() || !timeBlockTime.trim()}
                className="btn-primary flex-1"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-3">5. Definition of Progress</div>
              <h2 className="text-lg font-semibold text-stone-800 mb-1">
                How will you know you made progress this month?
              </h2>
              <textarea
                value={definitionOfProgress}
                onChange={(e) => setDefinitionOfProgress(e.target.value)}
                className="textarea h-28"
                placeholder="e.g., The landing page is live and getting traffic"
                maxLength={500}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                disabled={!definitionOfProgress.trim()}
                className="btn-primary flex-1"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-800 mb-3">
              Review your {monthLabel} plan
            </h2>

            <div className="space-y-3">
              {[
                { label: "ONE Thing", value: oneThing },
                { label: "Key Actions", value: keyActions },
                { label: "First Step", value: firstStep },
                { label: "Time Block", value: `${timeBlockDay} — ${timeBlockTime}` },
                { label: "Definition of Progress", value: definitionOfProgress },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">{item.label}</div>
                  <p className="text-sm text-stone-800 whitespace-pre-line">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(5)} className="btn-secondary flex-1">
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
