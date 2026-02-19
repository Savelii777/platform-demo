"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, MessageSquare, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/vacancies", label: "Вакансии" },
  { href: "/specialists", label: "Специалисты" },
  { href: "/companies", label: "Компании" },
  { href: "/gigs", label: "Подработки" },
  { href: "/orders", label: "Заказы" },
  { href: "/suppliers", label: "Поставщики" },
  { href: "/promos", label: "Акции" },
  { href: "/training", label: "Обучение" },
  { href: "/chats", label: "Чат" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = user?.companyName || user?.name || "Профиль";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Detailing 911"
              width={110}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-[13px] text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-white/80 max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown size={14} className={`text-white/40 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <LayoutDashboard size={16} /> Личный кабинет
                      </Link>
                      <Link href="/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                        <MessageSquare size={16} /> Сообщения
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors w-full text-left">
                        <LogOut size={16} /> Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                  Войти
                </Link>
                <Link href="/register" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-colors">
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden p-2 text-white/60 hover:text-white">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white/5 bg-background/98 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-center text-white/60 hover:text-white">
                  Войти
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-center font-semibold bg-primary text-white rounded-full">
                  Регистрация
                </Link>
              </div>
            )}
            {isLoggedIn && (
              <div className="pt-3 mt-3 border-t border-white/5 space-y-0.5">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
                  <LayoutDashboard size={16} /> Личный кабинет
                </Link>
                <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg">
                  <MessageSquare size={16} /> Сообщения
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 rounded-lg w-full text-left">
                  <LogOut size={16} /> Выйти
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
