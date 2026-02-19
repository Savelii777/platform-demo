"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Flame,
  CheckCircle2,
  ChevronDown,
  X,
  Plus,
} from "lucide-react";
import { vacancies as vacancyService, type Vacancy } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

/* ── helpers ─────────────────────────────── */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

/* ── main page ───────────────────────────── */

export default function VacanciesPage() {
  const { user, isLoggedIn } = useAuth();

  /* state */
  const [allVacancies, setAllVacancies] = useState<Vacancy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Все города");

  /* modals */
  const [applyVacancyId, setApplyVacancyId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  /* create‑form state */
  const [newTitle, setNewTitle] = useState("");
  const [newCity, setNewCity] = useState("Москва");
  const [newDistrict, setNewDistrict] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newSchedule, setNewSchedule] = useState("5/2");
  const [newExperience, setNewExperience] = useState("Без опыта");
  const [newDescription, setNewDescription] = useState("");
  const [newRequirements, setNewRequirements] = useState("");
  const [newIsHot, setNewIsHot] = useState(false);

  /* load on mount */
  useEffect(() => {
    setAllVacancies(vacancyService.getAll());
  }, []);

  /* toast auto‑hide */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* filter */
  const filteredVacancies = allVacancies.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      v.title.toLowerCase().includes(q) ||
      v.companyName.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q);
    const matchesCity = selectedCity === "Все города" || v.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  /* actions */
  function handleApply() {
    if (!user || !applyVacancyId) return;
    try {
      vacancyService.apply(applyVacancyId, user.id, user.name, applyMessage);
      setToast("Отклик отправлен!");
      setApplyVacancyId(null);
      setApplyMessage("");
      setAllVacancies(vacancyService.getAll());
    } catch (e: unknown) {
      setToast((e as Error).message);
    }
  }

  function handleCreate() {
    if (!user) return;
    try {
      vacancyService.create({
        employerId: user.id,
        companyName: user.companyName || user.name,
        title: newTitle,
        city: newCity,
        district: newDistrict,
        salary: newSalary,
        schedule: newSchedule,
        experience: newExperience,
        description: newDescription,
        requirements: newRequirements
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        isHot: newIsHot,
      });
      setToast("Вакансия создана!");
      setShowCreateModal(false);
      resetCreateForm();
      setAllVacancies(vacancyService.getAll());
    } catch (e: unknown) {
      setToast((e as Error).message);
    }
  }

  function resetCreateForm() {
    setNewTitle("");
    setNewCity("Москва");
    setNewDistrict("");
    setNewSalary("");
    setNewSchedule("5/2");
    setNewExperience("Без опыта");
    setNewDescription("");
    setNewRequirements("");
    setNewIsHot(false);
  }

  /* ── render ────────────────────────────── */
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Рынок труда
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">Вакансии</h1>
            <p className="text-muted max-w-2xl">
              Найдите работу в сфере детейлинга и автомоек. Все вакансии от
              верифицированных работодателей.
            </p>
          </div>

          {isLoggedIn && user?.role === "employer" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors shrink-0"
            >
              <Plus size={18} />
              Создать вакансию
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Поиск по должности, компании, городу..."
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
                className="pl-11 pr-10 py-3.5 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm appearance-none cursor-pointer min-w-[180px]"
              >
                <option>Все города</option>
                <option>Москва</option>
                <option>Санкт-Петербург</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted">
            Найдено:{" "}
            <span className="text-foreground font-medium">
              {filteredVacancies.length}
            </span>{" "}
            вакансий
          </p>
        </div>

        {/* Vacancy cards */}
        <div className="space-y-4">
          {filteredVacancies.length === 0 && (
            <div className="text-center py-16 text-muted">
              Вакансий не найдено
            </div>
          )}

          {filteredVacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  {/* badges */}
                  <div className="flex items-center gap-2 mb-2">
                    {vacancy.isHot && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-medium">
                        <Flame size={12} /> Горячая
                      </span>
                    )}
                    {vacancy.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                        <CheckCircle2 size={12} /> Верифицирован
                      </span>
                    )}
                  </div>

                  {/* title */}
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">
                    {vacancy.title}
                  </h3>

                  {/* company — hidden for guests */}
                  <p className="text-sm text-primary/80 font-medium mb-3">
                    {isLoggedIn
                      ? vacancy.companyName
                      : "Войдите чтобы увидеть"}
                  </p>

                  {/* meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {vacancy.city}
                      {vacancy.district ? `, ${vacancy.district}` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {vacancy.schedule}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} /> {vacancy.experience}
                    </span>
                  </div>
                </div>

                {/* right column */}
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-primary mb-1">
                    {vacancy.salary}
                  </div>
                  <div className="text-xs text-muted">
                    {formatDate(vacancy.createdAt)}
                  </div>

                  {isLoggedIn && user?.role === "specialist" && (
                    <button
                      onClick={() => setApplyVacancyId(vacancy.id)}
                      className="mt-4 px-5 py-2 text-sm bg-primary text-white rounded-full hover:bg-primary-hover transition-colors font-medium"
                    >
                      Откликнуться
                    </button>
                  )}
                </div>
              </div>

              {/* requirements tags */}
              {vacancy.requirements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-2">
                    {vacancy.requirements.map((req) => (
                      <span
                        key={req}
                        className="px-3 py-1 text-xs bg-surface border border-border rounded-full text-muted"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA bottom */}
        <div className="mt-12 p-8 rounded-2xl bg-card border border-primary/20 text-center card-glow">
          <h3 className="text-xl font-semibold mb-2">
            Не нашли подходящую вакансию?
          </h3>
          <p className="text-muted text-sm mb-6">
            Разместите своё резюме, и работодатели сами найдут вас
          </p>
          <button className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors">
            Разместить резюме
          </button>
        </div>
      </div>

      {/* ── Apply modal ──────────────────── */}
      {applyVacancyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 relative">
            <button
              onClick={() => {
                setApplyVacancyId(null);
                setApplyMessage("");
              }}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">Откликнуться на вакансию</h2>

            <textarea
              rows={5}
              placeholder="Сопроводительное сообщение..."
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none mb-4"
            />

            <button
              onClick={handleApply}
              disabled={!applyMessage.trim()}
              className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Отправить отклик
            </button>
          </div>
        </div>
      )}

      {/* ── Create vacancy modal ─────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 relative my-8">
            <button
              onClick={() => {
                setShowCreateModal(false);
                resetCreateForm();
              }}
              className="absolute top-4 right-4 text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-6">Создать вакансию</h2>

            <div className="space-y-4">
              {/* title */}
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Должность *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Детейлер‑полировщик"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* city + district */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">Город</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary appearance-none"
                  >
                    <option>Москва</option>
                    <option>Санкт-Петербург</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Район</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="ЦАО"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* salary */}
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Зарплата *
                </label>
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="от 80 000 ₽"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* schedule + experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted mb-1 block">
                    График
                  </label>
                  <select
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary appearance-none"
                  >
                    <option>5/2</option>
                    <option>2/2</option>
                    <option>Свободный</option>
                    <option>Вахта</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">
                    Опыт
                  </label>
                  <select
                    value={newExperience}
                    onChange={(e) => setNewExperience(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary appearance-none"
                  >
                    <option>Без опыта</option>
                    <option>от 1 года</option>
                    <option>от 3 лет</option>
                    <option>от 5 лет</option>
                  </select>
                </div>
              </div>

              {/* description */}
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Описание
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Обязанности, условия..."
                  className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* requirements */}
              <div>
                <label className="text-xs text-muted mb-1 block">
                  Требования (через запятую)
                </label>
                <input
                  type="text"
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="Полировка, Керамика, Оклейка"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* isHot */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsHot}
                  onChange={(e) => setNewIsHot(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm">Горячая вакансия 🔥</span>
              </label>

              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newSalary.trim()}
                className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-primary text-white rounded-full text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
