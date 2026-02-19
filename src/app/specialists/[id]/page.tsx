"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Award, Briefcase, CheckCircle2, Heart,
  MapPin, MessageSquare, Phone, Mail, Star, Image as ImageIcon,
} from "lucide-react";
import { auth as authService, reviews as reviewService, type User, type Review } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  searching: { label: "Ищу работу",        color: "bg-success/10 text-success" },
  open:      { label: "Готов к подработке", color: "bg-warning/10 text-warning" },
  employed:  { label: "Занят",             color: "bg-primary/10 text-primary" },
};

export default function SpecialistDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user, isLoggedIn } = useAuth();

  const [specialist, setSpecialist] = useState<User | null>(null);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // favorite
  const [isFav, setIsFav] = useState(false);

  /* ── Load data ─────────────────────────── */
  useEffect(() => {
    const specs = authService.getUsersByRole("specialist");
    const found = specs.find((s) => s.id === id) ?? null;
    if (!found) {
      setNotFound(true);
    } else {
      setSpecialist(found);
      setReviewsList(reviewService.getByTarget(id));
      setIsFav(user?.favorites?.includes(id) ?? false);
    }
    setLoading(false);
  }, [id, user]);

  /* ── Handlers ──────────────────────────── */
  const handleToggleFavorite = () => {
    if (!user) return;
    authService.toggleFavorite(user.id, id);
    setIsFav((prev) => !prev);
  };

  const handleSubmitReview = () => {
    if (!user || !specialist || reviewRating === 0 || !reviewText.trim()) return;
    setSubmitting(true);
    reviewService.create({
      targetId: id,
      targetType: "specialist",
      authorId: user.id,
      authorName: user.name || user.companyName || "Аноним",
      rating: reviewRating,
      text: reviewText.trim(),
    });
    // reload
    setReviewsList(reviewService.getByTarget(id));
    const updated = authService.getUsersByRole("specialist").find((s) => s.id === id) ?? null;
    setSpecialist(updated);
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

  /* ── Loading / 404 ─────────────────────── */
  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p className="text-muted">Загрузка…</p>
      </div>
    );
  }

  if (notFound || !specialist) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Специалист не найден</h1>
          <p className="text-muted mb-6">
            Возможно, профиль был удалён или ссылка некорректна.
          </p>
          <Link
            href="/specialists"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={16} /> К списку специалистов
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[specialist.status ?? ""] ?? null;

  /* ── Render ────────────────────────────── */
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/specialists"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Назад к специалистам
        </Link>

        {/* ─── Profile Card ─────────────────── */}
        <div className="p-8 rounded-2xl bg-card border border-border card-glow mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center text-3xl font-bold text-primary shrink-0">
              {specialist.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold">{specialist.name}</h1>
                {specialist.isCertified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <CheckCircle2 size={12} /> ✓ Сертифицирован
                  </span>
                )}
              </div>

              {specialist.specialization && (
                <p className="text-primary/80 mb-2">{specialist.specialization}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {specialist.city}
                </span>
                {specialist.experience && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} /> {specialist.experience} опыта
                  </span>
                )}
                {renderStars(specialist.rating ?? 0)}
                {specialist.reviewCount != null && specialist.reviewCount > 0 && (
                  <span className="text-xs text-muted">
                    ({specialist.reviewCount}{" "}
                    {specialist.reviewCount === 1
                      ? "отзыв"
                      : specialist.reviewCount < 5
                        ? "отзыва"
                        : "отзывов"}
                    )
                  </span>
                )}
              </div>

              {/* Status */}
              {statusInfo && (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href={`/messages?to=${id}`}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm"
              >
                <MessageSquare size={16} /> Написать
              </Link>

              {isLoggedIn && user?.role === "employer" && (
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-colors border ${
                    isFav
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface border-border text-muted hover:text-primary hover:border-primary"
                  }`}
                >
                  <Heart size={16} className={isFav ? "fill-primary" : ""} />
                  {isFav ? "В избранном" : "В избранное"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Contact Info ─────────────────── */}
        <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
          <h2 className="font-semibold mb-4">Контактные данные</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-primary shrink-0" />
              {isLoggedIn ? (
                <span>{specialist.phone}</span>
              ) : (
                <span className="text-muted italic">
                  Войдите для просмотра
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-primary shrink-0" />
              <span>{specialist.email}</span>
            </div>
          </div>
        </div>

        {/* ─── Skills ───────────────────────── */}
        {specialist.skills && specialist.skills.length > 0 && (
          <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
            <h2 className="font-semibold mb-4">Навыки и компетенции</h2>
            <div className="flex flex-wrap gap-2">
              {specialist.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 rounded-full bg-surface border border-border text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Certification badge ──────────── */}
        {specialist.isCertified && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 card-glow mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Award size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">✓ Сертифицирован</h3>
                <p className="text-sm text-muted mb-2">
                  Специалист прошёл обучение и подтвердил квалификацию в учебном
                  центре Союза Детейлинга.
                </p>
                {specialist.certificateNumber && (
                  <p className="text-xs text-muted">
                    Сертификат №{specialist.certificateNumber}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted mt-1">
                  <CheckCircle2 size={12} className="text-primary" />
                  <span>Сертификат подтверждён</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Portfolio ────────────────────── */}
        {specialist.portfolio && specialist.portfolio.length > 0 && (
          <div className="p-6 rounded-2xl bg-card border border-border card-glow mb-6">
            <h2 className="font-semibold mb-4">Портфолио</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specialist.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border overflow-hidden bg-surface"
                >
                  {/* Image placeholder */}
                  <div className="w-full h-40 bg-card flex items-center justify-center text-muted">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon size={32} className="text-border" />
                        <span className="text-xs">Изображение</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
          (user.role === "employer" || user.role === "client") &&
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
                <label className="text-sm text-muted mb-2 block">
                  Ваш отзыв
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Расскажите о вашем опыте работы с этим специалистом…"
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
