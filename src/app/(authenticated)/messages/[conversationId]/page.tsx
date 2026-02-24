"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; displayName: string; avatarUrl: string | null };
}

interface OtherUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const conversationId = params.conversationId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesRes, convsRes] = await Promise.all([
          fetch(`/api/conversations/${conversationId}/messages`),
          fetch("/api/conversations"),
        ]);

        if (messagesRes.ok) {
          setMessages(await messagesRes.json());
        }

        if (convsRes.ok) {
          const convs = await convsRes.json();
          const conv = convs.find((c: any) => c.id === conversationId);
          if (conv?.otherUser) setOtherUser(conv.otherUser);
        }

        // Mark as read
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: "PATCH",
        });
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          await fetch(`/api/conversations/${conversationId}/read`, {
            method: "PATCH",
          });
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: newMessage }),
        }
      );

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch {}
    setSending(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-stone-200 mb-3">
        <button
          onClick={() => router.push("/messages")}
          className="btn-ghost p-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {otherUser && (
          <div className="flex items-center gap-2">
            <Avatar
              name={otherUser.displayName}
              url={otherUser.avatarUrl}
              size="sm"
            />
            <span className="text-sm font-semibold text-stone-800">
              {otherUser.displayName}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-stone-400 py-8">
            Start the conversation. Say something kind.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                    isMe
                      ? "bg-brand-600 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  <p className="text-sm">{msg.body}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-brand-200" : "text-stone-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 pt-3 border-t border-stone-200"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input flex-1"
          placeholder="Type a message..."
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="btn-primary px-4"
        >
          Send
        </button>
      </form>
    </div>
  );
}
