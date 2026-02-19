"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, MapPin, Star, ChevronDown, MessageSquare,
  User as UserIcon, Heart, Briefcase, CheckCircle2, Zap,
} from "lucide-react";
import { auth as authService, type User } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  searching: { label: "Ищу работу",        color: "bg-success/10 text-success" },
  open:      { label: "Готов к подработке", color: "bg-warning/10 text-warning" },
  employed:  { label: "Занят",             color: "bg-primary/10 text-primary" },
};

export default function SpecialistsPage() {
  const { user, isLoggedIn } = useAuth();

  /* ── Data ──────────────────────────────── */
  const [specialists, setSpecialists] = useState<User[]>([]);

  useEffect(() => {
    setSpecialists(authService.getUsersByRole("specialist"));
  }, []);

  /* ── Filters ───────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Все города");

  const cities = [
    "Все города",
    ...Array.from(new Set(specialists.map((s) => s.city).filter(Boolean))),
  ];

  const filtered = specialists.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(q) ||
      (s.specialization ?? "").toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q);
    const matchesCity = selectedCity === "Все города" || s.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  /* ── Favorites ─────────────────────────── */
  const isFavorite = (specId: string) =>
    user?.favorites?.includes(specId) ?? false;

  const handleToggleFavorite = (specId: string) => {
    if (!user) return;
    authService.toggleFavorite(user.id, specId);
    setSpecialists([...specialists]); // force re-render
  };

  /* ── Rating stars helper ───────────────── */
  const renderStars = (rating: number = 0) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={13}
            className={
              i < full
                ? "text-primary fill-primary"
                : i === full && hasHalf
                  ? "text-primary fill-primary/50"
                  : "text-border"
            }
          />
        ))}
        <span className="ml-1 text-xs text-muted">{rating.toFixed(1)}</span>
      </span>
    );
  };

  /* ── Render ────────────────────────────── */
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Кадровая база
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
            Специалисты
          </h1>
          <p className="text-muted max-w-2xl">
            Верифицированные специалисты автомоек и детейлинга. Мастера с опытом
            и сертификатами.
          </p>
        </div>

        {/* Search & City filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Поиск по имени, специализации, городу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-11 pr-10 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm appearance-none min-w-[180px]"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
          </div>
        </div>

        <p className="text-sm text-muted mb-6">
          Найдено:{" "}
          <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          специалистов
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((spec) => {
            const statusInfo =
              STATUS_MAP[spec.status ?? "employed"] ?? STATUS_MAP.employed;
            return (
              <div
                key={spec.id}
                className="group relative flex flex-col p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
              >
                {/* Favorite heart — top-right (employer only) */}
                {isLoggedIn && user?.role === "employer" && (
                  <button
                    onClick={() => handleToggleFavorite(spec.id)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface transition-colors"
                    title="В избранное"
                  >
                    <Heart
                      size={18}
                      className={
                        isFavorite(spec.id)
                          ? "text-primary fill-primary"
                          : "text-muted"
                      }
                    />
                  </button>
                )}

                {/* Avatar + Name + Specialization */}
                <Link href={`/specialists/${spec.id}`} className="block">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                      {spec.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {spec.name}
                        </h3>
                        {spec.isCertified && (
                          <span
                            className="shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium"
                            title="Сертифицирован"
                          >
                            <CheckCircle2 size={11} /> Сертифицирован
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary/80 truncate">
                        {spec.specialization ?? "Специалист"}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Meta: city, experience, rating stars */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {spec.city}
                  </span>
                  {spec.experience && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> {spec.experience}
                    </span>
                  )}
                  {renderStars(spec.rating)}
                </div>

                {/* Skills chips */}
                {spec.skills && spec.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {spec.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs bg-surface border border-border rounded-full text-muted"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contacts — hidden for guests */}
                {!isLoggedIn && (
                  <p className="text-xs text-muted italic mb-4 px-3 py-2 bg-surface rounded-lg border border-border text-center">
                    🔒 Войдите для просмотра контактов
                  </p>
                )}
                {isLoggedIn && (
                  <p className="text-xs text-muted mb-4">
                    📞 {spec.phone} &nbsp;·&nbsp; ✉ {spec.email}
                  </p>
                )}

                {/* Footer: status + badges + action buttons */}
                <div className="mt-auto pt-4 border-t border-border space-y-3">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                    {spec.availableForGigs && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 flex items-center gap-1">
                        <Zap size={11} /> Подработки
                      </span>
                    )}
                  </div>

                  {/* Action buttons (employer only) */}
                  {isLoggedIn && user?.role === "employer" && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/messages?to=${spec.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs bg-primary text-white rounded-full hover:bg-primary-hover transition-colors font-medium"
                      >
                        <MessageSquare size={12} /> Написать
                      </Link>
                      <button
                        onClick={() => handleToggleFavorite(spec.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs rounded-full border font-medium transition-colors ${
                          isFavorite(spec.id)
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted hover:border-primary hover:text-primary"
                        }`}
                      >
                        <Heart size={12} />
                        {isFavorite(spec.id) ? "В избранном" : "В избранное"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <UserIcon size={48} className="mx-auto mb-4 text-muted/40" />
            <p className="text-muted text-lg">Специалисты не найдены</p>
            <p className="text-muted/60 text-sm mt-1">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
