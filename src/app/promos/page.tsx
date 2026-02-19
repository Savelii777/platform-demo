"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Search,
  Plus,
  X,
  Eye,
  EyeOff,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Percent,
  Sparkles,
  Filter,
} from "lucide-react";
import { promos as promoService, type Promo } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

interface Toast {
  message: string;
  type: "success" | "error";
}

interface CreateForm {
  title: string;
  description: string;
  discount: string;
  code: string;
  validUntil: string;
  maxUses: string;
}

const emptyForm: CreateForm = {
  title: "",
  description: "",
  discount: "",
  code: "",
  validUntil: "",
  maxUses: "",
};

export default function PromosPage() {
  const { user, isLoggedIn, isRole } = useAuth();
  const [promosList, setPromosList] = useState<Promo[]>([]);
  const [search, setSearch] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyForm);

  useEffect(() => {
    setPromosList(promoService.getAll());
  }, []);

  /* ── helpers ── */

  const isPromoActive = (p: Promo) =>
    p.isActive !== false && new Date(p.validUntil) > new Date();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── filter & search ── */

  const filtered = promosList.filter((p) => {
    if (showActiveOnly && !isPromoActive(p)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCompany = (p.companyName ?? p.partner ?? "")
        .toLowerCase()
        .includes(q);
      if (!matchTitle && !matchCompany) return false;
    }
    return true;
  });

  /* ── use promo (client) ── */

  const handleUsePromo = (promo: Promo) => {
    if (!user) return;
    if (promo.usedBy.includes(user.id)) {
      showToast("Вы уже использовали этот промокод", "error");
      return;
    }
    if (promo.maxUses && promo.usedBy.length >= promo.maxUses) {
      showToast("Лимит использований исчерпан", "error");
      return;
    }
    promoService.usePromo(promo.id, user.id);
    setRevealedCodes((prev) => new Set(prev).add(promo.id));
    setPromosList(promoService.getAll());
    showToast("Промокод получен!", "success");
  };

  /* ── create promo (employer) ── */

  const handleCreate = () => {
    if (!user) return;
    if (!form.title || !form.code || !form.validUntil) {
      showToast("Заполните обязательные поля", "error");
      return;
    }
    promoService.create({
      creatorId: user.id,
      companyName: user.companyName ?? user.name,
      partner: user.companyName ?? user.name,
      category: "",
      title: form.title,
      description: form.description,
      discount: form.discount ? `${form.discount}%` : "",
      code: form.code.toUpperCase(),
      validUntil: form.validUntil,
      maxUses: Number(form.maxUses) || 0,
      isActive: true,
      isExclusive: false,
    });
    setPromosList(promoService.getAll());
    setShowCreateModal(false);
    setForm(emptyForm);
    showToast("Акция создана!", "success");
  };

  /* ── format date ── */

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Toast ── */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
              toast.type === "success"
                ? "bg-success text-white"
                : "bg-danger text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {toast.message}
          </div>
        )}

        {/* ── Header ── */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Бонусы участникам
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-2">
              Промокоды и акции
            </h1>
            <p className="text-muted max-w-2xl text-sm">
              Эксклюзивные скидки от партнёров платформы. Получите промокод — он
              будет доступен только вам.
            </p>
          </div>

          {isLoggedIn && isRole("employer") && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
            >
              <Plus size={18} />
              Создать акцию
            </button>
          )}
        </div>

        {/* ── Search & Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Поиск по названию или компании…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted"
            />
          </div>
          <button
            onClick={() => setShowActiveOnly((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              showActiveOnly
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-card border-border text-muted hover:border-border-light"
            }`}
          >
            <Filter size={14} />
            {showActiveOnly ? "Только активные" : "Все акции"}
          </button>
        </div>

        {/* ── Info banner ── */}
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 mb-8 flex items-start gap-4">
          <Sparkles size={20} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Как это работает</h3>
            <p className="text-sm text-muted">
              Нажмите «Получить промокод», чтобы раскрыть код. Каждый промокод
              можно использовать один раз. Следите за лимитом использований!
            </p>
          </div>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Gift size={48} className="mx-auto text-muted mb-4 opacity-40" />
            <p className="text-muted">Акции не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((promo) => {
              const active = isPromoActive(promo);
              const alreadyUsed =
                user != null && promo.usedBy.includes(user.id);
              const limitReached =
                promo.maxUses > 0 && promo.usedBy.length >= promo.maxUses;
              const codeRevealed = revealedCodes.has(promo.id) || alreadyUsed;

              return (
                <div
                  key={promo.id}
                  className={`group relative flex flex-col p-6 rounded-2xl bg-card border transition-all duration-300 overflow-hidden ${
                    active
                      ? "border-border hover:border-primary/30 card-glow card-glow-hover"
                      : "border-border/50 opacity-60"
                  }`}
                >
                  {/* Active / Inactive badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        active
                          ? "bg-success/15 text-success"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {active ? "Активна" : "Неактивна"}
                    </span>
                  </div>

                  {/* Icon + Company */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Gift size={22} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted truncate">
                        {promo.companyName || promo.partner}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-1 leading-tight">
                    {promo.title}
                  </h3>

                  {/* Discount */}
                  {promo.discount && (
                    <span className="inline-flex items-center gap-1 text-primary font-bold text-sm mb-2">
                      <Percent size={14} />
                      {promo.discount}
                    </span>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                    {promo.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      до {fmtDate(promo.validUntil)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {promo.usedBy.length}
                      {promo.maxUses > 0 ? ` / ${promo.maxUses}` : ""}
                    </span>
                  </div>

                  {/* Code + action */}
                  <div className="mt-auto">
                    {/* Code display */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg font-mono text-sm text-center tracking-widest select-all">
                        {codeRevealed ? promo.code : "••••••"}
                      </div>
                      {codeRevealed && (
                        <button
                          onClick={() =>
                            setRevealedCodes((prev) => {
                              const next = new Set(prev);
                              next.delete(promo.id);
                              return next;
                            })
                          }
                          className="p-2.5 bg-surface border border-border rounded-lg text-muted hover:text-foreground transition-colors"
                          title="Скрыть"
                        >
                          <EyeOff size={16} />
                        </button>
                      )}
                      {!codeRevealed && alreadyUsed && (
                        <button
                          onClick={() =>
                            setRevealedCodes((prev) =>
                              new Set(prev).add(promo.id)
                            )
                          }
                          className="p-2.5 bg-surface border border-border rounded-lg text-muted hover:text-foreground transition-colors"
                          title="Показать"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>

                    {/* Action button (clients) */}
                    {isLoggedIn && !isRole("employer") && (
                      <>
                        {alreadyUsed ? (
                          <span className="block text-center text-xs text-success font-medium">
                            ✓ Промокод получен
                          </span>
                        ) : (
                          <button
                            disabled={!active || limitReached}
                            onClick={() => handleUsePromo(promo)}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-hover"
                          >
                            {limitReached
                              ? "Лимит исчерпан"
                              : "Получить промокод"}
                          </button>
                        )}
                      </>
                    )}

                    {!isLoggedIn && (
                      <p className="text-xs text-muted text-center">
                        Войдите, чтобы получить промокод
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Partner CTA ── */}
        <div className="mt-16 p-8 rounded-2xl bg-card border border-border text-center">
          <h3 className="text-lg font-semibold mb-2">
            Хотите стать партнёром?
          </h3>
          <p className="text-sm text-muted mb-4">
            Разместите вашу акцию на платформе и получите доступ к тысячам
            клиентов
          </p>
          <button className="px-6 py-3 border border-primary text-primary rounded-xl font-medium hover:bg-primary/10 transition-colors text-sm">
            Предложить партнёрство
          </button>
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />

          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Создать акцию</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors text-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Название <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Скидка 20% на полировку"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Описание
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Подробности акции…"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted resize-none"
                />
              </div>

              {/* Discount & Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Скидка (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.discount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discount: e.target.value }))
                    }
                    placeholder="15"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Промокод <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="DETAIL20"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted font-mono"
                  />
                </div>
              </div>

              {/* Valid until & Max uses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Действует до <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validUntil: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Макс. использований
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxUses: e.target.value }))
                    }
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-surface transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
