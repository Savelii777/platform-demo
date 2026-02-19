"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Building2, User, ArrowRight, X, Plus, MessageSquare } from "lucide-react";
import { gigs as gigService, type Gig } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

export default function GigsPage() {
  const { user, isLoggedIn } = useAuth();
  const [gigsList, setGigsList] = useState<Gig[]>([]);
  const [activeTab, setActiveTab] = useState<"employer" | "specialist">("employer");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState<string | null>(null);
  const [respondMessage, setRespondMessage] = useState("");

  // Create form state
  const [formTitle, setFormTitle] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formPay, setFormPay] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formUrgent, setFormUrgent] = useState(false);

  useEffect(() => {
    setGigsList(gigService.getAll());
  }, []);

  const reload = () => setGigsList(gigService.getAll());

  const filtered = gigsList.filter((g) => g.type === activeTab);

  const resetForm = () => {
    setFormTitle("");
    setFormCity("");
    setFormDistrict("");
    setFormDate("");
    setFormPay("");
    setFormDescription("");
    setFormUrgent(false);
  };

  const handleCreate = () => {
    if (!user || !formTitle.trim()) return;
    gigService.create({
      authorId: user.id,
      authorName: user.name,
      type: user.role === "employer" ? "employer" : "specialist",
      title: formTitle,
      city: formCity,
      district: formDistrict,
      date: formDate,
      pay: formPay,
      description: formDescription,
      urgent: formUrgent,
    });
    reload();
    resetForm();
    setShowCreateModal(false);
  };

  const handleRespond = () => {
    if (!user || !showRespondModal) return;
    gigService.respond(showRespondModal, user.id, user.name, respondMessage);
    reload();
    setRespondMessage("");
    setShowRespondModal(null);
  };

  const canCreate = isLoggedIn && (user?.role === "employer" || user?.role === "specialist");
  const createLabel = user?.role === "employer" ? "Создать подработку" : "Разместить предложение";

  // Opposite role can respond
  const canRespond = (gig: Gig) => {
    if (!isLoggedIn || !user) return false;
    if (gig.authorId === user.id) return false;
    if (gig.type === "employer" && user.role === "specialist") return true;
    if (gig.type === "specialist" && user.role === "employer") return true;
    return false;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Биржа заданий</span>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-2">Подработки</h1>
            <p className="text-muted max-w-2xl">
              Срочные и разовые задания. Работодатели ищут работника на день, специалисты предлагают свои услуги.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm shrink-0"
            >
              <Plus size={16} /> {createLabel}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { value: "employer" as const, label: "От работодателей", icon: <Building2 size={14} /> },
            { value: "specialist" as const, label: "От специалистов", icon: <User size={14} /> },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-sm rounded-full border transition-all ${
                activeTab === tab.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted hover:border-primary/30"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted mb-6">
          Найдено: <span className="text-foreground font-medium">{filtered.length}</span> объявлений
        </p>

        {/* Gig cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((gig) => (
            <div
              key={gig.id}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                {gig.urgent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-medium">
                    🔥 Срочно
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    gig.type === "employer" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                  }`}
                >
                  {gig.type === "employer" ? (
                    <>
                      <Building2 size={12} /> Работодатель
                    </>
                  ) : (
                    <>
                      <User size={12} /> Специалист
                    </>
                  )}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{gig.title}</h3>
              <p className="text-sm text-primary/80 font-medium mb-3">{gig.authorName}</p>
              <p className="text-sm text-muted leading-relaxed mb-4">{gig.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted mb-4">
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {gig.city}, {gig.district}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {gig.date}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} /> {gig.responses.length} откликов
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-lg font-bold text-primary">{gig.pay}</div>
                {canRespond(gig) && (
                  <button
                    onClick={() => setShowRespondModal(gig.id)}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm bg-primary text-white rounded-full hover:bg-primary-hover transition-colors font-medium"
                  >
                    Откликнуться <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-muted text-lg">Пока нет объявлений в этой категории</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Gig Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{createLabel}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Заголовок *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Например: Полировщик на 1 день"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Город</label>
                  <input
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Москва"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Район</label>
                  <input
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    placeholder="Центральный"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Дата</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Оплата</label>
                  <input
                    value={formPay}
                    onChange={(e) => setFormPay(e.target.value)}
                    placeholder="5 000 ₽/день"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Подробности задания..."
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formUrgent}
                  onChange={(e) => setFormUrgent(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm">🔥 Срочное задание</span>
              </label>
            </div>

            <button
              onClick={handleCreate}
              disabled={!formTitle.trim()}
              className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              Опубликовать
            </button>
          </div>
        </div>
      )}

      {/* ── Respond Modal ── */}
      {showRespondModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRespondModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Откликнуться</h2>
              <button onClick={() => setShowRespondModal(null)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Сообщение</label>
              <textarea
                value={respondMessage}
                onChange={(e) => setRespondMessage(e.target.value)}
                rows={4}
                placeholder="Расскажите о себе и почему вы подходите..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm resize-none"
              />
            </div>

            <button
              onClick={handleRespond}
              className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm"
            >
              Отправить отклик
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
