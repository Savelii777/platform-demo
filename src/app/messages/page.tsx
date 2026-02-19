"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { messaging as messagingService, auth as authService, type Conversation, type Message } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="pt-24 pb-16 min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted">Загрузка...</div></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedTo = useRef(false);

  // Build user name map from all roles
  useEffect(() => {
    if (!user) return;
    const map: Record<string, string> = {};
    const roles = ["employer", "specialist", "client", "supplier"] as const;
    for (const role of roles) {
      const users = authService.getUsersByRole(role);
      for (const u of users) {
        map[u.id] = u.companyName || u.name;
      }
    }
    setNameMap(map);
  }, [user]);

  // Load conversations
  const loadConversations = useCallback(() => {
    if (!user) return;
    const convs = messagingService.getConversations(user.id);
    convs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    setConversations(convs);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle ?to= parameter
  useEffect(() => {
    if (!user || initializedTo.current) return;
    const toUserId = searchParams.get("to");
    if (!toUserId || toUserId === user.id) return;
    initializedTo.current = true;
    const targetUser = authService.getUser(toUserId);
    if (!targetUser) return;
    const conv = messagingService.getOrCreateConversation(user, targetUser);
    loadConversations();
    setSelectedConvId(conv.id);
  }, [user, searchParams, loadConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConvId || !user) return;
    const msgs = messagingService.getMessages(selectedConvId);
    setMessages(msgs);
    messagingService.markRead(selectedConvId, user.id);
    loadConversations();
  }, [selectedConvId, user, loadConversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherName = (conv: Conversation) => {
    if (!user) return "";
    const idx = conv.participantIds.indexOf(user.id);
    const otherId = conv.participantIds[idx === 0 ? 1 : 0];
    return nameMap[otherId] || conv.participantNames[idx === 0 ? 1 : 0] || "Пользователь";
  };

  const getOtherId = (conv: Conversation) => {
    if (!user) return "";
    const idx = conv.participantIds.indexOf(user.id);
    return conv.participantIds[idx === 0 ? 1 : 0];
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = () => {
    if (!messageText.trim() || !selectedConvId || !user) return;
    const otherId = getOtherId(conversations.find(c => c.id === selectedConvId)!);
    messagingService.sendMessage(selectedConvId, user.id, user.companyName || user.name, otherId, messageText.trim());
    setMessageText("");
    // Reload
    setMessages(messagingService.getMessages(selectedConvId));
    loadConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-muted mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">Войдите для доступа к сообщениям</h2>
          <p className="text-sm text-muted mb-4">Для обмена сообщениями необходима авторизация</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors"
          >
            Войти
          </Link>
        </div>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId) ?? null;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Коммуникации</span>
          <h1 className="text-2xl font-bold mt-1">Сообщения</h1>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-2xl border border-border overflow-hidden"
          style={{ minHeight: "600px" }}
        >
          {/* Sidebar: conversation list */}
          <div className={`border-r border-border bg-card ${selectedConvId !== null ? "hidden lg:block" : ""}`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-muted">Диалоги</h2>
            </div>

            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">Нет диалогов</div>
            ) : (
              <div className="divide-y divide-border overflow-y-auto" style={{ maxHeight: "540px" }}>
                {conversations.map((conv) => {
                  const unread = conv.unreadCount[user.id] || 0;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full p-4 text-left hover:bg-surface transition-colors flex items-start gap-3 ${
                        selectedConvId === conv.id ? "bg-surface" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {getOtherName(conv).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium truncate">{getOtherName(conv)}</span>
                          <span className="text-[10px] text-muted shrink-0 ml-2">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted truncate">
                          {conv.lastMessage || "Нет сообщений"}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className="lg:col-span-2 flex flex-col bg-background">
            {selectedConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border bg-card flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="lg:hidden text-muted hover:text-foreground"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {getOtherName(selectedConv).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{getOtherName(selectedConv)}</h3>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 space-y-3 overflow-y-auto" style={{ maxHeight: "460px" }}>
                  {messages.length === 0 && (
                    <div className="text-center text-xs text-muted py-8">
                      Начните разговор — напишите первое сообщение
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            isOwn
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-card border border-border text-foreground rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                          <span
                            className={`text-[10px] mt-1 block ${
                              isOwn ? "text-white/70" : "text-muted"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Написать сообщение..."
                      rows={1}
                      className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageText.trim()}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto text-muted mb-4 opacity-30" />
                  <h3 className="font-semibold mb-2 text-muted">Выберите диалог</h3>
                  <p className="text-sm text-muted max-w-xs">
                    Здесь отображаются ваши личные сообщения с работодателями, клиентами и поставщиками
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-surface border border-border">
          <p className="text-xs text-muted text-center">
            Все сообщения фиксируются платформой. Обмен контактами напрямую — на ваш страх и риск.
            Для жалоб используйте кнопку «Пожаловаться» в меню диалога.
          </p>
        </div>
      </div>
    </div>
  );
}
