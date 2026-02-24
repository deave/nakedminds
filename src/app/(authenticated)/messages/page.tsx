"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Conversation {
  id: string;
  otherUser: { id: string; displayName: string; avatarUrl: string | null } | null;
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          setConversations(await res.json());
        }
      } catch {}
      setLoading(false);
    };
    fetchConversations();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-xl font-bold text-stone-800 mb-4">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Start a conversation by visiting a member's profile and tapping 'Message'."
        />
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => {
            if (!conv.otherUser) return null;
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <div className="relative">
                  <Avatar
                    name={conv.otherUser.displayName}
                    url={conv.otherUser.avatarUrl}
                  />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 rounded-full bg-brand-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <p
                      className={`text-sm truncate ${
                        conv.unreadCount > 0
                          ? "font-semibold text-stone-800"
                          : "font-medium text-stone-700"
                      }`}
                    >
                      {conv.otherUser.displayName}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p
                      className={`text-xs truncate ${
                        conv.unreadCount > 0
                          ? "text-stone-600"
                          : "text-stone-400"
                      }`}
                    >
                      {conv.lastMessage.body}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
