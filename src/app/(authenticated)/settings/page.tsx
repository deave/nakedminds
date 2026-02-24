"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Admin invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteResult, setInviteResult] = useState<{
    message: string;
    inviteLink?: string;
  } | null>(null);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "");
    }
    // Fetch full profile for bio
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${session?.user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setBio(data.bio || "");
        }
      } catch {}
    };
    if (session?.user?.id) fetchProfile();
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });

      if (res.ok) {
        await update();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteResult({
          message: "Invite created!",
          inviteLink: data.inviteLink,
        });
        setInviteEmail("");
      } else {
        setInviteResult({ message: data.error });
      }
    } catch {
      setInviteResult({ message: "Something went wrong" });
    }
    setInviting(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-800">Settings</h1>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-stone-800 mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              maxLength={50}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea h-20"
              placeholder="A bit about yourself..."
              maxLength={500}
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && (
              <span className="text-sm text-brand-600">Changes saved</span>
            )}
          </div>
        </form>
      </div>

      {/* Admin: Invite */}
      {session?.user?.role === "ADMIN" && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-stone-800 mb-1">
            Invite a member
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Send an invite link to someone you&apos;d like in the Circle.
          </p>
          <form onSubmit={handleInvite} className="space-y-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input"
              placeholder="their@email.com"
              required
            />
            <button type="submit" disabled={inviting} className="btn-primary">
              {inviting ? "Creating invite..." : "Create invite link"}
            </button>
          </form>

          {inviteResult && (
            <div className="mt-3 p-3 rounded-lg bg-surface-50 border border-stone-200">
              <p className="text-sm text-stone-700 mb-1">
                {inviteResult.message}
              </p>
              {inviteResult.inviteLink && (
                <div className="mt-2">
                  <p className="text-xs text-stone-500 mb-1">
                    Share this link with them:
                  </p>
                  <code className="text-xs bg-stone-100 px-2 py-1 rounded block break-all">
                    {inviteResult.inviteLink}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <div className="card p-6">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
