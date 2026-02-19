"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { training as trainingService, type TrainingEnrollment } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

/* ── Hardcoded course catalog ── */
interface Course {
  name: string;
  description: string;
  duration: string;
  price: string;
  level: "beginner" | "advanced" | "expert";
}

const COURSES: Course[] = [
  {
    name: "Базовый курс детейлинга",
    description:
      "Фундамент профессии: мойка, деконтаминация, подготовка поверхности, азы полировки и защитных покрытий.",
    duration: "2 недели",
    price: "15 000 ₽",
    level: "beginner",
  },
  {
    name: "Продвинутая полировка",
    description:
      "Глубокая коррекция ЛКП, работа с толщиномером, многоступенчатая полировка и удаление серьёзных дефектов.",
    duration: "3 недели",
    price: "25 000 ₽",
    level: "advanced",
  },
  {
    name: "Керамическое покрытие",
    description:
      "Нанесение профессиональных керамических составов, подготовка, инфракрасная сушка, гарантийное обслуживание.",
    duration: "1 неделя",
    price: "20 000 ₽",
    level: "advanced",
  },
  {
    name: "Управление автомойкой",
    description:
      "Бизнес-процессы, подбор персонала, закупки, маркетинг, финансовое планирование и масштабирование детейлинг-студии.",
    duration: "4 недели",
    price: "45 000 ₽",
    level: "expert",
  },
];

const LEVEL_LABELS: Record<Course["level"], string> = {
  beginner: "Начинающий",
  advanced: "Продвинутый",
  expert: "Эксперт",
};

const STATUS_LABELS: Record<TrainingEnrollment["status"], string> = {
  enrolled: "Записан",
  inProgress: "В процессе",
  completed: "Завершён",
};

type Tab = "courses" | "graduates" | "verify";

