"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const DEMO_ACCOUNTS = [
  { email: "autoshine@test.com", password: "123456", role: "Работодатель" },
  { email: "alex@test.com", password: "123456", role: "Специалист" },
  { email: "client@test.com", password: "123456", role: "Клиент" },
  { email: "koch@test.com", password: "123456", role: "Поставщик" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [loading, isLoggedIn, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }

    setSubmitting(true);
    try {
      login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Неверный email или пароль";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  if (loading || isLoggedIn) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold mb-2">Вход в DETAILING.911</h1>
          <p className="text-sm text-muted">Войдите, чтобы получить доступ ко всем возможностям</p>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border card-glow">
          {error && (
            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-surface accent-primary" />
                <span className="text-muted">Запомнить</span>
              </label>
              <button type="button" className="text-primary hover:underline">Забыли пароль?</button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Вход..." : "Войти"} {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border card-glow">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Users size={16} className="text-primary" />
            <span>Демо-аккаунты</span>
          </div>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-surface border border-border text-sm hover:border-primary transition-colors text-left"
              >
                <span className="text-muted">{acc.email}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{acc.role}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted text-center">Пароль для всех: 123456</p>
        </div>
      </div>
    </div>
  );
}
