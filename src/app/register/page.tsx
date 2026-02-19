"use client";

import { useState } from "react";
import {
  Mail, Lock, User, Eye, EyeOff, Building2, UserCheck, CarFront, Package,
  ArrowRight, ArrowLeft, Phone, MapPin, FileText, Briefcase, Clock,
  Wrench, Star, Tag, ShoppingBag, Percent, AlertTriangle, Info,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, type RegisterData } from "@/lib/auth-context";
import type { UserRole } from "@/lib/storage";

const roles: {
  value: UserRole;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    value: "employer",
    label: "Работодатель",
    icon: <Building2 size={24} />,
    desc: "Владельцы автомоек и детейлинг-студий",
  },
  {
    value: "specialist",
    label: "Специалист",
    icon: <UserCheck size={24} />,
    desc: "Мастера, полировщики, детейлеры",
  },
  {
    value: "client",
    label: "Клиент",
    icon: <CarFront size={24} />,
    desc: "Автовладельцы, ищущие услуги",
  },
  {
    value: "supplier",
    label: "Поставщик",
    icon: <Package size={24} />,
    desc: "Производители и дистрибьюторы",
  },
];

const companyTypes = [
  "Автомойка",
  "Детейлинг-студия",
  "Детейлинг-центр",
  "Автосервис",
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Employer fields
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [services, setServices] = useState("");

  // Specialist fields
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");

  // Supplier fields
  const [supplierCategory, setSupplierCategory] = useState("");
  const [products, setProducts] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [discount, setDiscount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data: RegisterData = {
        role: selectedRole!,
        email,
        password,
        name: selectedRole === "supplier" ? companyName || name : name,
        phone,
        city,
      };

      if (selectedRole === "employer") {
        if (!inn.trim()) {
          setError("ИНН обязателен для регистрации работодателя");
          setSubmitting(false);
          return;
        }
        data.companyName = companyName;
        data.inn = inn;
        data.companyType = companyType;
        data.address = address;
        data.district = district;
        data.description = description;
        data.workingHours = workingHours;
        data.services = services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (selectedRole === "specialist") {
        data.specialization = specialization;
        data.experience = experience;
        data.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (selectedRole === "supplier") {
        data.companyName = companyName;
        data.category = supplierCategory;
        data.products = products
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        data.minOrder = minOrder;
        data.discount = discount;
      }

      register(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Ошибка регистрации";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors";

  const renderInput = (
    label: string,
    icon: React.ReactNode,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    type = "text",
    required = false,
  ) => (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
        {type === "password" ? (
          <>
            <input
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              required={required}
              className="w-full pl-11 pr-12 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={inputClass}
          />
        )}
      </div>
    </div>
  );

  const renderSelect = (
    label: string,
    icon: React.ReactNode,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    placeholder: string,
  ) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass + " appearance-none cursor-pointer"}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTextarea = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
  ) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors resize-none"
      />
    </div>
  );

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold mb-2">Регистрация</h1>
          <p className="text-sm text-muted">
            Присоединяйтесь к крупнейшей платформе для детейлинг-индустрии
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1
                ? "bg-primary text-white"
                : "bg-surface text-muted border border-border"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-0.5 ${step >= 2 ? "bg-primary" : "bg-border"}`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2
                ? "bg-primary text-white"
                : "bg-surface text-muted border border-border"
            }`}
          >
            2
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border card-glow">
          {/* ─── Step 1: Role Selection ─── */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold mb-2">Выберите роль</h2>
              <p className="text-sm text-muted mb-6">
                Это определит ваши возможности на платформе. Роль можно дополнить
                позже.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      selectedRole === role.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        selectedRole === role.value
                          ? "bg-primary/20 text-primary"
                          : "bg-surface text-muted"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <h4 className="font-semibold mb-1">{role.label}</h4>
                    <p className="text-xs text-muted">{role.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  selectedRole
                    ? "bg-primary text-white hover:bg-primary-hover"
                    : "bg-surface text-muted border border-border cursor-not-allowed"
                }`}
              >
                Далее <ArrowRight size={16} />
              </button>
            </>
          )}

          {/* ─── Step 2: Registration Form ─── */}
          {step === 2 && selectedRole && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="flex items-center gap-1 text-sm text-primary hover:underline mb-2"
              >
                <ArrowLeft size={14} /> Назад к выбору роли
              </button>

              {/* Role badge */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3 text-sm">
                <span className="text-primary">
                  {roles.find((r) => r.value === selectedRole)?.icon}
                </span>
                <span>
                  Регистрация как{" "}
                  <span className="font-medium text-primary">
                    {roles.find((r) => r.value === selectedRole)?.label}
                  </span>
                </span>
              </div>

              {/* Verification banners */}
              {selectedRole === "specialist" && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3 text-sm text-warning">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>
                    После регистрации необходимо пройти верификацию по документу
                  </span>
                </div>
              )}

              {selectedRole === "supplier" && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3 text-sm text-warning">
                  <Info size={18} className="shrink-0 mt-0.5" />
                  <span>
                    После регистрации потребуется верификация компании и
                    подтверждение сертификатов
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* ── Common fields ── */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                  Основные данные
                </h3>
                {renderInput("Имя", <User size={16} />, name, setName, "Ваше имя", "text", true)}
                {renderInput("Email", <Mail size={16} />, email, setEmail, "name@example.com", "email", true)}
                {renderInput("Пароль", <Lock size={16} />, password, setPassword, "Минимум 8 символов", "password", true)}
                {renderInput("Телефон", <Phone size={16} />, phone, setPhone, "+7 (999) 123-45-67", "tel", true)}
                {renderInput("Город", <MapPin size={16} />, city, setCity, "Москва", "text", true)}
              </div>

              {/* ── Employer extra fields ── */}
              {selectedRole === "employer" && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                    Данные компании
                  </h3>
                  {renderInput("Название компании", <Building2 size={16} />, companyName, setCompanyName, "ООО «Чистый блеск»", "text", true)}
                  {renderInput("ИНН", <FileText size={16} />, inn, setInn, "1234567890", "text", true)}
                  {renderSelect("Тип компании", <Briefcase size={16} />, companyType, setCompanyType, companyTypes, "Выберите тип")}
                  {renderInput("Адрес", <MapPin size={16} />, address, setAddress, "ул. Примерная, д. 1")}
                  {renderInput("Район", <MapPin size={16} />, district, setDistrict, "Центральный")}
                  {renderTextarea("Описание", description, setDescription, "Расскажите о вашей компании…")}
                  {renderInput("Режим работы", <Clock size={16} />, workingHours, setWorkingHours, "Пн-Вс 09:00-21:00")}
                  {renderInput("Услуги (через запятую)", <Wrench size={16} />, services, setServices, "Полировка, Керамика, Оклейка")}
                </div>
              )}

              {/* ── Specialist extra fields ── */}
              {selectedRole === "specialist" && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                    Профессиональные данные
                  </h3>
                  {renderInput("Специализация", <Star size={16} />, specialization, setSpecialization, "Полировщик, детейлер, оклейщик…")}
                  {renderInput("Опыт работы", <Briefcase size={16} />, experience, setExperience, "5 лет")}
                  {renderInput("Навыки (через запятую)", <Wrench size={16} />, skills, setSkills, "Полировка, Керамическое покрытие, PPF")}
                </div>
              )}

              {/* ── Client: no extra fields ── */}

              {/* ── Supplier extra fields ── */}
              {selectedRole === "supplier" && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                    Данные поставщика
                  </h3>
                  {renderInput("Название компании", <Building2 size={16} />, companyName, setCompanyName, "ООО «Поставщик Авто»", "text", true)}
                  {renderInput("Категория", <Tag size={16} />, supplierCategory, setSupplierCategory, "Автохимия, Оборудование…")}
                  {renderInput("Продукция (через запятую)", <ShoppingBag size={16} />, products, setProducts, "Полироли, Шампуни, Микрофибра")}
                  {renderInput("Минимальный заказ", <Package size={16} />, minOrder, setMinOrder, "10 000 ₽")}
                  {renderInput("Скидка для партнёров", <Percent size={16} />, discount, setDiscount, "10%")}
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-border bg-surface accent-primary"
                />
                <span className="text-xs text-muted">
                  Я принимаю{" "}
                  <button type="button" className="text-primary hover:underline">
                    условия использования
                  </button>{" "}
                  и{" "}
                  <button type="button" className="text-primary hover:underline">
                    политику конфиденциальности
                  </button>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-hover transition-colors pill-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Регистрация…" : "Зарегистрироваться"}{" "}
                {!submitting && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {/* Footer link */}
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
