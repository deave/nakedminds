"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatMonthYear, isCurrentMonth } from "@/lib/month";
import Avatar from "@/components/ui/Avatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

interface User {
  id: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

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
  _count: { comments: number };
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; displayName: string; avatarUrl: string | null };
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, entriesRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/entries/user/${userId}`),
        ]);

        if (userRes.ok) setUser(await userRes.json());
        if (entriesRes.ok) {
          const data = await entriesRes.json();
          setEntries(data);
          if (data.length > 0) setSelectedEntry(data[0]);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!selectedEntry) return;
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `/api/entries/${selectedEntry.id}/comments`
        );
        if (res.ok) setComments(await res.json());
      } catch {}
    };
    fetchComments();
  }, [selectedEntry]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedEntry) return;

    setCommentLoading(true);
    try {
      const res = await fetch(
        `/api/entries/${selectedEntry.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: newComment }),
        }
      );

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      }
    } catch {}
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {}
  };

  const handleDM = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/messages/${data.id}`);
      }
    } catch {}
  };

  if (loading) return <LoadingSpinner />;
  if (!user)
    return (
      <EmptyState
        title="Member not found"
        description="This person doesn't seem to be in the Circle."
      />
    );

  return (
    <div>
      {/* Profile Header */}
      <div className="card p-6 mb-4">
        <div className="flex items-start gap-4">
          <Avatar name={user.displayName} url={user.avatarUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-stone-800">
              {user.displayName}
            </h1>
            {user.bio && (
              <p className="text-sm text-stone-500 mt-1">{user.bio}</p>
            )}
          </div>
          {!isOwnProfile && (
            <button onClick={handleDM} className="btn-secondary text-xs">
              Message
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => router.push("/monthly-setup")}
              className="btn-secondary text-xs"
            >
              Edit focus
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No monthly focus yet"
          description={
            isOwnProfile
              ? "You haven't set your monthly focus yet."
              : `${user.displayName} hasn't set their monthly focus yet.`
          }
          action={
            isOwnProfile
              ? {
                  label: "Set my focus",
                  onClick: () => router.push("/monthly-setup"),
                }
              : undefined
          }
        />
      ) : (
        <>
          {/* Month Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {entries.map((entry) => {
              const isCurrent = isCurrentMonth(entry.year, entry.month);
              const isSelected = selectedEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-brand-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {formatMonthYear(entry.year, entry.month)}
                  {isCurrent && " (current)"}
                </button>
              );
            })}
          </div>

          {/* Selected Entry */}
          {selectedEntry && (
            <div className="space-y-4">
              <div className="card p-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">ONE Thing</span>
                    <p className="text-sm font-medium text-stone-800 mt-0.5">{selectedEntry.oneThing}</p>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-3 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-stone-500">Key Actions</span>
                      <p className="text-sm text-stone-700 whitespace-pre-line">{selectedEntry.keyActions}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-stone-500">First Step</span>
                      <p className="text-sm text-stone-700">{selectedEntry.firstStep}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-stone-500">Time Block</span>
                      <p className="text-sm text-stone-700">{selectedEntry.timeBlockDay} — {selectedEntry.timeBlockTime}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-stone-500">Definition of Progress</span>
                      <p className="text-sm text-stone-700">{selectedEntry.definitionOfProgress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-stone-800 mb-3">
                  Support & encouragement
                </h3>

                {comments.length === 0 ? (
                  <p className="text-sm text-stone-400 mb-3">
                    No comments yet. Be the first to show support.
                  </p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar
                          name={comment.author.displayName}
                          url={comment.author.avatarUrl}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-stone-800">
                              {comment.author.displayName}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {comment.author.id === session?.user?.id && (
                              <button
                                onClick={() =>
                                  handleDeleteComment(comment.id)
                                }
                                className="text-[10px] text-red-400 hover:text-red-600"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-stone-600">
                            {comment.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input flex-1"
                    placeholder="Write something supportive..."
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || commentLoading}
                    className="btn-primary px-3"
                  >
                    {commentLoading ? "..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
