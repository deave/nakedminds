"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, onboarded: true }),
      });
      await update();
      router.push("/monthly-setup");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Welcome to the Circle
          </h1>
          <p className="text-stone-500 text-sm">
            Let&apos;s get you set up. This will only take a moment.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
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
                <h2 className="text-lg font-semibold text-stone-800 mb-1">
                  What should we call you?
                </h2>
                <p className="text-sm text-stone-500 mb-4">
                  This is how others in the Circle will see you.
                </p>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input"
                  placeholder="Your name"
                  maxLength={50}
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!displayName.trim()}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-800 mb-1">
                  Tell us a bit about yourself
                </h2>
                <p className="text-sm text-stone-500 mb-4">
                  Optional, but it helps others connect with you.
                </p>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="textarea h-24"
                  placeholder="A few words about you, what you're working on, or what matters to you..."
                  maxLength={500}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-stone-800">
                You&apos;re all set!
              </h2>
              <p className="text-sm text-stone-500">
                Next, let&apos;s set your monthly focus. Each month, you&apos;ll
                choose one habit to adopt, one to remove, and one challenge to
                work on.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? "Saving..." : "Set my monthly focus"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
