"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Users, Briefcase, FileText, Star, MessageSquare,
  Plus, Edit, Trash2, CheckCircle2, ChevronRight,
  MapPin, Clock, Award, Heart, BookOpen,
  ToggleLeft, ToggleRight, X, Save, TrendingUp,
  Calendar, Tag, Image as ImageIcon, Package, Shield, Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  auth as authService,
  vacancies as vacancyService,
  gigs as gigService,
  clientOrders as orderService,
  messaging as messagingService,
  promos as promoService,
  reviews as reviewService,
  training as trainingService,
  collectivePurchases as purchaseService,
  type User,
  type Vacancy,
  type Gig,
  type ClientOrder,
  type Conversation,
  type Promo,
  type Review,
  type TrainingEnrollment,
  type CollectivePurchase,
  type PortfolioItem,
} from "@/lib/storage";

type Tab = string;

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, updateProfile, isLoggedIn } = useAuth();
  const [tab, setTab] = useState("overview");

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Data
  const [myVacancies, setMyVacancies] = useState<Vacancy[]>([]);
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [myOrders, setMyOrders] = useState<ClientOrder[]>([]);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [myPromos, setMyPromos] = useState<Promo[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [myPurchases, setMyPurchases] = useState<CollectivePurchase[]>([]);
  const [appliedVacs, setAppliedVacs] = useState<Vacancy[]>([]);
  const [favUsers, setFavUsers] = useState<User[]>([]);

  // Modals
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", email: "", password: "", canEditVacancies: true, canEditProfile: false });
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: "", description: "", imageUrl: "" });
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/login");
  }, [loading, isLoggedIn, router]);

  const loadData = useCallback(() => {
    if (!user) return;
    setConvos(messagingService.getConversations(user.id));

    if (user.role === "employer") {
      setMyVacancies(vacancyService.getByEmployer(user.id));
      setMyGigs(gigService.getByAuthor(user.id));
      setMyPromos(promoService.getAll().filter(p => p.creatorId === user.id));
    }
    if (user.role === "specialist") {
      setMyGigs(gigService.getByAuthor(user.id));
      setMyReviews(reviewService.getByTarget(user.id));
      setEnrollments(trainingService.getEnrollments(user.id));
      setAppliedVacs(vacancyService.getAll().filter(v => v.applications.some(a => a.specialistId === user.id)));
    }
    if (user.role === "client") {
      setMyOrders(orderService.getByClient(user.id));
      if (user.favorites?.length) {
        setFavUsers(user.favorites.map(id => authService.getUser(id)).filter((u): u is User => !!u));
      } else {
        setFavUsers([]);
      }
    }
    if (user.role === "supplier") {
      setMyPurchases(purchaseService.getAll().filter(p => p.supplierId === user.id));
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Profile
  const startEditing = () => { if (user) { setEditForm({ ...user }); setEditing(true); } };
  const saveProfile = () => {
    if (!user || !editForm) return;
    const { id: _id, createdAt: _c, password: _p, ...rest } = editForm as User;
    void _id; void _c; void _p;
    updateProfile(rest);
    setEditing(false);
    loadData();
  };

  // Actions
  const deleteVacancy = (id: string) => { vacancyService.delete(id); setMyVacancies(p => p.filter(v => v.id !== id)); };
  const deleteGig = (id: string) => { gigService.delete(id); setMyGigs(p => p.filter(g => g.id !== id)); };

  const addSubAccount = () => {
    if (!user || !subForm.name || !subForm.email) return;
    const sub = { id: Date.now().toString(36), ...subForm };
    updateProfile({ subAccounts: [...(user.subAccounts || []), sub] });
    setSubForm({ name: "", email: "", password: "", canEditVacancies: true, canEditProfile: false });
    setShowSubForm(false);
  };

  const removeSubAccount = (subId: string) => {
    if (!user) return;
    updateProfile({ subAccounts: (user.subAccounts || []).filter(s => s.id !== subId) });
  };

  const addPortfolioItem = () => {
    if (!user || !portfolioForm.title) return;
    const item: PortfolioItem = {
      id: Date.now().toString(36),
      title: portfolioForm.title,
      description: portfolioForm.description,
      imageUrl: portfolioForm.imageUrl || "https://placehold.co/600x400/1a1a1a/dc2626?text=Portfolio",
      createdAt: new Date().toISOString(),
    };
    updateProfile({ portfolio: [...(user.portfolio || []), item] });
    setPortfolioForm({ title: "", description: "", imageUrl: "" });
    setShowPortfolioForm(false);
  };

  const removePortfolioItem = (itemId: string) => {
    if (!user) return;
    updateProfile({ portfolio: (user.portfolio || []).filter(p => p.id !== itemId) });
  };

  const removeFavorite = (targetId: string) => {
    if (!user) return;
    authService.toggleFavorite(user.id, targetId);
    setFavUsers(p => p.filter(u => u.id !== targetId));
  };

  // Helpers
  const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }); } catch { return iso; } };
  const fmtDateTime = (iso: string) => { try { return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return iso; } };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: "Активен", cls: "bg-emerald-500/10 text-emerald-400" },
      closed: { label: "Закрыта", cls: "bg-red-500/10 text-red-400" },
      completed: { label: "Завершён", cls: "bg-muted/20 text-muted" },
      cancelled: { label: "Отменён", cls: "bg-red-500/10 text-red-400" },
      pending: { label: "Ожидает", cls: "bg-amber-500/10 text-amber-400" },
      accepted: { label: "Принят", cls: "bg-emerald-500/10 text-emerald-400" },
      rejected: { label: "Отклонён", cls: "bg-red-500/10 text-red-400" },
      searching: { label: "Ищу работу", cls: "bg-emerald-500/10 text-emerald-400" },
      open: { label: "Открыт", cls: "bg-blue-500/10 text-blue-400" },
      employed: { label: "Занят", cls: "bg-amber-500/10 text-amber-400" },
      enrolled: { label: "Записан", cls: "bg-blue-500/10 text-blue-400" },
      inProgress: { label: "В работе", cls: "bg-blue-500/10 text-blue-400" },
      taken: { label: "Занято", cls: "bg-blue-500/10 text-blue-400" },
    };
    const s = map[status] || { label: status, cls: "bg-muted/20 text-muted" };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
  };

  const planLabel = (plan?: string) => {
    const m: Record<string, { label: string; cls: string }> = {
      basic: { label: "Базовый", cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
      pro: { label: "Про", cls: "bg-primary/10 text-primary border-primary/20" },
      premium: { label: "Премиум", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    };
    const p = m[plan || "basic"] || m.basic;
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${p.cls}`}>{p.label}</span>;
  };

  if (loading) return <div className="pt-24 pb-16 min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted">Загрузка...</div></div>;
  if (!user) return null;

  const totalApps = myVacancies.reduce((s, v) => s + v.applications.length, 0);
  const unread = convos.reduce((s, c) => s + (c.unreadCount[user.id] || 0), 0);

  // Shared components
  const StatCard = ({ label, value, icon: Icon, color = "text-primary" }: { label: string; value: string | number; icon: typeof Briefcase; color?: string }) => (
    <div className="p-5 rounded-2xl bg-card border border-border card-glow">
      <div className="flex items-center justify-between mb-2">
        <Icon size={20} className={color} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );

  const Card = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
    <div className="p-6 rounded-2xl bg-card border border-border card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  const TabBar = ({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) => (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active === t.key ? "bg-primary text-white" : "bg-surface border border-border hover:border-primary/30"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );

  const EditField = ({ label, field, type = "text" }: { label: string; field: keyof User; type?: string }) => (
    <div>
      <label className="text-xs text-muted block mb-1">{label}</label>
      {editing ? (
        <input type={type} value={(editForm[field] as string) || ""} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
      ) : (
        <div className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground/80">{(user[field] as string) || "—"}</div>
      )}
    </div>
  );

  const EditTextarea = ({ label, field }: { label: string; field: keyof User }) => (
    <div className="sm:col-span-2">
      <label className="text-xs text-muted block mb-1">{label}</label>
      {editing ? (
        <textarea value={(editForm[field] as string) || ""} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} rows={3} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none resize-none" />
      ) : (
        <div className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground/80">{(user[field] as string) || "—"}</div>
      )}
    </div>
  );

  const EditSkills = ({ label, field }: { label: string; field: "skills" | "services" | "products" }) => (
    <div className="sm:col-span-2">
      <label className="text-xs text-muted block mb-1">{label}</label>
      {editing ? (
        <input value={(editForm[field] as string[] || []).join(", ")} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="Через запятую" className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {(user[field] as string[] || []).length > 0 ? (user[field] as string[]).map(s => (
            <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">{s}</span>
          )) : <span className="text-sm text-muted">—</span>}
        </div>
      )}
    </div>
  );

  const ProfileActions = () => (
    <div className="flex gap-2">
      {editing ? (
        <>
          <button onClick={saveProfile} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary-hover"><Save size={14} /> Сохранить</button>
          <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border rounded-full text-sm hover:border-primary/30"><X size={14} /> Отмена</button>
        </>
      ) : (
        <button onClick={startEditing} className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border rounded-full text-sm hover:border-primary/30"><Edit size={14} /> Редактировать</button>
      )}
    </div>
  );

  const QuickAction = ({ href, icon: Icon, title, sub }: { href: string; icon: typeof Plus; title: string; sub: string }) => (
    <Link href={href} className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Icon size={20} /></div>
      <div>
        <span className="text-sm font-medium block">{title}</span>
        <span className="text-[10px] text-muted">{sub}</span>
      </div>
    </Link>
  );

  const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center py-10 text-muted text-sm">{text}</div>
  );

  // ========== VACANCY / GIG / ORDER LIST ITEMS ==========
  const VacancyItem = ({ v }: { v: Vacancy }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
      <div className="min-w-0 flex-1">
        <Link href={`/vacancies/${v.id}`} className="text-sm font-medium hover:text-primary transition-colors">{v.title}</Link>
        <div className="flex items-center gap-3 text-xs text-muted mt-1">
          <span className="flex items-center gap-1"><MapPin size={12} />{v.city}</span>
          <span>{v.salary}</span>
          <span>{v.applications.length} откликов</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {statusBadge(v.status)}
        {user.role === "employer" && <button onClick={() => deleteVacancy(v.id)} className="p-1.5 hover:text-red-400 text-muted transition-colors"><Trash2 size={14} /></button>}
      </div>
    </div>
  );

  const GigItem = ({ g }: { g: Gig }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium">{g.title}</span>
        <div className="flex items-center gap-3 text-xs text-muted mt-1">
          <span className="flex items-center gap-1"><MapPin size={12} />{g.city}</span>
          <span>{g.pay}</span>
          <span>{g.responses.length} откликов</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {g.urgent && <span className="text-xs">🔥</span>}
        {statusBadge(g.status)}
        <button onClick={() => deleteGig(g.id)} className="p-1.5 hover:text-red-400 text-muted transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  );

  const OrderItem = ({ o }: { o: ClientOrder }) => (
    <div className="p-4 rounded-xl bg-surface border border-border">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium">{o.service}</span>
          <div className="flex items-center gap-3 text-xs text-muted mt-1">
            <span className="flex items-center gap-1"><MapPin size={12} />{o.city}</span>
            <span>{o.carType}</span>
            <span>{o.budget}</span>
            <span>{o.responses.length} откликов</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {statusBadge(o.status)}
          {o.responses.length > 0 && (
            <button onClick={() => setViewOrderId(viewOrderId === o.id ? null : o.id)} className="text-xs text-primary hover:underline">
              {viewOrderId === o.id ? "Скрыть" : "Отклики"}
            </button>
          )}
        </div>
      </div>
      {viewOrderId === o.id && o.responses.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {o.responses.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <div>
                <span className="text-sm font-medium">{r.responderName}</span>
                <span className="text-xs text-muted ml-2">({r.responderRole})</span>
                <p className="text-xs text-muted mt-1">{r.message}</p>
                {r.price && <span className="text-xs text-primary">Цена: {r.price}</span>}
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(r.status)}
                {r.status === "pending" && (
                  <button onClick={() => { orderService.acceptResponse(o.id, r.id); loadData(); }} className="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary-hover">Принять</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== TABS CONFIG ==========
  const roleTabs: Record<string, { key: string; label: string }[]> = {
    employer: [
      { key: "overview", label: "Обзор" },
      { key: "profile", label: "Профиль" },
      { key: "vacancies", label: "Вакансии" },
      { key: "gigs", label: "Подработки" },
      { key: "promos", label: "Промоакции" },
      { key: "subaccounts", label: "Суб-аккаунты" },
    ],
    specialist: [
      { key: "overview", label: "Обзор" },
      { key: "profile", label: "Профиль" },
      { key: "applications", label: "Отклики" },
      { key: "gigs", label: "Подработки" },
      { key: "training", label: "Обучение" },
      { key: "reviews", label: "Отзывы" },
      { key: "portfolio", label: "Портфолио" },
    ],
    client: [
      { key: "overview", label: "Обзор" },
      { key: "profile", label: "Профиль" },
      { key: "orders", label: "Мои заказы" },
      { key: "favorites", label: "Избранное" },
    ],
    supplier: [
      { key: "overview", label: "Обзор" },
      { key: "profile", label: "Профиль" },
      { key: "purchases", label: "Закупки" },
    ],
  };

  const roleLabel: Record<string, string> = { employer: "работодателя", specialist: "специалиста", client: "клиента", supplier: "поставщика" };
  const roleIcon: Record<string, typeof Building2> = { employer: Building2, specialist: Award, client: Users, supplier: Package };
  const RoleIcon = roleIcon[user.role] || Building2;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <RoleIcon size={28} className="text-primary" />
              {user.companyName || user.name}
            </h1>
            <p className="text-sm text-muted mt-1">Личный кабинет {roleLabel[user.role]}</p>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "employer" && planLabel(user.subscriptionPlan)}
            {user.isVerified && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={14} /> Верифицировано</span>}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {user.role === "employer" && <>
            <StatCard label="Вакансий" value={myVacancies.length} icon={Briefcase} />
            <StatCard label="Откликов" value={totalApps} icon={FileText} color="text-blue-400" />
            <StatCard label="Сообщений" value={unread} icon={MessageSquare} color="text-amber-400" />
            <StatCard label="Рейтинг" value={user.rating || 0} icon={Star} color="text-yellow-400" />
          </>}
          {user.role === "specialist" && <>
            <StatCard label="Отклики" value={appliedVacs.length} icon={FileText} />
            <StatCard label="Подработки" value={myGigs.length} icon={Briefcase} color="text-blue-400" />
            <StatCard label="Отзывы" value={myReviews.length} icon={Star} color="text-yellow-400" />
            <StatCard label="Рейтинг" value={user.rating || 0} icon={TrendingUp} color="text-emerald-400" />
          </>}
          {user.role === "client" && <>
            <StatCard label="Заказов" value={myOrders.length} icon={FileText} />
            <StatCard label="Активных" value={myOrders.filter(o => o.status === "active").length} icon={Zap} color="text-emerald-400" />
            <StatCard label="Избранное" value={favUsers.length} icon={Heart} color="text-pink-400" />
            <StatCard label="Сообщений" value={unread} icon={MessageSquare} color="text-amber-400" />
          </>}
          {user.role === "supplier" && <>
            <StatCard label="Закупок" value={myPurchases.length} icon={Package} />
            <StatCard label="Рейтинг" value={user.rating || 0} icon={Star} color="text-yellow-400" />
            <StatCard label="Сообщений" value={unread} icon={MessageSquare} color="text-amber-400" />
            <StatCard label="Верификация" value={user.isVerified ? "✓" : "—"} icon={Shield} color="text-emerald-400" />
          </>}
        </div>

        {/* Tabs */}
        <TabBar tabs={roleTabs[user.role] || roleTabs.client} active={tab} onChange={setTab} />

        {/* ===================== OVERVIEW ===================== */}
        {tab === "overview" && (
          <div className="space-y-6">
            <Card title="Быстрые действия">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {user.role === "employer" && <>
                  <QuickAction href="/vacancies" icon={Plus} title="Создать вакансию" sub="Опубликовать объявление" />
                  <QuickAction href="/gigs" icon={Briefcase} title="Создать подработку" sub="Разовая работа" />
                  <QuickAction href="/messages" icon={MessageSquare} title="Сообщения" sub={`${unread} непрочитанных`} />
                </>}
                {user.role === "specialist" && <>
                  <QuickAction href="/vacancies" icon={Briefcase} title="Вакансии" sub="Найти работу" />
                  <QuickAction href="/gigs" icon={Zap} title="Подработки" sub="Разовые заказы" />
                  <QuickAction href="/training" icon={BookOpen} title="Обучение" sub="Курсы и сертификация" />
                </>}
                {user.role === "client" && <>
                  <QuickAction href="/orders" icon={Plus} title="Создать заказ" sub="Заказать услугу" />
                  <QuickAction href="/specialists" icon={Users} title="Специалисты" sub="Найти мастера" />
                  <QuickAction href="/companies" icon={Building2} title="Компании" sub="Найти сервис" />
                </>}
                {user.role === "supplier" && <>
                  <QuickAction href="/suppliers" icon={Plus} title="Совместная закупка" sub="Создать закупку" />
                  <QuickAction href="/messages" icon={MessageSquare} title="Сообщения" sub={`${unread} непрочитанных`} />
                  <QuickAction href="/chats" icon={Users} title="Общий чат" sub="Обсуждения отрасли" />
                </>}
              </div>
            </Card>

            {/* Recent items */}
            {user.role === "employer" && myVacancies.length > 0 && (
              <Card title="Последние вакансии" action={<Link href="/vacancies" className="text-xs text-primary hover:underline flex items-center gap-1">Все <ChevronRight size={12} /></Link>}>
                <div className="space-y-2">{myVacancies.slice(0, 3).map(v => <VacancyItem key={v.id} v={v} />)}</div>
              </Card>
            )}
            {user.role === "specialist" && appliedVacs.length > 0 && (
              <Card title="Последние отклики" action={<button onClick={() => setTab("applications")} className="text-xs text-primary hover:underline flex items-center gap-1">Все <ChevronRight size={12} /></button>}>
                <div className="space-y-2">{appliedVacs.slice(0, 3).map(v => <VacancyItem key={v.id} v={v} />)}</div>
              </Card>
            )}
            {user.role === "client" && myOrders.length > 0 && (
              <Card title="Последние заказы" action={<button onClick={() => setTab("orders")} className="text-xs text-primary hover:underline flex items-center gap-1">Все <ChevronRight size={12} /></button>}>
                <div className="space-y-2">{myOrders.slice(0, 3).map(o => <OrderItem key={o.id} o={o} />)}</div>
              </Card>
            )}
            {user.role === "supplier" && myPurchases.length > 0 && (
              <Card title="Мои закупки">
                <div className="space-y-2">{myPurchases.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                    <div>
                      <span className="text-sm font-medium">{p.product}</span>
                      <div className="text-xs text-muted mt-1">{p.participants.length} участников · {p.currentVolume}/{p.targetVolume}</div>
                    </div>
                    {statusBadge(p.status)}
                  </div>
                ))}</div>
              </Card>
            )}
          </div>
        )}

        {/* ===================== PROFILE ===================== */}
        {tab === "profile" && (
          <Card title="Профиль" action={<ProfileActions />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.role === "employer" && <>
                <EditField label="Название компании" field="companyName" />
                <EditField label="Тип компании" field="companyType" />
                <EditField label="Город" field="city" />
                <EditField label="Район" field="district" />
                <EditField label="Адрес" field="address" />
                <EditField label="Телефон" field="phone" />
                <EditField label="Email" field="email" type="email" />
                <EditField label="ИНН" field="inn" />
                <EditField label="Часы работы" field="workingHours" />
                <div />
                <EditTextarea label="Описание" field="description" />
                <EditSkills label="Услуги" field="services" />
              </>}
              {user.role === "specialist" && <>
                <EditField label="Имя" field="name" />
                <EditField label="Специализация" field="specialization" />
                <EditField label="Город" field="city" />
                <EditField label="Телефон" field="phone" />
                <EditField label="Email" field="email" type="email" />
                <EditField label="Опыт" field="experience" />
                <EditSkills label="Навыки" field="skills" />
                <div className="sm:col-span-2 flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Статус:</span>
                    <button onClick={() => { updateProfile({ status: user.status === "searching" ? "employed" : "searching" }); }} className="flex items-center gap-2">
                      {user.status === "searching" ? <ToggleRight size={24} className="text-emerald-400" /> : <ToggleLeft size={24} className="text-muted" />}
                      <span className="text-sm">{user.status === "searching" ? "Ищу работу" : "Занят"}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Подработки:</span>
                    <button onClick={() => { updateProfile({ availableForGigs: !user.availableForGigs }); }} className="flex items-center gap-2">
                      {user.availableForGigs ? <ToggleRight size={24} className="text-emerald-400" /> : <ToggleLeft size={24} className="text-muted" />}
                      <span className="text-sm">{user.availableForGigs ? "Доступен" : "Недоступен"}</span>
                    </button>
                  </div>
                </div>
              </>}
              {user.role === "client" && <>
                <EditField label="Имя" field="name" />
                <EditField label="Город" field="city" />
                <EditField label="Телефон" field="phone" />
                <EditField label="Email" field="email" type="email" />
              </>}
              {user.role === "supplier" && <>
                <EditField label="Название компании" field="companyName" />
                <EditField label="Категория" field="category" />
                <EditField label="Город" field="city" />
                <EditField label="Телефон" field="phone" />
                <EditField label="Email" field="email" type="email" />
                <EditField label="Мин. заказ" field="minOrder" />
                <EditField label="Скидка (%)" field="discount" />
                <div />
                <EditSkills label="Продукция" field="products" />
              </>}
            </div>

            {/* Subscription info for employer */}
            {user.role === "employer" && (
              <div className="mt-6 p-4 rounded-xl bg-surface border border-border">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Shield size={16} className="text-primary" /> Подписка</h4>
                <div className="flex items-center gap-4">
                  {planLabel(user.subscriptionPlan)}
                  {user.subscriptionExpiry && <span className="text-xs text-muted">до {fmtDate(user.subscriptionExpiry)}</span>}
                  <button className="ml-auto px-4 py-1.5 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors">Улучшить</button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ===================== EMPLOYER: VACANCIES ===================== */}
        {tab === "vacancies" && user.role === "employer" && (
          <Card title={`Мои вакансии (${myVacancies.length})`} action={<Link href="/vacancies" className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Создать</Link>}>
            {myVacancies.length === 0 ? <EmptyState text="У вас пока нет вакансий" /> : (
              <div className="space-y-2">{myVacancies.map(v => <VacancyItem key={v.id} v={v} />)}</div>
            )}
          </Card>
        )}

        {/* ===================== EMPLOYER: GIGS ===================== */}
        {tab === "gigs" && (user.role === "employer" || user.role === "specialist") && (
          <Card title={`Мои подработки (${myGigs.length})`} action={<Link href="/gigs" className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Создать</Link>}>
            {myGigs.length === 0 ? <EmptyState text="У вас пока нет подработок" /> : (
              <div className="space-y-2">{myGigs.map(g => <GigItem key={g.id} g={g} />)}</div>
            )}
          </Card>
        )}

        {/* ===================== EMPLOYER: PROMOS ===================== */}
        {tab === "promos" && user.role === "employer" && (
          <Card title={`Мои промоакции (${myPromos.length})`} action={<Link href="/promos" className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Создать</Link>}>
            {myPromos.length === 0 ? <EmptyState text="У вас пока нет промоакций" /> : (
              <div className="space-y-2">{myPromos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                  <div>
                    <span className="text-sm font-medium">{p.title}</span>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1">
                      <span className="flex items-center gap-1"><Tag size={12} />{p.discount}</span>
                      <span>Код: {p.code}</span>
                      <span>Использовано: {p.usedBy.length}/{p.maxUses || "∞"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isActive ? <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400">Активна</span> : <span className="px-2.5 py-1 rounded-full text-xs bg-muted/20 text-muted">Неактивна</span>}
                  </div>
                </div>
              ))}</div>
            )}
          </Card>
        )}

        {/* ===================== EMPLOYER: SUB-ACCOUNTS ===================== */}
        {tab === "subaccounts" && user.role === "employer" && (
          <Card title="Суб-аккаунты" action={<button onClick={() => setShowSubForm(true)} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Добавить</button>}>
            {(user.subAccounts || []).length === 0 ? (
              <EmptyState text="Нет суб-аккаунтов. Добавьте сотрудников для управления профилем." />
            ) : (
              <div className="space-y-2">
                {(user.subAccounts || []).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                    <div>
                      <span className="text-sm font-medium">{s.name}</span>
                      <div className="text-xs text-muted mt-1">{s.email}</div>
                      <div className="flex gap-2 mt-1.5">
                        {s.canEditVacancies && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full">Вакансии</span>}
                        {s.canEditProfile && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-full">Профиль</span>}
                      </div>
                    </div>
                    <button onClick={() => removeSubAccount(s.id)} className="p-1.5 hover:text-red-400 text-muted"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-account form modal */}
            {showSubForm && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSubForm(false)}>
                <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-4">Добавить суб-аккаунт</h3>
                  <div className="space-y-3">
                    <input placeholder="Имя" value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                    <input placeholder="Email" type="email" value={subForm.email} onChange={e => setSubForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                    <input placeholder="Пароль" type="password" value={subForm.password} onChange={e => setSubForm(p => ({ ...p, password: e.target.value }))} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={subForm.canEditVacancies} onChange={e => setSubForm(p => ({ ...p, canEditVacancies: e.target.checked }))} className="accent-primary" /> Управление вакансиями</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={subForm.canEditProfile} onChange={e => setSubForm(p => ({ ...p, canEditProfile: e.target.checked }))} className="accent-primary" /> Редактирование профиля</label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setShowSubForm(false)} className="px-4 py-2 text-sm border border-border rounded-full hover:border-primary/30">Отмена</button>
                    <button onClick={addSubAccount} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover">Добавить</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ===================== SPECIALIST: APPLICATIONS ===================== */}
        {tab === "applications" && user.role === "specialist" && (
          <Card title={`Мои отклики (${appliedVacs.length})`}>
            {appliedVacs.length === 0 ? <EmptyState text="Вы ещё не откликались на вакансии" /> : (
              <div className="space-y-2">
                {appliedVacs.map(v => {
                  const myApp = v.applications.find(a => a.specialistId === user.id);
                  return (
                    <div key={v.id} className="p-4 rounded-xl bg-surface border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link href={`/vacancies/${v.id}`} className="text-sm font-medium hover:text-primary">{v.title}</Link>
                          <div className="flex items-center gap-3 text-xs text-muted mt-1">
                            <span>{v.companyName}</span>
                            <span>{v.salary}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} />{v.city}</span>
                          </div>
                        </div>
                        {myApp && statusBadge(myApp.status)}
                      </div>
                      {myApp?.message && <p className="text-xs text-muted mt-2 border-t border-border pt-2">{myApp.message}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* ===================== SPECIALIST: TRAINING ===================== */}
        {tab === "training" && user.role === "specialist" && (
          <Card title={`Обучение (${enrollments.length})`} action={<Link href="/training" className="text-xs text-primary hover:underline flex items-center gap-1">Каталог курсов <ChevronRight size={12} /></Link>}>
            {enrollments.length === 0 ? <EmptyState text="Вы не записаны на курсы" /> : (
              <div className="space-y-2">
                {enrollments.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                    <div>
                      <span className="text-sm font-medium">{e.course}</span>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1"><Calendar size={12} />{fmtDate(e.enrolledAt)}</span>
                        {e.completedAt && <span>Завершён: {fmtDate(e.completedAt)}</span>}
                        {e.certificateNumber && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={12} />Сертификат: {e.certificateNumber}</span>}
                      </div>
                    </div>
                    {statusBadge(e.status)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ===================== SPECIALIST: REVIEWS ===================== */}
        {tab === "reviews" && user.role === "specialist" && (
          <Card title={`Отзывы (${myReviews.length})`}>
            {myReviews.length === 0 ? <EmptyState text="Пока нет отзывов" /> : (
              <div className="space-y-3">
                {myReviews.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{r.authorName}</span>
                      <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map(n => <Star key={n} size={14} className={n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"} />)}
                    </div>
                    <p className="text-sm text-foreground/80">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ===================== SPECIALIST: PORTFOLIO ===================== */}
        {tab === "portfolio" && user.role === "specialist" && (
          <Card title="Портфолио" action={<button onClick={() => setShowPortfolioForm(true)} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Добавить</button>}>
            {(!user.portfolio || user.portfolio.length === 0) ? <EmptyState text="Портфолио пусто. Добавьте свои работы!" /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.portfolio.map(item => (
                  <div key={item.id} className="rounded-xl bg-surface border border-border overflow-hidden group">
                    <div className="aspect-[3/2] bg-card flex items-center justify-center relative">
                      <ImageIcon size={32} className="text-muted" />
                      <button onClick={() => removePortfolioItem(item.id)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      {item.description && <p className="text-xs text-muted mt-1 line-clamp-2">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showPortfolioForm && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPortfolioForm(false)}>
                <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold mb-4">Добавить работу</h3>
                  <div className="space-y-3">
                    <input placeholder="Название" value={portfolioForm.title} onChange={e => setPortfolioForm(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                    <textarea placeholder="Описание" value={portfolioForm.description} onChange={e => setPortfolioForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none resize-none" />
                    <input placeholder="URL изображения (необязательно)" value={portfolioForm.imageUrl} onChange={e => setPortfolioForm(p => ({ ...p, imageUrl: e.target.value }))} className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setShowPortfolioForm(false)} className="px-4 py-2 text-sm border border-border rounded-full hover:border-primary/30">Отмена</button>
                    <button onClick={addPortfolioItem} className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover">Добавить</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ===================== CLIENT: ORDERS ===================== */}
        {tab === "orders" && user.role === "client" && (
          <Card title={`Мои заказы (${myOrders.length})`} action={<Link href="/orders" className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Создать</Link>}>
            {myOrders.length === 0 ? <EmptyState text="У вас пока нет заказов" /> : (
              <div className="space-y-2">{myOrders.map(o => <OrderItem key={o.id} o={o} />)}</div>
            )}
          </Card>
        )}

        {/* ===================== CLIENT: FAVORITES ===================== */}
        {tab === "favorites" && user.role === "client" && (
          <Card title={`Избранное (${favUsers.length})`}>
            {favUsers.length === 0 ? <EmptyState text="Нет избранных специалистов или компаний" /> : (
              <div className="space-y-2">
                {favUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(u.companyName || u.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <Link href={u.role === "employer" ? `/companies/${u.id}` : `/specialists/${u.id}`} className="text-sm font-medium hover:text-primary">{u.companyName || u.name}</Link>
                        <div className="text-xs text-muted">{u.role === "employer" ? "Компания" : "Специалист"} · {u.city}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-yellow-400"><Star size={12} fill="currentColor" />{u.rating || 0}</div>
                      <button onClick={() => removeFavorite(u.id)} className="p-1.5 hover:text-red-400 text-muted"><Heart size={14} fill="currentColor" className="text-pink-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ===================== SUPPLIER: PURCHASES ===================== */}
        {tab === "purchases" && user.role === "supplier" && (
          <Card title={`Совместные закупки (${myPurchases.length})`} action={<Link href="/suppliers" className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-hover flex items-center gap-1.5"><Plus size={14} /> Создать</Link>}>
            {myPurchases.length === 0 ? <EmptyState text="У вас нет совместных закупок" /> : (
              <div className="space-y-3">
                {myPurchases.map(p => (
                  <div key={p.id} className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{p.product}</span>
                      {statusBadge(p.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted mb-2">
                      <span>{p.participants.length} участников</span>
                      <span>Цена: {p.unitPrice}</span>
                      <span>До: {fmtDate(p.deadline)}</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 border border-border">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.min(100, (p.currentVolume / p.targetVolume) * 100)}%` }} />
                    </div>
                    <div className="text-xs text-muted mt-1">{p.currentVolume} / {p.targetVolume} ({Math.round((p.currentVolume / p.targetVolume) * 100)}%)</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
