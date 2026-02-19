"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  ShieldX,
} from "lucide-react";
import {
  auth as authService,
  vacancies as vacancyService,
  reviews as reviewService,
  type User,
  type Vacancy,
  type Review,
} from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

export default function CompanyPage() {
  const params = useParams();
  const id = params.id as string;

  const { user, isLoggedIn } = useAuth();

  const [employer, setEmployer] = useState<User | null>(null);
  const [companyVacancies, setCompanyVacancies] = useState<Vacancy[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── Load data ─────────────────────────── */
  useEffect(() => {
    const employers = authService.getUsersByRole("employer");
    const found = employers.find((e) => e.id === id) ?? null;
    if (!found) {
      setNotFound(true);
    } else {
      setEmployer(found);
      setCompanyVacancies(vacancyService.getByEmployer(id).filter((v) => v.status === "active"));
      setReviewsList(reviewService.getByTarget(id));
    }
    setLoading(false);
  }, [id]);

  /* ── Handlers ──────────────────────────── */
  const handleSubmitReview = () => {
    if (!user || !employer || reviewRating === 0 || !reviewText.trim()) return;
    setSubmitting(true);
    reviewService.create({
      targetId: id,
      targetType: "company",
      authorId: user.id,
      authorName: user.name || user.companyName || "Аноним",
      rating: reviewRating,
      text: reviewText.trim(),
    });
    // reload
    setReviewsList(reviewService.getByTarget(id));
    const updated = authService.getUsersByRole("employer").find((e) => e.id === id) ?? null;
    setEmployer(updated);
    setReviewRating(0);
    setReviewText("");
    setSubmitting(false);
  };

  /* ── Stars helper ──────────────────────── */
  const renderStars = (rating: number = 0) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < full
                ? "text-primary fill-primary"
                : i === full && hasHalf
                  ? "text-primary fill-primary/50"
                  : "text-border"
            }
          />
        ))}
        <span className="ml-1 text-sm text-muted">{rating.toFixed(1)}</span>
      </span>
    );
  };

  /* ── Loading ───────────────────────────── */
  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p className="text-muted">Загрузка…</p>
      </div>
    );
  }

  /* ── 404 ───────────────────────────────── */
  if (notFound || !employer) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Компания не найдена</h1>
          <p className="text-muted mb-6">
            Возможно, профиль был удалён или ссылка некорректна.
          </p>
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={16} /> К списку компаний
          </Link>
        </div>
      </div>
    );
  }

  /* ── Access denied for employers viewing other employers ── */
  if (isLoggedIn && user?.role === "employer" && user.id !== id) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <ShieldX size={64} className="mx-auto text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-4">Доступ запрещён</h1>
          <p className="text-muted mb-6">
            Работодатели не могут просматривать профили других компаний.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={16} /> В личный кабинет
          </Link>
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────── */
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Назад к списку компаний
        </Link>

        {/* ─── Company Header ───────────────── */}
        <div className="p-8 rounded-2xl bg-card border border-border card-glow mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold shrink-0">
              {(employer.companyName || employer.name)[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold">
                  {employer.companyName || employer.name}
                </h1>
                {employer.isVerified && (
                  <CheckCircle2 size={20} className="text-primary" />
                )}
              </div>

              {employer.companyType && (
                <p className="text-sm text-primary/80 mb-2">{employer.companyType}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />{" "}
                  {[employer.city, employer.district, employer.address]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                {employer.workingHours && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {employer.workingHours}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-3">
                {renderStars(employer.rating ?? 0)}
                {(employer.reviewCount ?? 0) > 0 && (
                  <span className="text-xs text-muted">
                    ({employer.reviewCount}{" "}
                    {employer.reviewCount === 1
                      ? "отзыв"
                      : (employer.reviewCount ?? 0) < 5
                        ? "отзыва"
                        : "отзывов"}
                    )
                  </span>
                )}
              </div>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Phone size={14} className="text-primary" /> {employer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={14} className="text-primary" /> {employer.email}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={`tel:${employer.phone}`}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm"
              >
                <Phone size={16} /> Позвонить
              </a>
              {isLoggedIn && user && (user.role === "client" || user.role === "specialist") && (
                <Link
                  href={`/messages?to=${id}`}
                  className="flex items-center gap-2 px-6 py-3 border border-border text-muted rounded-full hover:border-primary/50 hover:text-primary transition-colors text-sm"
                >
                  <MessageSquare size={16} /> Написать
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ─── Description ──────────────────── */}
        {employer.description && (
          <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
            <h2 className="font-semibold mb-4">О компании</h2>
            <p className="text-sm text-muted leading-relaxed">{employer.description}</p>
          </div>
        )}

        {/* ─── Services ─────────────────────── */}
        {employer.services && employer.services.length > 0 && (
          <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
            <h2 className="font-semibold mb-4">Услуги</h2>
            <div className="flex flex-wrap gap-2">
              {employer.services.map((service) => (
                <span
                  key={service}
                  className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Active Vacancies ──────────────── */}
        <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              Вакансии{" "}
              {companyVacancies.length > 0 && (
                <span className="text-muted font-normal text-sm">
                  ({companyVacancies.length})
                </span>
              )}
            </h2>
            <Link href="/vacancies" className="text-sm text-primary hover:underline">
              Все вакансии →
            </Link>
          </div>

          {companyVacancies.length === 0 ? (
            <p className="text-sm text-muted">Активных вакансий нет.</p>
          ) : (
            <div className="space-y-3">
              {companyVacancies.map((v) => (
                <Link
                  key={v.id}
                  href={`/vacancies/${v.id}`}
                  className="block p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium mb-1">{v.title}</h4>
                      <p className="text-xs text-muted">
                        {v.salary} · {v.schedule}
                      </p>
                    </div>
                    <span className="text-xs text-muted flex items-center gap-1 shrink-0">
                      <MapPin size={12} /> {v.city}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ─── Reviews ──────────────────────── */}
        <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
          <h2 className="font-semibold mb-4">
            Отзывы{" "}
            {reviewsList.length > 0 && (
              <span className="text-muted font-normal text-sm">
                ({reviewsList.length})
              </span>
            )}
          </h2>

          {reviewsList.length === 0 ? (
            <p className="text-sm text-muted">Отзывов пока нет.</p>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-surface border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{rev.authorName}</span>
                    <span className="text-xs text-muted">
                      {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="mb-2">{renderStars(rev.rating)}</div>
                  <p className="text-sm text-muted">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Leave Review Form ────────────── */}
        {isLoggedIn &&
          user &&
          (user.role === "client" || user.role === "specialist") &&
          user.id !== id && (
            <div className="p-6 rounded-2xl bg-card border border-border card-glow">
              <h2 className="font-semibold mb-4">Оставить отзыв</h2>

              {/* Star rating picker */}
              <div className="mb-4">
                <label className="text-sm text-muted mb-2 block">Оценка</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const starVal = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(starVal)}
                        onMouseEnter={() => setReviewHover(starVal)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={
                            starVal <= (reviewHover || reviewRating)
                              ? "text-primary fill-primary"
                              : "text-border"
                          }
                        />
                      </button>
                    );
                  })}
                  {reviewRating > 0 && (
                    <span className="ml-2 text-sm text-muted">{reviewRating}/5</span>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="mb-4">
                <label className="text-sm text-muted mb-2 block">Ваш отзыв</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Расскажите о вашем опыте работы с этой компанией…"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submitting || reviewRating === 0 || !reviewText.trim()}
                className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Отправить отзыв
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
