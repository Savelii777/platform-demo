"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  Clock,
  Building2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { auth as authService, type User } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

export default function CompaniesPage() {
  const { user, isLoggedIn } = useAuth();

  /* ── Data ──────────────────────────────── */
  const [employers, setEmployers] = useState<User[]>([]);

  useEffect(() => {
    setEmployers(authService.getUsersByRole("employer"));
  }, []);

  /* ── Access: employers can't see other employer profiles ── */
  if (isLoggedIn && user?.role === "employer") {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto mb-4 text-muted/40" />
            <p className="text-muted text-lg">
              Каталог компаний недоступен для работодателей
            </p>
            <p className="text-muted/60 text-sm mt-1">
              Эта страница доступна клиентам и специалистам
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Filters ───────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Все города");
  const [selectedType, setSelectedType] = useState("Все типы");

  const cities = [
    "Все города",
    ...Array.from(new Set(employers.map((e) => e.city).filter(Boolean))),
  ];

  const companyTypes = [
    "Все типы",
    ...Array.from(
      new Set(employers.map((e) => e.companyType).filter(Boolean))
    ),
  ];

  const filtered = employers.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (e.companyName ?? "").toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      (e.services ?? []).some((s) => s.toLowerCase().includes(q));
    const matchesCity = selectedCity === "Все города" || e.city === selectedCity;
    const matchesType =
      selectedType === "Все типы" || e.companyType === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  /* ── Rating stars helper ───────────────── */
  const renderStars = (rating: number = 0, reviewCount: number = 0) => {
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
        <span className="ml-1 text-xs text-muted">
          {rating.toFixed(1)}
          {reviewCount > 0 && ` (${reviewCount})`}
        </span>
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
            Каталог компаний
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
            Автомойки и студии
          </h1>
          <p className="text-muted max-w-2xl">
            Найдите проверенную автомойку или детейлинг-студию рядом с вами.
            Контакты, услуги, рейтинг и отзывы.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Поиск по названию, городу, услугам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>

          {/* City filter */}
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

          {/* Company type filter */}
          <div className="relative">
            <Filter
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-11 pr-10 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm appearance-none min-w-[180px]"
            >
              {companyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
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
          компаний
        </p>

        {/* Company Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company) => {
            const services = company.services ?? [];
            const visibleServices = services.slice(0, 3);
            const extraCount = services.length - 3;

            return (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="group relative flex flex-col p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
              >
                {/* Avatar + Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                    {(company.companyName ?? company.name)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {company.companyName ?? company.name}
                    </h3>
                    {company.companyType && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
                        {company.companyType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Location + Working Hours */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {company.city}
                    {company.district && `, ${company.district}`}
                  </span>
                  {company.workingHours && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {company.workingHours}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="mb-3">
                  {renderStars(company.rating, company.reviewCount)}
                </div>

                {/* Services chips */}
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visibleServices.map((service) => (
                      <span
                        key={service}
                        className="px-2.5 py-1 text-xs bg-surface border border-border rounded-full text-muted"
                      >
                        {service}
                      </span>
                    ))}
                    {extraCount > 0 && (
                      <span className="px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium">
                        +{extraCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {company.description && (
                  <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
                    {company.description}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-border">
                  {isLoggedIn &&
                  (user?.role === "client" || user?.role === "specialist") ? (
                    <span className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs bg-primary text-white rounded-full font-medium group-hover:bg-primary-hover transition-colors">
                      Подробнее <ArrowRight size={14} />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs border border-border text-muted rounded-full">
                      <Building2 size={14} /> Просмотр профиля
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto mb-4 text-muted/40" />
            <p className="text-muted text-lg">Компании не найдены</p>
            <p className="text-muted/60 text-sm mt-1">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
