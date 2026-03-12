"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMonthYear } from "@/lib/month";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Entry {
  id: string;
  year: number;
  month: number;
  oneThing: string;
  keyActions: string;
  firstStep: string;
  timeBlockDay: string;
  timeBlockTime: string;
  definitionOfProgress: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
  comments: Array<{
    id: string;
    body: string;
    author: { id: string; displayName: string; avatarUrl: string | null };
  }>;
  _count: { comments: number };
}

export default function FeedPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch("/api/entries/current");
        if (res.ok) {
          setEntries(await res.json());
        }
      } catch {}
      setLoading(false);
    };
    fetchEntries();
  }, []);

  if (loading) return <LoadingSpinner />;

  const now = new Date();
  const monthLabel = formatMonthYear(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        title="The Circle is quiet"
        description="No one has set their monthly focus yet. Be the first to share what you're working on."
        action={{ label: "Set my focus", onClick: () => (window.location.href = "/monthly-setup") }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-800">Circle Feed</h1>
        <p className="text-sm text-stone-500">{monthLabel}</p>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/members/${entry.user.id}`}
            className="card p-4 block hover:border-brand-300 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                name={entry.user.displayName}
                url={entry.user.avatarUrl}
              />
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  {entry.user.displayName}
                </p>
              </div>
            </div>

            {/* ONE Thing */}
            <div className="mb-3">
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">ONE Thing</span>
              <p className="text-sm font-medium text-stone-800 mt-0.5">{entry.oneThing}</p>
            </div>

            {/* Details */}
            <div className="bg-surface-50 rounded-lg p-3 mb-3 space-y-2">
              <div>
                <span className="text-xs font-medium text-stone-500">Key Actions</span>
                <p className="text-sm text-stone-700 whitespace-pre-line">{entry.keyActions}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-stone-500">First Step</span>
                <p className="text-sm text-stone-700">{entry.firstStep}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-stone-500">Time Block</span>
                <p className="text-sm text-stone-700">{entry.timeBlockDay} — {entry.timeBlockTime}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-stone-500">Definition of Progress</span>
                <p className="text-sm text-stone-700 line-clamp-2">{entry.definitionOfProgress}</p>
              </div>
            </div>

            {/* Comments preview */}
            {entry._count.comments > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                <span>
                  {entry._count.comments}{" "}
                  {entry._count.comments === 1 ? "comment" : "comments"}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
