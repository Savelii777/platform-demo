"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, LogIn } from "lucide-react";
import { communityChat, type ChatMessage } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

const COMMUNITY_CHAT_ID = 0;

const roleLabelMap: Record<string, string> = {
  employer: "Работодатель",
  specialist: "Специалист",
  client: "Клиент",
  supplier: "Поставщик",
};

const roleBadgeColors: Record<string, string> = {
  employer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  specialist: "bg-green-500/20 text-green-400 border-green-500/30",
  client: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  supplier: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + " " + time;
}

export default function ChatsPage() {
  const { user, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  // Load messages on mount
  useEffect(() => {
    setMessages(communityChat.getMessages(COMMUNITY_CHAT_ID));
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    const newMsg = communityChat.sendMessage(
      COMMUNITY_CHAT_ID,
      user.id,
      user.name || user.companyName || "Аноним",
      user.role,
      trimmed
    );
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Сообщество
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-2 flex items-center gap-3">
            <MessageSquare className="text-primary" size={32} />
            Общий чат
          </h1>
          <p className="text-muted text-sm">
            Общее пространство для обсуждений — делитесь опытом, задавайте вопросы, общайтесь с
            участниками платформы.
          </p>
        </div>

        {/* Chat Feed */}
        <div
          ref={feedRef}
          className="flex-1 min-h-[400px] max-h-[60vh] overflow-y-auto rounded-2xl bg-card border border-border p-4 space-y-4 mb-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted py-20">
              <MessageSquare size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Пока нет сообщений</p>
              <p className="text-sm mt-1">Начните обсуждение первым!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = user?.id === msg.authorId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      isOwn
                        ? "bg-primary/15 border border-primary/20"
                        : "bg-surface border border-border"
                    }`}
                  >
                    {/* Author line */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{msg.authorName}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-medium border ${
                          roleBadgeColors[msg.authorRole] || "bg-muted/20 text-muted"
                        }`}
                      >
                        {roleLabelMap[msg.authorRole] || msg.authorRole}
                      </span>
                      <span className="text-[11px] text-muted ml-auto">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    {/* Text */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input or Login Prompt */}
        {isLoggedIn ? (
          <div className="flex gap-3 items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              rows={2}
              className="flex-1 resize-none bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-white"
            >
              <Send size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-5 rounded-2xl bg-surface border border-border text-muted">
            <LogIn size={18} />
            <span className="text-sm font-medium">Войдите чтобы писать в чат</span>
          </div>
        )}
      </div>
    </div>
  );
}
