"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Star,
  X,
  XCircle,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { vacancies as vacancyService, auth as authService, type Vacancy, type User } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

const APP_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:  { label: "На рассмотрении", color: "bg-warning/10 text-warning" },
  accepted: { label: "Принят",          color: "bg-success/10 text-success" },
  rejected: { label: "Отклонён",        color: "bg-danger/10 text-danger" },
};

export default function VacancyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user, isLoggedIn } = useAuth();

  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [employer, setEmployer] = useState<User | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── Load data ─────────────────────────── */
  useEffect(() => {
    const v = vacancyService.getById(id);
    if (!v) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setVacancy(v);
    const employers = authService.getUsersByRole("employer");
    const emp = employers.find((e) => e.id === v.employerId) ?? null;
    setEmployer(emp);
    setLoading(false);
  }, [id]);

  /* ── Derived ───────────────────────────── */
  const isSpecialist = user?.role === "specialist";
  const isOwner = user?.role === "employer" && user.id === vacancy?.employerId;
  const myApplication = vacancy?.applications.find((a) => a.specialistId === user?.id);

  /* ── Actions ───────────────────────────── */
  function handleApply() {
    if (!vacancy || !user) return;
    setSubmitting(true);
    try {
      vacancyService.apply(vacancy.id, user.id, user.name, coverLetter);
      setVacancy(vacancyService.getById(vacancy.id));
      setShowApplyModal(false);
      setCoverLetter("");
    } catch {
      /* already applied — ignore */
    }
    setSubmitting(false);
  }

  function handleUpdateStatus(applicationId: string, status: "accepted" | "rejected") {
    if (!vacancy) return;
    vacancyService.updateApplicationStatus(vacancy.id, applicationId, status);
    setVacancy(vacancyService.getById(vacancy.id));
  }

  /* ── Loading ───────────────────────────── */
  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── 404 ────────────────────────────────── */
  if (notFound || !vacancy) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted">Вакансия не найдена</p>
        <Link href="/vacancies" className="text-primary hover:underline text-sm">
          ← Вернуться к вакансиям
        </Link>
      </div>
    );
  }

  const createdDate = new Date(vacancy.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* ── Render ─────────────────────────────── */
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/vacancies"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Назад к вакансиям
        </Link>

        {/* ── Vacancy header ──────────────── */}
        <div className="p-8 rounded-2xl bg-card border border-border card-glow mb-8">
          <div className="flex items-center gap-2 mb-3">
            {vacancy.isHot && (
              <span className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                🔥 Горячая
              </span>
            )}
            {vacancy.isVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                <CheckCircle2 size={12} /> Верифицировано
              </span>
            )}
            <span className="text-xs text-muted ml-auto flex items-center gap-1">
              <Calendar size={12} /> {createdDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{vacancy.title}</h1>

          {/* Company link — guests see placeholder */}
          {isLoggedIn ? (
            <Link
              href={`/companies/${vacancy.employerId}`}
              className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
            >
              <Building2 size={16} /> {vacancy.companyName}
            </Link>
          ) : (
            <p className="inline-flex items-center gap-2 text-muted mb-4">
              <Building2 size={16} /> Войдите для просмотра
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {vacancy.city}, {vacancy.district}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={14} /> {vacancy.salary}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {vacancy.schedule}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={14} /> {vacancy.experience}
            </span>
          </div>
        </div>

        {/* ── Main content ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Responsibilities / Description */}
            <div className="p-6 rounded-2xl bg-card border border-border card-glow">
              <h2 className="font-semibold mb-4">Обязанности</h2>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{vacancy.description}</p>
            </div>

            {/* Requirements */}
            <div className="p-6 rounded-2xl bg-card border border-border card-glow">
              <h2 className="font-semibold mb-4">Требования</h2>
              <ul className="space-y-2">
                {vacancy.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits / Conditions */}
            <div className="p-6 rounded-2xl bg-card border border-border card-glow">
              <h2 className="font-semibold mb-4">Условия</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <DollarSign size={14} className="text-primary mt-0.5 shrink-0" />
                  Зарплата: {vacancy.salary}
                </li>
                <li className="flex items-start gap-2">
                  <Clock size={14} className="text-primary mt-0.5 shrink-0" />
                  График: {vacancy.schedule}
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                  Район: {vacancy.city}, {vacancy.district}
                </li>
              </ul>
            </div>

            {/* Contact info — hidden for guests */}
            {isLoggedIn && employer && (
              <div className="p-6 rounded-2xl bg-card border border-border card-glow">
                <h2 className="font-semibold mb-4">Контактная информация</h2>
                <div className="space-y-3 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <UserIcon size={14} className="text-primary shrink-0" />
                    {employer.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-primary shrink-0" />
                    {employer.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-primary shrink-0" />
                    {employer.email}
                  </div>
                  {employer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary shrink-0" />
                      {employer.address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="p-6 rounded-2xl bg-surface border border-border">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Контакты скрыты</h4>
                    <p className="text-xs text-muted">
                      <Link href="/login" className="text-primary hover:underline">Войдите</Link>{" "}
                      или{" "}
                      <Link href="/register" className="text-primary hover:underline">зарегистрируйтесь</Link>,
                      чтобы увидеть контактные данные работодателя.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Anti-dumping notice */}
            <div className="p-5 rounded-2xl bg-surface border border-border">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium mb-1">Платформа гарантирует честные условия</h4>
                  <p className="text-xs text-muted">
                    Все вакансии проверены. Работодатели верифицированы по ИНН.
                    Сертифицированным специалистам рекомендованы повышенные условия оплаты.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Employer: Applications list ── */}
            {isOwner && (
              <div className="p-6 rounded-2xl bg-card border border-border card-glow">
                <h2 className="font-semibold mb-4">
                  Отклики ({vacancy.applications.length})
                </h2>

                {vacancy.applications.length === 0 ? (
                  <p className="text-sm text-muted">Пока нет откликов.</p>
                ) : (
                  <div className="space-y-4">
                    {vacancy.applications.map((app) => {
                      const st = APP_STATUS_MAP[app.status];
                      return (
                        <div
                          key={app.id}
                          className="p-4 rounded-xl bg-surface border border-border"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <Link
                                href={`/specialists/${app.specialistId}`}
                                className="font-medium text-sm text-primary hover:underline"
                              >
                                {app.specialistName}
                              </Link>
                              <span className={`ml-2 px-2 py-0.5 text-[10px] rounded-full font-medium ${st.color}`}>
                                {st.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted whitespace-nowrap">
                              {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                            </span>
                          </div>

                          {app.message && (
                            <p className="text-sm text-muted mb-3 whitespace-pre-line">
                              {app.message}
                            </p>
                          )}

                          {app.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateStatus(app.id, "accepted")}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-full hover:bg-success/20 transition-colors"
                              >
                                <CheckCircle2 size={12} /> Принять
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(app.id, "rejected")}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-danger/10 text-danger rounded-full hover:bg-danger/20 transition-colors"
                              >
                                <XCircle size={12} /> Отклонить
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────── */}
          <div className="space-y-6">
            {/* Apply section */}
            {isSpecialist && !myApplication && (
              <div className="p-6 rounded-2xl bg-card border border-primary/20 card-glow">
                <h3 className="font-semibold mb-3">Откликнуться</h3>
                <p className="text-sm text-muted mb-4">
                  Отправьте отклик — работодатель увидит ваш профиль и свяжется через систему сообщений.
                </p>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors"
                >
                  <MessageSquare size={16} /> Откликнуться
                </button>
                <p className="text-[10px] text-muted text-center mt-3">
                  Контактные данные скрыты до отклика
                </p>
              </div>
            )}

            {/* Already applied */}
            {isSpecialist && myApplication && (
              <div className="p-6 rounded-2xl bg-card border border-border card-glow">
                <h3 className="font-semibold mb-3">Вы уже откликнулись</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${APP_STATUS_MAP[myApplication.status].color}`}>
                    {APP_STATUS_MAP[myApplication.status].label}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Отклик отправлен{" "}
                  {new Date(myApplication.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            )}

            {/* Guest prompt */}
            {!isLoggedIn && (
              <div className="p-6 rounded-2xl bg-card border border-primary/20 card-glow">
                <h3 className="font-semibold mb-3">Откликнуться</h3>
                <p className="text-sm text-muted mb-4">
                  Войдите как специалист, чтобы отправить отклик на вакансию.
                </p>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors"
                >
                  Войти
                </Link>
              </div>
            )}

            {/* Company mini-card */}
            <div className="p-6 rounded-2xl bg-card border border-border card-glow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {isLoggedIn ? vacancy.companyName[0] : "?"}
                </div>
                <div>
                  {isLoggedIn ? (
                    <Link
                      href={`/companies/${vacancy.employerId}`}
                      className="font-medium text-sm hover:text-primary transition-colors"
                    >
                      {vacancy.companyName}
                    </Link>
                  ) : (
                    <span className="font-medium text-sm text-muted">Войдите для просмотра</span>
                  )}
                  {vacancy.isVerified && (
                    <span className="text-[10px] text-success flex items-center gap-1">
                      <CheckCircle2 size={10} /> Верифицирован
                    </span>
                  )}
                </div>
              </div>

              {employer && (
                <>
                  {employer.companyType && (
                    <p className="text-xs text-muted mb-1">{employer.companyType}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted mb-1">
                    <MapPin size={12} /> {employer.city}
                    {employer.district && `, ${employer.district}`}
                  </div>
                  {employer.rating !== undefined && employer.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Star size={12} className="text-primary" />
                      {employer.rating.toFixed(1)}
                      {employer.reviewCount !== undefined && (
                        <span className="text-muted/60">({employer.reviewCount})</span>
                      )}
                    </div>
                  )}
                </>
              )}

              {isLoggedIn && (
                <Link
                  href={`/companies/${vacancy.employerId}`}
                  className="text-xs text-primary mt-2 block hover:underline"
                >
                  Профиль компании →
                </Link>
              )}
            </div>

            {/* Certification bonus */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} className="text-primary" />
                <h4 className="text-sm font-medium">Бонус для сертифицированных</h4>
              </div>
              <p className="text-xs text-muted">
                Специалисты с сертификатом учебного центра получают приоритет при рассмотрении и
                рекомендованную надбавку +10 000 ₽.
              </p>
              <Link href="/training" className="text-xs text-primary hover:underline mt-2 block">
                Пройти обучение →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Apply Modal ───────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowApplyModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-card border border-border card-glow">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold mb-1">Откликнуться на вакансию</h3>
            <p className="text-sm text-muted mb-5">{vacancy.title}</p>

            <label className="block text-sm font-medium mb-2">Сопроводительное письмо</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              placeholder="Расскажите о себе и почему вы подходите на эту позицию…"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors resize-none"
            />

            <button
              onClick={handleApply}
              disabled={submitting || !coverLetter.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Отправка…" : "Отправить отклик"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
