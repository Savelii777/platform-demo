"use client";

import Link from "next/link";
import {
  ArrowRight, Briefcase, Users, ShoppingCart, GraduationCap,
  MessageSquare, Tag, Shield, Zap, Building2, UserCheck,
  Package, Car, ChevronDown, Award, TrendingUp, Clock
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";

const STATS = [
  { value: 12000, suffix: "+", label: "Специалистов" },
  { value: 850, suffix: "+", label: "Компаний" },
  { value: 48, suffix: "", label: "Городов" },
  { value: 35000, suffix: "+", label: "Клиентов" },
];

const TOTAL_FRAMES = 61;
const FRAME_PATH = (i: number) => `/hero-frames/frame-${String(i).padStart(3, "0")}.jpg`;

/* ── Scroll reveal ── */
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(32px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.unobserve(el); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!go) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 2000, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [go, to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════
   Page
   ══════════════════════════════════════════ */
export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  // Preload all frames
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    let loaded = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loaded++;
        if (loaded === 1) drawFrame(0); // draw first frame immediately
      };
      imgs.push(img);
    }
    framesRef.current = imgs;
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = framesRef.current[index];
    if (!canvas || !ctx || !img || !img.complete) return;
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.drawImage(img, 0, 0);
  }, []);

  // Scroll-driven frame sequence
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let raf = 0;

    const onScroll = () => {
      const r = hero.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / (hero.offsetHeight - window.innerHeight)));
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => drawFrame(frameIndex));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [drawFrame]);

  return (
    <div>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[200vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/70" />
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />

          <div className="relative h-full flex flex-col justify-end max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
            <div className="max-w-2xl">
              <p className="text-xs text-primary uppercase tracking-[0.3em] font-semibold mb-5" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)", transition: "all 0.6s ease 0.2s" }}>
                Платформа для индустрии
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.92] mb-6 tracking-tight">
                {["Объединяем", <><span className="text-gradient">автомойки</span></>, <><span className="text-gradient">и детейлинг</span></>].map((line, i) => (
                  <span key={i} className="block overflow-hidden">
                    <span className="block" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(100%)", transition: `all 0.8s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.1}s` }}>
                      {line}
                    </span>
                  </span>
                ))}
              </h1>

              <p className="text-white/40 max-w-md mb-8 leading-relaxed" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.7s" }}>
                Вакансии, заказы, закупки и профессиональное сообщество — всё в одном месте для работодателей, специалистов, клиентов и поставщиков.
              </p>

              <div className="flex flex-wrap gap-3" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(12px)", transition: "all 0.6s ease 0.85s" }}>
                <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary rounded-full text-white font-semibold hover:bg-primary-hover transition-colors">
                  Присоединиться <ArrowRight size={18} />
                </Link>
                <Link href="/vacancies" className="inline-flex items-center gap-2 px-8 py-3.5 border border-border rounded-full text-white/50 hover:text-white hover:border-white/20 transition-all">
                  Вакансии
                </Link>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s 1.5s" }}>
              <ChevronDown size={16} className="text-white/15 animate-bounce" style={{ animationDuration: "2.5s" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-muted uppercase tracking-widest mt-2">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">О платформе</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6 leading-tight">
                Экосистема для всей индустрии
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-white/40 leading-relaxed mb-8">
                Социальная сеть, которая объединяет всех участников отрасли автомоек и детейлинга.
                Найм персонала, размещение заказов, совместные закупки у производителей
                и профессиональное обучение с сертификацией.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap justify-center gap-2">
                {["Верификация по ИНН", "Антидемпинг", "Сертификация", "Безопасная связь"].map(t => (
                  <span key={t} className="px-4 py-1.5 rounded-full border border-border text-xs text-muted">{t}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">Для кого</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">Четыре роли — одна платформа</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Building2 size={22} />, title: "Работодатели", desc: "Вакансии, управление персоналом, закупки, директорский чат", features: ["Публикация вакансий", "Приём заказов", "Совместные закупки", "Акции для клиентов"], href: "/register?role=employer" },
              { icon: <UserCheck size={22} />, title: "Специалисты", desc: "Поиск работы, обучение, сертификация, сообщество", features: ["Вакансии и подработки", "Учебный центр", "Портфолио работ", "Профессиональные чаты"], href: "/register?role=specialist" },
              { icon: <Car size={22} />, title: "Клиенты", desc: "Поиск автомоек, заказы, промокоды, Q&A", features: ["Поиск по геолокации", "Размещение заявок", "Промокоды и акции", "Вопросы экспертам"], href: "/register?role=client" },
              { icon: <Package size={22} />, title: "Поставщики", desc: "Оптовые продажи, коллективные закупки, каталог", features: ["Коллективные закупки", "Каталог товаров", "Прямой доступ к бизнесу", "Гарантированный сбыт"], href: "/register?role=supplier" },
            ].map((role, i) => (
              <Reveal key={role.title} delay={i * 0.06}>
                <div className="group h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                    {role.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{role.title}</h3>
                  <p className="text-sm text-muted mb-5 leading-relaxed">{role.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {role.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/40">
                        <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={role.href} className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
                    Регистрация <ArrowRight size={14} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">Возможности</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">Всё в одном месте</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Briefcase size={22} />, title: "Вакансии и резюме", desc: "Двусторонний рынок труда с верификацией по ИНН и документам.", href: "/vacancies" },
              { icon: <Zap size={22} />, title: "Биржа подработок", desc: "Мгновенный мэтчинг работодателей и специалистов для разовых задач.", href: "/gigs" },
              { icon: <ShoppingCart size={22} />, title: "Коллективные закупки", desc: "Объединяйтесь для оптовых цен. Даже небольшие точки получают скидки.", href: "/suppliers" },
              { icon: <Tag size={22} />, title: "Промокоды и акции", desc: "Эксклюзивные скидки от партнёров платформы для участников.", href: "/promos" },
              { icon: <GraduationCap size={22} />, title: "Учебный центр", desc: "Обучение и сертификация. Приоритет в выдаче и прибавка к зарплате.", href: "/training" },
              { icon: <MessageSquare size={22} />, title: "Сообщество", desc: "Тематические чаты, директорский клуб, галерея работ, Q&A.", href: "/chats" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <Link href={f.href} className="group block h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary/15 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">Как это работает</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">Четыре шага</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Регистрация", desc: "Выберите роль и пройдите верификацию" },
              { n: "02", title: "Профиль", desc: "Заполните данные, портфолио или каталог" },
              { n: "03", title: "Работа", desc: "Вакансии, заказы, закупки — всё доступно" },
              { n: "04", title: "Рост", desc: "Обучение, сертификация, расширение бизнеса" },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <div className="relative p-6">
                  <div className="text-6xl font-black text-white/[0.03] absolute top-2 right-4 select-none">{step.n}</div>
                  <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center text-primary text-xs font-bold mb-5">
                    {step.n}
                  </div>
                  <h4 className="font-bold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                  {i < 3 && <div className="hidden lg:block absolute top-10 -right-3 text-border"><ArrowRight size={14} /></div>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <Reveal>
                <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">Преимущества</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-10">
                  Почему <span className="text-gradient">эта платформа</span>
                </h2>
              </Reveal>

              <div className="space-y-6">
                {[
                  { icon: <Shield size={18} />, title: "Верификация", desc: "Работодатели по ИНН, специалисты по документам. Только проверенные участники." },
                  { icon: <TrendingUp size={18} />, title: "Антидемпинг", desc: "Конкуренция по качеству, а не по цене. Рейтинговая система." },
                  { icon: <Clock size={18} />, title: "Быстрый мэтчинг", desc: "Вакансии и заявки находят исполнителя за минуты." },
                  { icon: <Award size={18} />, title: "Сертификация", desc: "Учебный центр с официальными сертификатами и приоритетом в выдаче." },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.06}>
                    <div className="flex gap-4">
                      <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-sm">{item.title}</h4>
                        <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="p-8 rounded-2xl bg-card border border-border space-y-7">
                {[
                  { label: "Специалистов", value: "12 000", pct: 80 },
                  { label: "Компаний", value: "850", pct: 55 },
                  { label: "Городов", value: "48", pct: 40 },
                  { label: "Клиентов", value: "35 000", pct: 95 },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">{s.label}</span>
                      <span className="font-semibold text-primary">{s.value}</span>
                    </div>
                    <div className="h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <Reveal>
              <span className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4">Вопросы и ответы</h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div>
                {[
                  { q: "Как зарегистрироваться работодателю?", a: "Необходим ИНН организации. После верификации открывается доступ к вакансиям, закупкам и директорскому чату." },
                  { q: "Как работают коллективные закупки?", a: "Поставщик размещает предложение с порогом. Участники заявляют объём. Когда порог набран — все получают дилерскую цену." },
                  { q: "Что даёт сертификация?", a: "Отметка в профиле, приоритет в выдаче, доверие работодателей и прибавка к зарплате." },
                  { q: "Видят ли конкуренты мой профиль?", a: "Нет. Работодатели не видят других работодателей. Специалисты не видят других специалистов." },
                  { q: "Как получить промокод?", a: "Зарегистрируйтесь — и вам откроются эксклюзивные акции от партнёров." },
                ].map((item, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="border-b border-border">
                      <button onClick={() => setOpenFaq(isOpen ? null : i)} className="flex items-center justify-between w-full py-5 text-left group">
                        <span className={`text-sm font-medium transition-colors ${isOpen ? "text-white" : "text-white/50 group-hover:text-white/70"}`}>{item.q}</span>
                        <ChevronDown size={16} className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-muted"}`} />
                      </button>
                      <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <p className="text-sm text-muted leading-relaxed pb-5">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="p-12 sm:p-16 rounded-2xl bg-card border border-border relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Присоединяйтесь к <span className="text-gradient">платформе</span>
              </h2>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Более 12 000 специалистов и 850 компаний уже здесь.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register" className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary rounded-full text-white font-semibold hover:bg-primary-hover transition-colors">
                  Создать аккаунт <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/vacancies" className="px-8 py-3.5 border border-border text-muted hover:text-white rounded-full hover:border-white/20 transition-all">
                  Смотреть вакансии
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
