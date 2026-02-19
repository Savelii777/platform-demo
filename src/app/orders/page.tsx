"use client";

import { useState, useEffect } from "react";
import {
  Search, MapPin, Car, MessageSquare, DollarSign,
  ChevronDown, CheckCircle2, Plus, X, Calendar, FileText,
  User as UserIcon,
} from "lucide-react";
import { clientOrders as orderService, type ClientOrder } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active:     { label: "Ищу исполнителя", color: "bg-success/10 text-success" },
  pending:    { label: "Ожидание",        color: "bg-warning/10 text-warning" },
  inProgress: { label: "В работе",        color: "bg-blue-500/10 text-blue-400" },
  completed:  { label: "Завершён",        color: "bg-muted/20 text-muted" },
  cancelled:  { label: "Отменён",         color: "bg-danger/10 text-danger" },
};

export default function OrdersPage() {
  const { user, isLoggedIn } = useAuth();

  /* ── Data ──────────────────────────────── */
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");

  const load = () => {
    setOrders(
      activeTab === "all" ? orderService.getAll() : orderService.getActive()
    );
  };

  useEffect(load, [activeTab]);

  /* ── Filters ───────────────────────────── */
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Все города");

  const cities = ["Все города", ...Array.from(new Set(orders.map((o) => o.city).filter(Boolean)))];

  const filtered = orders.filter((o) => {
    if (selectedCity !== "Все города" && o.city !== selectedCity) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.service.toLowerCase().includes(q) ||
        o.carType.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ── Create modal state ────────────────── */
  const [showCreate, setShowCreate] = useState(false);
  const [cTitle, setCTitle] = useState("");
  const [cCarType, setCCarType] = useState("");
  const [cService, setCService] = useState("");
  const [cCity, setCCity] = useState("");
  const [cDistrict, setCDistrict] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cDate, setCDate] = useState("");
  const [cTime, setCTime] = useState("");
  const [cBudget, setCBudget] = useState("");
  const [cDesc, setCDesc] = useState("");

  const resetCreate = () => {
    setCTitle(""); setCCarType(""); setCService(""); setCCity(""); setCDistrict("");
    setCAddress(""); setCDate(""); setCTime(""); setCBudget(""); setCDesc("");
  };

  const handleCreate = () => {
    if (!user || !cTitle.trim()) return;
    orderService.create({
      clientId: user.id,
      clientName: user.name,
      service: cService || cTitle,
      city: cCity,
      district: cDistrict,
      preferredDate: cDate + (cTime ? ` ${cTime}` : ""),
      budget: cBudget,
      description: cDesc,
      carType: cCarType,
    });
    load();
    resetCreate();
    setShowCreate(false);
  };

  /* ── Respond modal state ───────────────── */
  const [respondOrderId, setRespondOrderId] = useState<string | null>(null);
  const [rMessage, setRMessage] = useState("");
  const [rPrice, setRPrice] = useState("");

  const handleRespond = () => {
    if (!user || !respondOrderId) return;
    orderService.respond(respondOrderId, user.id, user.name, user.role, rPrice, rMessage);
    load();
    setRMessage("");
    setRPrice("");
    setRespondOrderId(null);
  };

  /* ── Accept response ───────────────────── */
  const handleAccept = (orderId: string, responseId: string) => {
    orderService.acceptResponse(orderId, responseId);
    load();
  };

  /* ── Expanded order (to view responses) ── */
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Permissions ───────────────────────── */
  const isClient   = isLoggedIn && user?.role === "client";
  const canRespond = isLoggedIn && (user?.role === "specialist" || user?.role === "employer");

  /* ── Render ────────────────────────────── */
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Заказы от клиентов</span>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-2">Заявки на услуги</h1>
            <p className="text-muted max-w-2xl">
              Клиенты размещают заявки на мойку, полировку, детейлинг и другие услуги. Откликнитесь и предложите свои условия.
            </p>
          </div>
          {isClient && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm shrink-0"
            >
              <Plus size={16} /> Создать заказ
            </button>
          )}
        </div>

        {/* Info banner */}
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 mb-8 flex items-start gap-4">
          <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Конкуренция по качеству</h3>
            <p className="text-sm text-muted">
              На платформе запрещён демпинг — предложения оцениваются по качеству обслуживания и рейтингу, а не только по цене.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([
            { value: "all" as const, label: "Все заказы", icon: <FileText size={14} /> },
            { value: "active" as const, label: "Активные", icon: <CheckCircle2 size={14} /> },
          ]).map((tab) => (
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по типу услуги или марке авто..."
              className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-11 pr-10 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm appearance-none min-w-[180px]"
            >
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>
        </div>

        <p className="text-sm text-muted mb-6">
          Заявок: <span className="text-foreground font-medium">{filtered.length}</span>
        </p>

        {/* ── Order cards ─────────────────── */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted">
              <Car size={48} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium mb-1">Заявок пока нет</p>
              <p className="text-sm">Будьте первым — разместите заказ!</p>
            </div>
          )}

          {filtered.map((order) => {
            const st = STATUS_MAP[order.status] ?? STATUS_MAP.active;
            const isOwner = user?.id === order.clientId;
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="group rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
              >
                {/* main row */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${st.color}`}>
                        {st.label}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                      {order.service}
                    </h3>

                    <p className="text-xs text-muted mb-2 flex items-center gap-1">
                      <UserIcon size={12} /> {isOwner ? order.clientName : "Клиент"}
                    </p>

                    {order.description && (
                      <p className="text-sm text-muted leading-relaxed mb-4">{order.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1"><Car size={14} /> {order.carType}</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {order.city}{order.district ? `, ${order.district}` : ""}
                      </span>
                      {order.preferredDate && (
                        <span className="flex items-center gap-1"><Calendar size={14} /> {order.preferredDate}</span>
                      )}
                      {order.budget && (
                        <span className="flex items-center gap-1"><DollarSign size={14} /> {order.budget}</span>
                      )}
                    </div>
                  </div>

                  {/* right side */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="text-sm text-muted hover:text-primary transition-colors"
                    >
                      <span className="text-primary font-medium">{order.responses.length}</span> откликов
                    </button>

                    {canRespond && !isOwner && order.status === "active" && (
                      <button
                        onClick={() => setRespondOrderId(order.id)}
                        className="flex items-center gap-1.5 px-6 py-3 text-sm bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors"
                      >
                        <MessageSquare size={14} /> Откликнуться
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Expanded responses ──── */}
                {isExpanded && order.responses.length > 0 && (
                  <div className="border-t border-border px-6 py-4 space-y-3">
                    <h4 className="text-sm font-semibold mb-2">Отклики ({order.responses.length})</h4>
                    {order.responses.map((r) => {
                      const rSt =
                        r.status === "accepted" ? "bg-success/10 text-success"
                        : r.status === "rejected" ? "bg-danger/10 text-danger"
                        : "bg-warning/10 text-warning";

                      return (
                        <div key={r.id} className="p-4 rounded-xl bg-background/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{r.responderName}</span>
                              <span className={`px-2 py-0.5 text-[10px] rounded-full ${rSt}`}>
                                {r.status === "accepted" ? "Принят" : r.status === "rejected" ? "Отклонён" : "Ожидание"}
                              </span>
                            </div>
                            {r.price && <p className="text-xs text-muted">Цена: <span className="text-foreground font-medium">{r.price}</span></p>}
                            {r.message && <p className="text-xs text-muted mt-1">{r.message}</p>}
                          </div>

                          {isOwner && r.status === "pending" && (
                            <button
                              onClick={() => handleAccept(order.id, r.id)}
                              className="px-4 py-2 text-xs bg-success/10 text-success border border-success/30 rounded-full font-semibold hover:bg-success/20 transition-colors shrink-0"
                            >
                              <CheckCircle2 size={12} className="inline mr-1 -mt-0.5" />
                              Принять отклик
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA: bottom */}
        {!isClient && (
          <div className="mt-12 p-8 rounded-2xl bg-card border border-primary/20 text-center card-glow relative overflow-hidden">
            <div className="absolute inset-0 hero-gradient" />
            <div className="relative">
              <Car size={40} className="mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Нужна услуга для вашего автомобиля?</h3>
              <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                Зарегистрируйтесь как клиент, разместите заявку — автомойки и детейлинг-студии сами предложат вам свои условия и цены.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════
          Modal: Create Order
         ═══════════════════════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-muted hover:text-foreground">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">Создать заказ</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название *</label>
                <input value={cTitle} onChange={(e) => setCTitle(e.target.value)} placeholder="Нужна мойка авто" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Тип авто</label>
                  <input value={cCarType} onChange={(e) => setCCarType(e.target.value)} placeholder="BMW X5" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Тип услуги</label>
                  <input value={cService} onChange={(e) => setCService(e.target.value)} placeholder="Детейлинг" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Город</label>
                  <input value={cCity} onChange={(e) => setCCity(e.target.value)} placeholder="Москва" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Район</label>
                  <input value={cDistrict} onChange={(e) => setCDistrict(e.target.value)} placeholder="Центральный" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Адрес</label>
                <input value={cAddress} onChange={(e) => setCAddress(e.target.value)} placeholder="ул. Ленина, 10" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Желаемая дата</label>
                  <input type="date" value={cDate} onChange={(e) => setCDate(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Время</label>
                  <input type="time" value={cTime} onChange={(e) => setCTime(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Бюджет</label>
                <input value={cBudget} onChange={(e) => setCBudget(e.target.value)} placeholder="до 5 000 ₽" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={3} placeholder="Подробности о заказе..." className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-border rounded-full text-sm hover:bg-card transition-colors">
                Отмена
              </button>
              <button onClick={handleCreate} disabled={!cTitle.trim()} className="flex-1 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          Modal: Respond
         ═══════════════════════════════════ */}
      {respondOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRespondOrderId(null)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <button onClick={() => setRespondOrderId(null)} className="absolute top-4 right-4 text-muted hover:text-foreground">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">Откликнуться на заказ</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Предлагаемая цена</label>
                <input value={rPrice} onChange={(e) => setRPrice(e.target.value)} placeholder="3 000 ₽" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Сообщение</label>
                <textarea value={rMessage} onChange={(e) => setRMessage(e.target.value)} rows={3} placeholder="Расскажите, почему выбрать вас..." className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setRespondOrderId(null)} className="flex-1 py-2.5 border border-border rounded-full text-sm hover:bg-card transition-colors">
                Отмена
              </button>
              <button onClick={handleRespond} disabled={!rMessage.trim()} className="flex-1 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40">
                Отправить отклик
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
