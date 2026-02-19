"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  ShoppingCart,
  CheckCircle2,
  Users,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  Clock,
  Star,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import {
  auth as authService,
  collectivePurchases as purchaseService,
  type User,
  type CollectivePurchase,
} from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

export default function SuppliersPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"suppliers" | "purchases">("suppliers");

  // ── Suppliers state ──
  const [suppliers, setSuppliers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Purchases state ──
  const [purchases, setPurchases] = useState<CollectivePurchase[]>([]);

  // ── Join modal ──
  const [joinTarget, setJoinTarget] = useState<CollectivePurchase | null>(null);
  const [joinAmount, setJoinAmount] = useState("");

  // ── Create purchase modal (supplier only) ──
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    product: "",
    description: "",
    targetVolume: "",
    unitPrice: "",
    retailPrice: "",
    deadline: "",
  });

  // ── Load data ──
  useEffect(() => {
    setSuppliers(authService.getUsersByRole("supplier"));
    setPurchases(purchaseService.getActive());
  }, []);

  // ── Filtered suppliers ──
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        (s.companyName ?? "").toLowerCase().includes(q) ||
        (s.products ?? []).some((p) => p.toLowerCase().includes(q)) ||
        (s.category ?? "").toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

  // ── Handlers ──
  function handleMessage(supplierId: string) {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    router.push(`/messages?to=${supplierId}`);
  }

  function handleJoin() {
    if (!joinTarget || !user) return;
    const qty = parseInt(joinAmount, 10);
    if (!qty || qty <= 0) return;
    purchaseService.join(joinTarget.id, user.id, user.companyName || user.name, qty);
    setPurchases(purchaseService.getActive());
    setJoinTarget(null);
    setJoinAmount("");
  }

  function handleCreatePurchase() {
    if (!user) return;
    const vol = parseInt(newPurchase.targetVolume, 10);
    if (!newPurchase.product || !vol || !newPurchase.deadline) return;
    purchaseService.create({
      supplierId: user.id,
      supplierName: user.companyName || user.name,
      product: newPurchase.product,
      description: newPurchase.description,
      targetVolume: vol,
      unitPrice: newPurchase.unitPrice,
      retailPrice: newPurchase.retailPrice,
      deadline: newPurchase.deadline,
    });
    setPurchases(purchaseService.getActive());
    setShowCreateModal(false);
    setNewPurchase({ product: "", description: "", targetVolume: "", unitPrice: "", retailPrice: "", deadline: "" });
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-10">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">B2B Маркетплейс</span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">Поставщики и закупки</h1>
          <p className="text-muted max-w-2xl">
            Производители автохимии, оборудования и расходников. Коллективные закупки по оптовым ценам.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center gap-2 px-5 py-3 text-sm rounded-xl border transition-all ${
              activeTab === "suppliers"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted hover:border-primary/30"
            }`}
          >
            <Package size={16} /> Поставщики
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex items-center gap-2 px-5 py-3 text-sm rounded-xl border transition-all ${
              activeTab === "purchases"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted hover:border-primary/30"
            }`}
          >
            <ShoppingCart size={16} /> Совместные закупки
          </button>
        </div>

        {/* ═══════════════════════════════════════
            TAB 1 — Поставщики
           ═══════════════════════════════════════ */}
        {activeTab === "suppliers" && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Поиск по компании, продуктам, категории…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {filteredSuppliers.length === 0 && (
              <div className="text-center py-16 text-muted">
                <Package size={48} className="mx-auto mb-4 opacity-30" />
                <p>Поставщики не найдены</p>
              </div>
            )}

            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Top row */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {supplier.companyName || supplier.name}
                          </h3>
                          {supplier.isVerified && <CheckCircle2 size={16} className="text-primary" />}
                        </div>
                        <span className="text-xs text-primary/80">{supplier.category}</span>
                      </div>
                    </div>

                    {/* City */}
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
                      <MapPin size={12} />
                      <span>{supplier.city}</span>
                    </div>

                    {/* Products */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(supplier.products ?? []).map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 text-xs bg-surface border border-border rounded-full text-muted"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      {supplier.minOrder && (
                        <span>
                          Мин. заказ: <span className="text-foreground">{supplier.minOrder}</span>
                        </span>
                      )}
                      {supplier.discount && (
                        <span className="text-primary font-medium">{supplier.discount}</span>
                      )}
                      {(supplier.rating ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={12} className="text-primary fill-primary" />
                          <span className="text-foreground font-medium">{supplier.rating}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleMessage(supplier.id)}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm bg-primary text-white rounded-full hover:bg-primary-hover transition-colors font-medium"
                    >
                      <MessageSquare size={14} /> Написать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════
            TAB 2 — Совместные закупки
           ═══════════════════════════════════════ */}
        {activeTab === "purchases" && (
          <div className="space-y-6">
            {/* Info block */}
            <div className="p-6 rounded-2xl bg-surface border border-border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Как работают совместные закупки?
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Объединяйтесь с другими компаниями для закупки материалов по оптовым ценам. Когда набирается
                необходимый объём, все участники получают товар по сниженной стоимости.
              </p>
            </div>

            {/* Create button for suppliers */}
            {isLoggedIn && user?.role === "supplier" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-3 text-sm bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium"
              >
                <Plus size={16} /> Создать совместную закупку
              </button>
            )}

            {purchases.length === 0 && (
              <div className="text-center py-16 text-muted">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                <p>Активных закупок пока нет</p>
              </div>
            )}

            {purchases.map((purchase) => {
              const progress = purchase.targetVolume
                ? Math.round((purchase.currentVolume / purchase.targetVolume) * 100)
                : 0;
              return (
                <div
                  key={purchase.id}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-primary/80 font-medium mb-1">{purchase.supplierName}</p>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                        {purchase.product}
                      </h3>
                      {purchase.description && (
                        <p className="text-sm text-muted leading-relaxed mb-3">{purchase.description}</p>
                      )}

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted mb-2">
                          <span>
                            Собрано: {purchase.currentVolume} из {purchase.targetVolume}
                          </span>
                          <span className="text-primary font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-red rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                        <span>
                          Опт:{" "}
                          <span className="text-primary font-bold">{purchase.unitPrice}</span>
                        </span>
                        <span>
                          Розница: <span className="line-through">{purchase.retailPrice}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {purchase.participants.length} участников
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> до {purchase.deadline}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            purchase.status === "active"
                              ? "bg-success/10 text-success"
                              : purchase.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/10 text-muted"
                          }`}
                        >
                          {purchase.status === "active"
                            ? "Активна"
                            : purchase.status === "completed"
                            ? "Завершена"
                            : "Отменена"}
                        </span>
                      </div>
                    </div>

                    {/* Join */}
                    {purchase.status === "active" && (
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            router.push("/login");
                            return;
                          }
                          setJoinTarget(purchase);
                        }}
                        className="flex items-center gap-1.5 px-5 py-3 text-sm bg-primary text-white rounded-full hover:bg-primary-hover transition-colors font-medium shrink-0"
                      >
                        Присоединиться <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          Modal — Присоединиться к закупке
         ═══════════════════════════════════════ */}
      {joinTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 card-glow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Присоединиться к закупке</h3>
              <button onClick={() => setJoinTarget(null)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-muted mb-4">
              <span className="text-foreground font-medium">{joinTarget.product}</span> —{" "}
              {joinTarget.supplierName}
            </p>
            <p className="text-xs text-muted mb-4">Цена за единицу: {joinTarget.unitPrice}</p>

            <label className="block text-sm text-muted mb-1">Количество</label>
            <input
              type="number"
              min={1}
              value={joinAmount}
              onChange={(e) => setJoinAmount(e.target.value)}
              placeholder="Введите количество"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setJoinTarget(null)}
                className="flex-1 px-4 py-3 text-sm border border-border rounded-xl text-muted hover:border-primary/30 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleJoin}
                className="flex-1 px-4 py-3 text-sm bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Modal — Создать закупку (supplier)
         ═══════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Новая совместная закупка</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1">Название товара</label>
                <input
                  type="text"
                  value={newPurchase.product}
                  onChange={(e) => setNewPurchase({ ...newPurchase, product: e.target.value })}
                  placeholder="Шампунь NanoMagic 1L"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-1">Описание</label>
                <textarea
                  rows={3}
                  value={newPurchase.description}
                  onChange={(e) => setNewPurchase({ ...newPurchase, description: e.target.value })}
                  placeholder="Описание товара и условий закупки"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Целевой объём</label>
                  <input
                    type="number"
                    min={1}
                    value={newPurchase.targetVolume}
                    onChange={(e) => setNewPurchase({ ...newPurchase, targetVolume: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Дедлайн</label>
                  <input
                    type="date"
                    value={newPurchase.deadline}
                    onChange={(e) => setNewPurchase({ ...newPurchase, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1">Оптовая цена</label>
                  <input
                    type="text"
                    value={newPurchase.unitPrice}
                    onChange={(e) => setNewPurchase({ ...newPurchase, unitPrice: e.target.value })}
                    placeholder="450 ₽"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1">Розничная цена</label>
                  <input
                    type="text"
                    value={newPurchase.retailPrice}
                    onChange={(e) => setNewPurchase({ ...newPurchase, retailPrice: e.target.value })}
                    placeholder="650 ₽"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 text-sm border border-border rounded-xl text-muted hover:border-primary/30 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreatePurchase}
                className="flex-1 px-4 py-3 text-sm bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium"
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
