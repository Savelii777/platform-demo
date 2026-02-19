import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const footerLinks = {
  platform: [
    { href: "/vacancies", label: "Вакансии" },
    { href: "/specialists", label: "Специалисты" },
    { href: "/gigs", label: "Подработки" },
    { href: "/suppliers", label: "Поставщики" },
  ],
  community: [
    { href: "/chats", label: "Сообщество" },
    { href: "/promos", label: "Промокоды" },
    { href: "/training", label: "Учебный центр" },
    { href: "/about", label: "О платформе" },
  ],
  legal: [
    { href: "/terms", label: "Пользовательское соглашение" },
    { href: "/privacy", label: "Политика конфиденциальности" },
    { href: "/contacts", label: "Контакты" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Detailing 911"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              Профессиональная платформа для индустрии автомоек и детейлинга. Объединяем всех участников отрасли.
            </p>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <MapPin size={14} className="text-primary shrink-0" />
              Москва, Санкт-Петербург
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <Phone size={14} className="text-primary shrink-0" />
              +7 495 123 45 67
            </div>
            <div className="flex items-center gap-3 text-sm text-white/40">
              <Mail size={14} className="text-primary shrink-0" />
              info@detailing911.ru
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold text-white/70 mb-4 uppercase tracking-[0.15em]">Платформа</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold text-white/70 mb-4 uppercase tracking-[0.15em]">Сообщество</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold text-white/70 mb-4 uppercase tracking-[0.15em]">Подписка</h4>
            <p className="text-sm text-white/40 mb-4">Будьте в курсе новостей индустрии</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary text-foreground placeholder:text-white/30"
              />
              <button className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors">
                <Send size={16} />
              </button>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {["YT", "IG", "TG"].map((s) => (
                <a key={s} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/40 hover:text-primary hover:border-primary/30 transition-all">
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="line-glow mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>© {new Date().getFullYear()} DETAILING.911. Все права защищены.</p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