export default function TrainingPage() {
  const { user, isLoggedIn } = useAuth();

  const [tab, setTab] = useState<Tab>("courses");

  /* ── Courses tab state ── */
  const [myEnrollments, setMyEnrollments] = useState<TrainingEnrollment[]>([]);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  /* ── Graduates tab state ── */
  const [graduates, setGraduates] = useState<TrainingEnrollment[]>([]);
  const [gradSearch, setGradSearch] = useState("");

  /* ── Verify tab state ── */
  const [certInput, setCertInput] = useState("");
  const [verifyResult, setVerifyResult] = useState<TrainingEnrollment | null | undefined>(undefined);

  /* Load enrollments for current user */
  useEffect(() => {
    if (user) {
      setMyEnrollments(trainingService.getEnrollments(user.id));
    } else {
      setMyEnrollments([]);
    }
  }, [user]);

  /* Load graduates when tab opens */
  useEffect(() => {
    if (tab === "graduates") {
      setGraduates(trainingService.getAllGraduates());
    }
  }, [tab]);

  /* ── Handlers ── */
  function handleEnroll(courseName: string) {
    if (!user) return;
    setEnrollError(null);
    try {
      trainingService.enroll(user.id, user.name, courseName);
      setMyEnrollments(trainingService.getEnrollments(user.id));
    } catch (err: unknown) {
      setEnrollError(err instanceof Error ? err.message : "Ошибка записи");
    }
  }

  function handleVerify() {
    const trimmed = certInput.trim();
    if (!trimmed) return;
    const result = trainingService.verifyCertificate(trimmed);
    setVerifyResult(result);
  }

  /* ── Filtered graduates ── */
  const filteredGrads = graduates.filter((g) => {
    const q = gradSearch.toLowerCase();
    return (
      g.userName.toLowerCase().includes(q) ||
      g.course.toLowerCase().includes(q)
    );
  });

  /* ── Helpers ── */
  function enrollmentFor(courseName: string): TrainingEnrollment | undefined {
    return myEnrollments.find((e) => e.course === courseName);
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Образование
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
            Учебный центр
          </h1>
          <p className="text-muted max-w-2xl">
            Профессиональное обучение детейлингу. Сертифицированные курсы от
            лучших мастеров индустрии.
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([
            { key: "courses" as Tab, label: "Обучение", icon: <BookOpen size={16} /> },
            { key: "graduates" as Tab, label: "Выпускники", icon: <Award size={16} /> },
            { key: "verify" as Tab, label: "Проверка сертификата", icon: <ShieldCheck size={16} /> },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm rounded-xl border transition-all ${
                tab === t.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted hover:border-primary/30"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            TAB 1 — Обучение
        ═══════════════════════════════════════ */}
        {tab === "courses" && (
          <>
            {/* Hero banner */}
            <div className="p-8 sm:p-12 rounded-2xl bg-card border border-primary/20 mb-10 relative overflow-hidden card-glow">
              <div className="absolute inset-0 hero-gradient" />
              <div className="relative max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Станьте сертифицированным мастером
                </h2>
                <p className="text-muted leading-relaxed mb-6">
                  Наши курсы разработаны совместно с ведущими детейлинг-студиями.
                  Практическое обучение на реальных автомобилях, современное
                  оборудование и сертификат, признаваемый работодателями на
                  платформе.
                </p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-primary" /> 4 направления
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary" /> Практика на реальных авто
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={18} className="text-primary" /> Сертификат платформы
                  </div>
                </div>
              </div>
            </div>

            {enrollError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {enrollError}
              </div>
            )}

            {/* Courses grid */}
            <h3 className="text-xl font-bold mb-6">Доступные курсы</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {COURSES.map((course) => {
                const enrollment = enrollmentFor(course.name);
                return (
                  <div
                    key={course.name}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen size={24} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {course.name}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-xs text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {course.duration}
                          </span>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {LEVEL_LABELS[course.level]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-lg font-bold text-primary">
                        {course.price}
                      </span>

                      {enrollment ? (
                        <span
                          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full ${
                            enrollment.status === "completed"
                              ? "bg-green-500/10 text-green-400"
                              : enrollment.status === "inProgress"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {enrollment.status === "completed" && <CheckCircle2 size={14} />}
                          {STATUS_LABELS[enrollment.status]}
                        </span>
                      ) : isLoggedIn && user?.role === "specialist" ? (
                        <button
                          onClick={() => handleEnroll(course.name)}
                          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
                        >
                          Записаться <ArrowRight size={14} />
                        </button>
                      ) : (
                        <span className="text-xs text-muted italic">
                          {isLoggedIn ? "Только для специалистов" : "Войдите как специалист"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <Award size={24} />,
                  title: "Сертификат",
                  desc: "Признаваемый работодателями на платформе",
                },
                {
                  icon: <Star size={24} />,
                  title: "Практика",
                  desc: "Обучение на реальных автомобилях клиентов",
                },
                {
                  icon: <Users size={24} />,
                  title: "Трудоустройство",
                  desc: "Помощь в поиске работы после выпуска",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-card border border-border text-center card-glow"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════
            TAB 2 — Выпускники
        ═══════════════════════════════════════ */}
        {tab === "graduates" && (
          <>
            {/* Search */}
            <div className="relative max-w-lg mb-6">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Поиск по имени или курсу..."
                value={gradSearch}
                onChange={(e) => setGradSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <p className="text-sm text-muted mb-6">
              Найдено:{" "}
              <span className="text-foreground font-medium">
                {filteredGrads.length}
              </span>{" "}
              выпускников
            </p>

            {filteredGrads.length === 0 ? (
              <div className="text-center py-20 text-muted">
                <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
                <p>Выпускников пока нет</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGrads.map((grad) => (
                  <div
                    key={grad.id}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-glow card-glow-hover"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center text-lg font-bold text-primary">
                        {grad.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {grad.userName}
                        </h4>
                        <span className="text-xs text-muted">{grad.course}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted mb-3">
                      <Award size={14} className="text-primary" />
                      <span>Сертификат #{grad.certificateNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted mb-4">
                      <GraduationCap size={14} className="text-primary" />
                      <span>
                        Выпуск:{" "}
                        {grad.completedAt
                          ? new Date(grad.completedAt).toLocaleDateString("ru-RU")
                          : "—"}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center gap-1.5 text-xs text-green-400">
                      <CheckCircle2 size={14} />
                      Сертификат подтверждён
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════
            TAB 3 — Проверка сертификата
        ═══════════════════════════════════════ */}
        {tab === "verify" && (
          <div className="max-w-xl mx-auto">
            <div className="p-8 rounded-2xl bg-card border border-border text-center card-glow">
              <ShieldCheck size={48} className="mx-auto text-primary mb-6" />
              <h2 className="text-xl font-bold mb-2">Проверка сертификата</h2>
              <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                Введите номер сертификата, чтобы подтвердить его подлинность и
                узнать данные выпускника.
              </p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Например: UC-2026-001"
                  value={certInput}
                  onChange={(e) => {
                    setCertInput(e.target.value);
                    setVerifyResult(undefined);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleVerify}
                  className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors text-sm"
                >
                  Проверить
                </button>
              </div>

              {/* Result */}
              {verifyResult !== undefined && (
                <>
                  {verifyResult ? (
                    <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/30 text-left">
                      <div className="flex items-center gap-2 text-green-400 font-semibold mb-4">
                        <CheckCircle2 size={20} />
                        Сертификат действителен
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted">Владелец</span>
                          <span className="font-medium">{verifyResult.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Курс</span>
                          <span className="font-medium">{verifyResult.course}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Номер</span>
                          <span className="font-medium">{verifyResult.certificateNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Дата выпуска</span>
                          <span className="font-medium">
                            {verifyResult.completedAt
                              ? new Date(verifyResult.completedAt).toLocaleDateString("ru-RU")
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center justify-center gap-2 text-red-400 font-semibold">
                        <XCircle size={20} />
                        Сертификат не найден
                      </div>
                      <p className="text-sm text-muted mt-2">
                        Проверьте правильность номера и попробуйте снова.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
