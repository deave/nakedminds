"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Validate invitation code first
      const codeRes = await fetch("/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: invitationCode }),
      });

      const codeData = await codeRes.json();

      if (!codeRes.ok || !codeData.valid) {
        setError(codeData.error || "Invalid invitation code");
        setLoading(false);
        return;
      }

      // Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: email.split("@")[0],
          invitationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">
            Naked Minds
          </h1>
          <p className="text-stone-500 text-sm">
            Sign in to join the Circle
          </p>
        </div>

        <div className="card p-6">
          {/* Tabs */}
          <div className="flex border-b border-stone-200 mb-6">
            <Link
              href="/"
              className="flex-1 text-center pb-3 text-sm font-medium text-stone-400 hover:text-stone-600"
            >
              Log In
            </Link>
            <div className="flex-1 text-center pb-3 text-sm font-medium text-stone-800 border-b-2 border-stone-800">
              Sign Up
            </div>
          </div>

          <h2 className="text-lg font-semibold text-stone-800 mb-1">
            Create an account
          </h2>
          <p className="text-stone-500 text-sm mb-4">
            You need an invitation code to sign up.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Invitation Code
              </label>
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="input"
                placeholder="Enter your invitation code"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Confirm your password"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
