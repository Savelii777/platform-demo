/* ──────────────────────────────────────────────
   localStorage CRUD service for detailing-platform
   Replaces backend — all data lives in browser.
   ────────────────────────────────────────────── */

// ─── Types ──────────────────────────────────

export type UserRole = "employer" | "specialist" | "client" | "supplier";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  password: string; // plaintext for demo
  name: string;
  phone: string;
  city: string;
  createdAt: string;
  isVerified: boolean;
  // employer
  companyName?: string;
  inn?: string;
  companyType?: string;
  address?: string;
  district?: string;
  description?: string;
  services?: string[];
  workingHours?: string;
  subscriptionPlan?: "basic" | "pro" | "premium";
  subscriptionExpiry?: string;
  subAccounts?: SubAccount[];
  // specialist
  specialization?: string;
  experience?: string;
  skills?: string[];
  isCertified?: boolean;
  certificateNumber?: string;
  status?: "searching" | "open" | "employed";
  portfolio?: PortfolioItem[];
  resumeText?: string;
  availableForGigs?: boolean;
  // supplier
  category?: string;
  products?: string[];
  minOrder?: string;
  discount?: string;
  // common
  rating?: number;
  reviewCount?: number;
  avatar?: string;
  favorites?: string[]; // ids of saved companies/specialists
}

export interface SubAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  canEditVacancies: boolean;
  canEditProfile: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface Vacancy {
  id: string;
  employerId: string;
  companyName: string;
  title: string;
  city: string;
  district: string;
  salary: string;
  schedule: string;
  experience: string;
  description: string;
  requirements: string[];
  isHot: boolean;
  isVerified: boolean;
  status: "active" | "closed";
  createdAt: string;
  applications: Application[];
}

export interface Application {
  id: string;
  vacancyId: string;
  specialistId: string;
  specialistName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Gig {
  id: string;
  authorId: string;
  authorName: string;
  type: "employer" | "specialist";
  title: string;
  city: string;
  district: string;
  date: string;
  pay: string;
  description: string;
  urgent: boolean;
  status: "active" | "taken" | "completed";
  createdAt: string;
  responses: GigResponse[];
}

export interface GigResponse {
  id: string;
  gigId: string;
  responderId: string;
  responderName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface ClientOrder {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  city: string;
  district: string;
  preferredDate: string;
  budget: string;
  description: string;
  carType: string;
  status: "active" | "inProgress" | "completed" | "cancelled";
  createdAt: string;
  responses: OrderResponse[];
}

export interface OrderResponse {
  id: string;
  orderId: string;
  responderId: string;
  responderName: string;
  responderRole: UserRole;
  price: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  participantRoles: UserRole[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  chatId: number;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Promo {
  id: string;
  creatorId: string;
  companyName: string;
  partner: string;
  category: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  validUntil: string;
  maxUses: number;
  isActive: boolean;
  isExclusive: boolean;
  usedBy: string[]; // user ids
}

export interface Review {
  id: string;
  targetId: string; // company or specialist id
  targetType: "company" | "specialist";
  authorId: string;
  authorName: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}

export interface CollectivePurchase {
  id: string;
  supplierId: string;
  supplierName: string;
  product: string;
  description: string;
  targetVolume: number;
  currentVolume: number;
  unitPrice: string;
  retailPrice: string;
  deadline: string;
  participants: PurchaseParticipant[];
  status: "active" | "completed" | "cancelled";
}

export interface PurchaseParticipant {
  userId: string;
  userName: string;
  quantity: number;
  joinedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  userId: string;
  userName: string;
  course: string;
  status: "enrolled" | "inProgress" | "completed";
  enrolledAt: string;
  completedAt?: string;
  certificateNumber?: string;
}

// ─── Keys ───────────────────────────────────

const KEYS = {
  USERS: "dp_users",
  CURRENT_USER: "dp_current_user",
  VACANCIES: "dp_vacancies",
  GIGS: "dp_gigs",
  CLIENT_ORDERS: "dp_client_orders",
  CONVERSATIONS: "dp_conversations",
  MESSAGES: "dp_messages",
  CHAT_MESSAGES: "dp_chat_messages",
  PROMOS: "dp_promos",
  REVIEWS: "dp_reviews",
  COLLECTIVE_PURCHASES: "dp_collective_purchases",
  TRAINING_ENROLLMENTS: "dp_training_enrollments",
  INITIALIZED: "dp_initialized",
} as const;

// ─── Helpers ────────────────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now(): string {
  return new Date().toISOString();
}

function get<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function getOne<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setOne<T>(key: string, data: T | null): void {
  if (typeof window === "undefined") return;
  if (data === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// ─── Auth ───────────────────────────────────

export const auth = {
  register(data: Omit<User, "id" | "createdAt" | "isVerified" | "rating" | "reviewCount" | "favorites">): User {
    const users = get<User>(KEYS.USERS);
    if (users.find(u => u.email === data.email)) {
      throw new Error("Пользователь с таким email уже существует");
    }
    if (data.role === "employer" && data.inn) {
      if (users.find(u => u.inn === data.inn)) {
        throw new Error("Компания с таким ИНН уже зарегистрирована");
      }
    }
    if (data.role === "employer" && data.address) {
      if (users.find(u => u.role === "employer" && u.address === data.address)) {
        throw new Error("Предприятие по этому адресу уже зарегистрировано");
      }
    }
    const user: User = {
      ...data,
      id: uid(),
      createdAt: now(),
      isVerified: data.role === "client",
      rating: 0,
      reviewCount: 0,
      favorites: [],
    };
    users.push(user);
    set(KEYS.USERS, users);
    setOne(KEYS.CURRENT_USER, user);
    return user;
  },

  login(email: string, password: string): User {
    const users = get<User>(KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Неверный email или пароль");
    if (user.role === "employer" && user.subscriptionExpiry) {
      const exp = new Date(user.subscriptionExpiry);
      if (exp < new Date()) {
        throw new Error("Подписка истекла. Продлите подписку для входа.");
      }
    }
    setOne(KEYS.CURRENT_USER, user);
    return user;
  },

  logout(): void {
    setOne(KEYS.CURRENT_USER, null);
  },

  getCurrentUser(): User | null {
    return getOne<User>(KEYS.CURRENT_USER);
  },

  updateProfile(userId: string, updates: Partial<User>): User {
    const users = get<User>(KEYS.USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("Пользователь не найден");
    users[idx] = { ...users[idx], ...updates };
    set(KEYS.USERS, users);
    const current = auth.getCurrentUser();
    if (current?.id === userId) {
      setOne(KEYS.CURRENT_USER, users[idx]);
    }
    return users[idx];
  },

  getUser(id: string): User | null {
    return get<User>(KEYS.USERS).find(u => u.id === id) ?? null;
  },

  getUsersByRole(role: UserRole): User[] {
    return get<User>(KEYS.USERS).filter(u => u.role === role);
  },

  toggleFavorite(userId: string, targetId: string): void {
    const users = get<User>(KEYS.USERS);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;
    const favs = users[idx].favorites || [];
    if (favs.includes(targetId)) {
      users[idx].favorites = favs.filter(f => f !== targetId);
    } else {
      users[idx].favorites = [...favs, targetId];
    }
    set(KEYS.USERS, users);
    if (auth.getCurrentUser()?.id === userId) {
      setOne(KEYS.CURRENT_USER, users[idx]);
    }
  },
};

// ─── Vacancies ──────────────────────────────

export const vacancies = {
  getAll(): Vacancy[] {
    return get<Vacancy>(KEYS.VACANCIES).filter(v => v.status === "active");
  },

  getById(id: string): Vacancy | null {
    return get<Vacancy>(KEYS.VACANCIES).find(v => v.id === id) ?? null;
  },

  getByEmployer(employerId: string): Vacancy[] {
    return get<Vacancy>(KEYS.VACANCIES).filter(v => v.employerId === employerId);
  },

  create(data: Omit<Vacancy, "id" | "createdAt" | "applications" | "status" | "isVerified">): Vacancy {
    const all = get<Vacancy>(KEYS.VACANCIES);
    const v: Vacancy = {
      ...data,
      id: uid(),
      createdAt: now(),
      applications: [],
      status: "active",
      isVerified: auth.getUser(data.employerId)?.isVerified ?? false,
    };
    all.push(v);
    set(KEYS.VACANCIES, all);
    return v;
  },

  update(id: string, updates: Partial<Vacancy>): Vacancy {
    const all = get<Vacancy>(KEYS.VACANCIES);
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) throw new Error("Вакансия не найдена");
    all[idx] = { ...all[idx], ...updates };
    set(KEYS.VACANCIES, all);
    return all[idx];
  },

  delete(id: string): void {
    const all = get<Vacancy>(KEYS.VACANCIES).filter(v => v.id !== id);
    set(KEYS.VACANCIES, all);
  },

  apply(vacancyId: string, specialistId: string, specialistName: string, message: string): Application {
    const all = get<Vacancy>(KEYS.VACANCIES);
    const idx = all.findIndex(v => v.id === vacancyId);
    if (idx === -1) throw new Error("Вакансия не найдена");
    const existing = all[idx].applications.find(a => a.specialistId === specialistId);
    if (existing) throw new Error("Вы уже откликнулись на эту вакансию");
    const app: Application = {
      id: uid(),
      vacancyId,
      specialistId,
      specialistName,
      message,
      status: "pending",
      createdAt: now(),
    };
    all[idx].applications.push(app);
    set(KEYS.VACANCIES, all);
    return app;
  },

  updateApplicationStatus(vacancyId: string, applicationId: string, status: "accepted" | "rejected"): void {
    const all = get<Vacancy>(KEYS.VACANCIES);
    const vIdx = all.findIndex(v => v.id === vacancyId);
    if (vIdx === -1) return;
    const aIdx = all[vIdx].applications.findIndex(a => a.id === applicationId);
    if (aIdx === -1) return;
    all[vIdx].applications[aIdx].status = status;
    set(KEYS.VACANCIES, all);
  },
};

// ─── Gigs ───────────────────────────────────

export const gigs = {
  getAll(): Gig[] {
    return get<Gig>(KEYS.GIGS).filter(g => g.status === "active");
  },

  create(data: Omit<Gig, "id" | "createdAt" | "responses" | "status">): Gig {
    const all = get<Gig>(KEYS.GIGS);
    const g: Gig = { ...data, id: uid(), createdAt: now(), responses: [], status: "active" };
    all.push(g);
    set(KEYS.GIGS, all);
    return g;
  },

  respond(gigId: string, responderId: string, responderName: string, message: string): void {
    const all = get<Gig>(KEYS.GIGS);
    const idx = all.findIndex(g => g.id === gigId);
    if (idx === -1) return;
    all[idx].responses.push({
      id: uid(), gigId, responderId, responderName, message, status: "pending", createdAt: now(),
    });
    set(KEYS.GIGS, all);
  },

  getByAuthor(authorId: string): Gig[] {
    return get<Gig>(KEYS.GIGS).filter(g => g.authorId === authorId);
  },

  delete(id: string): void {
    set(KEYS.GIGS, get<Gig>(KEYS.GIGS).filter(g => g.id !== id));
  },
};

// ─── Client Orders ──────────────────────────

export const clientOrders = {
  getAll(): ClientOrder[] {
    return get<ClientOrder>(KEYS.CLIENT_ORDERS);
  },

  getActive(): ClientOrder[] {
    return get<ClientOrder>(KEYS.CLIENT_ORDERS).filter(o => o.status === "active");
  },

  getByClient(clientId: string): ClientOrder[] {
    return get<ClientOrder>(KEYS.CLIENT_ORDERS).filter(o => o.clientId === clientId);
  },

  create(data: Omit<ClientOrder, "id" | "createdAt" | "responses" | "status">): ClientOrder {
    const all = get<ClientOrder>(KEYS.CLIENT_ORDERS);
    const order: ClientOrder = { ...data, id: uid(), createdAt: now(), responses: [], status: "active" };
    all.push(order);
    set(KEYS.CLIENT_ORDERS, all);
    return order;
  },

  respond(orderId: string, responderId: string, responderName: string, responderRole: UserRole, price: string, message: string): void {
    const all = get<ClientOrder>(KEYS.CLIENT_ORDERS);
    const idx = all.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    all[idx].responses.push({
      id: uid(), orderId, responderId, responderName, responderRole, price, message, status: "pending", createdAt: now(),
    });
    set(KEYS.CLIENT_ORDERS, all);
  },

  updateStatus(id: string, status: ClientOrder["status"]): void {
    const all = get<ClientOrder>(KEYS.CLIENT_ORDERS);
    const idx = all.findIndex(o => o.id === id);
    if (idx === -1) return;
    all[idx].status = status;
    set(KEYS.CLIENT_ORDERS, all);
  },

  acceptResponse(orderId: string, responseId: string): void {
    const all = get<ClientOrder>(KEYS.CLIENT_ORDERS);
    const oIdx = all.findIndex(o => o.id === orderId);
    if (oIdx === -1) return;
    all[oIdx].responses.forEach(r => {
      r.status = r.id === responseId ? "accepted" : "rejected";
    });
    all[oIdx].status = "inProgress";
    set(KEYS.CLIENT_ORDERS, all);
  },
};

// ─── Conversations & Messages ───────────────

export const messaging = {
  getConversations(userId: string): Conversation[] {
    return get<Conversation>(KEYS.CONVERSATIONS).filter(c => c.participantIds.includes(userId));
  },

  getOrCreateConversation(user1: User, user2: User): Conversation {
    const all = get<Conversation>(KEYS.CONVERSATIONS);
    const existing = all.find(c =>
      c.participantIds.includes(user1.id) && c.participantIds.includes(user2.id)
    );
    if (existing) return existing;
    const conv: Conversation = {
      id: uid(),
      participantIds: [user1.id, user2.id],
      participantNames: [user1.name || user1.companyName || "", user2.name || user2.companyName || ""],
      participantRoles: [user1.role, user2.role],
      lastMessage: "",
      lastMessageAt: now(),
      unreadCount: { [user1.id]: 0, [user2.id]: 0 },
    };
    all.push(conv);
    set(KEYS.CONVERSATIONS, all);
    return conv;
  },

  getMessages(conversationId: string): Message[] {
    return get<Message>(KEYS.MESSAGES).filter(m => m.conversationId === conversationId);
  },

  sendMessage(conversationId: string, senderId: string, senderName: string, receiverId: string, text: string): Message {
    const msgs = get<Message>(KEYS.MESSAGES);
    const msg: Message = {
      id: uid(), conversationId, senderId, senderName, receiverId, text, createdAt: now(), read: false,
    };
    msgs.push(msg);
    set(KEYS.MESSAGES, msgs);

    // update conversation
    const convs = get<Conversation>(KEYS.CONVERSATIONS);
    const idx = convs.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].lastMessage = text;
      convs[idx].lastMessageAt = now();
      convs[idx].unreadCount[receiverId] = (convs[idx].unreadCount[receiverId] || 0) + 1;
      set(KEYS.CONVERSATIONS, convs);
    }
    return msg;
  },

  markRead(conversationId: string, userId: string): void {
    const msgs = get<Message>(KEYS.MESSAGES);
    msgs.forEach(m => {
      if (m.conversationId === conversationId && m.receiverId === userId) {
        m.read = true;
      }
    });
    set(KEYS.MESSAGES, msgs);

    const convs = get<Conversation>(KEYS.CONVERSATIONS);
    const idx = convs.findIndex(c => c.id === conversationId);
    if (idx !== -1) {
      convs[idx].unreadCount[userId] = 0;
      set(KEYS.CONVERSATIONS, convs);
    }
  },
};

// ─── Community Chat Messages ────────────────

export const communityChat = {
  getMessages(chatId: number): ChatMessage[] {
    return get<ChatMessage>(KEYS.CHAT_MESSAGES).filter(m => m.chatId === chatId);
  },

  sendMessage(chatId: number, authorId: string, authorName: string, authorRole: UserRole, text: string, imageUrl?: string): ChatMessage {
    const all = get<ChatMessage>(KEYS.CHAT_MESSAGES);
    const msg: ChatMessage = {
      id: uid(), chatId, authorId, authorName, authorRole, text, imageUrl, createdAt: now(),
    };
    all.push(msg);
    set(KEYS.CHAT_MESSAGES, all);
    return msg;
  },
};

// ─── Promos ─────────────────────────────────

export const promos = {
  getAll(): Promo[] {
    return get<Promo>(KEYS.PROMOS);
  },

  create(data: Omit<Promo, "id" | "usedBy">): Promo {
    const all = get<Promo>(KEYS.PROMOS);
    const p: Promo = { ...data, id: uid(), usedBy: [] };
    all.push(p);
    set(KEYS.PROMOS, all);
    return p;
  },

  usePromo(promoId: string, userId: string): void {
    const all = get<Promo>(KEYS.PROMOS);
    const idx = all.findIndex(p => p.id === promoId);
    if (idx === -1) return;
    if (!all[idx].usedBy.includes(userId)) {
      all[idx].usedBy.push(userId);
      set(KEYS.PROMOS, all);
    }
  },
};

// ─── Reviews ────────────────────────────────

export const reviews = {
  getByTarget(targetId: string): Review[] {
    return get<Review>(KEYS.REVIEWS).filter(r => r.targetId === targetId);
  },

  create(data: Omit<Review, "id" | "createdAt">): Review {
    const all = get<Review>(KEYS.REVIEWS);
    const r: Review = { ...data, id: uid(), createdAt: now() };
    all.push(r);
    set(KEYS.REVIEWS, all);
    // update target's rating
    const targetReviews = all.filter(rv => rv.targetId === data.targetId);
    const avgRating = targetReviews.reduce((sum, rv) => sum + rv.rating, 0) / targetReviews.length;
    const users = get<User>(KEYS.USERS);
    const uIdx = users.findIndex(u => u.id === data.targetId);
    if (uIdx !== -1) {
      users[uIdx].rating = Math.round(avgRating * 10) / 10;
      users[uIdx].reviewCount = targetReviews.length;
      set(KEYS.USERS, users);
    }
    return r;
  },
};

// ─── Collective Purchases ───────────────────

export const collectivePurchases = {
  getAll(): CollectivePurchase[] {
    return get<CollectivePurchase>(KEYS.COLLECTIVE_PURCHASES);
  },

  getActive(): CollectivePurchase[] {
    return get<CollectivePurchase>(KEYS.COLLECTIVE_PURCHASES).filter(p => p.status === "active");
  },

  create(data: Omit<CollectivePurchase, "id" | "participants" | "currentVolume" | "status">): CollectivePurchase {
    const all = get<CollectivePurchase>(KEYS.COLLECTIVE_PURCHASES);
    const p: CollectivePurchase = { ...data, id: uid(), participants: [], currentVolume: 0, status: "active" };
    all.push(p);
    set(KEYS.COLLECTIVE_PURCHASES, all);
    return p;
  },

  join(purchaseId: string, userId: string, userName: string, quantity: number): void {
    const all = get<CollectivePurchase>(KEYS.COLLECTIVE_PURCHASES);
    const idx = all.findIndex(p => p.id === purchaseId);
    if (idx === -1) return;
    const existing = all[idx].participants.find(p => p.userId === userId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      all[idx].participants.push({ userId, userName, quantity, joinedAt: now() });
    }
    all[idx].currentVolume = all[idx].participants.reduce((sum, p) => sum + p.quantity, 0);
    if (all[idx].currentVolume >= all[idx].targetVolume) {
      all[idx].status = "completed";
    }
    set(KEYS.COLLECTIVE_PURCHASES, all);
  },
};

// ─── Training ───────────────────────────────

export const training = {
  getEnrollments(userId: string): TrainingEnrollment[] {
    return get<TrainingEnrollment>(KEYS.TRAINING_ENROLLMENTS).filter(e => e.userId === userId);
  },

  getAllGraduates(): TrainingEnrollment[] {
    return get<TrainingEnrollment>(KEYS.TRAINING_ENROLLMENTS).filter(e => e.status === "completed");
  },

  enroll(userId: string, userName: string, course: string): TrainingEnrollment {
    const all = get<TrainingEnrollment>(KEYS.TRAINING_ENROLLMENTS);
    const existing = all.find(e => e.userId === userId && e.course === course);
    if (existing) throw new Error("Вы уже записаны на этот курс");
    const e: TrainingEnrollment = {
      id: uid(), userId, userName, course, status: "enrolled", enrolledAt: now(),
    };
    all.push(e);
    set(KEYS.TRAINING_ENROLLMENTS, all);
    return e;
  },

  complete(enrollmentId: string): TrainingEnrollment {
    const all = get<TrainingEnrollment>(KEYS.TRAINING_ENROLLMENTS);
    const idx = all.findIndex(e => e.id === enrollmentId);
    if (idx === -1) throw new Error("Запись не найдена");
    const certNum = `UC-${new Date().getFullYear()}-${String(all.filter(e => e.status === "completed").length + 1).padStart(3, "0")}`;
    all[idx].status = "completed";
    all[idx].completedAt = now();
    all[idx].certificateNumber = certNum;
    set(KEYS.TRAINING_ENROLLMENTS, all);
    // mark specialist as certified
    auth.updateProfile(all[idx].userId, { isCertified: true, certificateNumber: certNum });
    return all[idx];
  },

  verifyCertificate(certNumber: string): TrainingEnrollment | null {
    return get<TrainingEnrollment>(KEYS.TRAINING_ENROLLMENTS)
      .find(e => e.certificateNumber === certNumber && e.status === "completed") ?? null;
  },
};

// ─── Seed Data ──────────────────────────────

export function initializeData(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.INITIALIZED)) return;

  // Seed users
  const users: User[] = [
    {
      id: "emp1", role: "employer", email: "autoshine@test.com", password: "123456",
      name: "Иван Директоров", phone: "+7 (495) 123-45-67", city: "Москва",
      companyName: "AutoShine Studio", inn: "7701234567", companyType: "Детейлинг-студия",
      address: "ул. Ломоносовский пр-т, 25", district: "Юго-Западный",
      description: "Премиальная студия детейлинга с 10-летним опытом.",
      services: ["Полировка кузова", "Керамическое покрытие", "Оклейка PPF", "Химчистка салона", "Тонировка"],
      workingHours: "Пн-Вс: 9:00–21:00", subscriptionPlan: "pro",
      subscriptionExpiry: "2027-12-31", subAccounts: [],
      createdAt: "2024-01-15T10:00:00Z", isVerified: true, rating: 4.9, reviewCount: 234, favorites: [],
    },
    {
      id: "emp2", role: "employer", email: "cleancar@test.com", password: "123456",
      name: "Петр Моечкин", phone: "+7 (812) 987-65-43", city: "Санкт-Петербург",
      companyName: "CleanCar Express", inn: "7801234567", companyType: "Автомойка",
      address: "Невский пр-т, 114", district: "Невский",
      description: "Сеть экспресс-моек с быстрым обслуживанием.",
      services: ["Бесконтактная мойка", "Ручная мойка", "Экспресс-полировка"],
      workingHours: "Круглосуточно", subscriptionPlan: "basic",
      subscriptionExpiry: "2027-06-30", subAccounts: [],
      createdAt: "2024-03-20T10:00:00Z", isVerified: true, rating: 4.5, reviewCount: 567, favorites: [],
    },
    {
      id: "emp3", role: "employer", email: "premium@test.com", password: "123456",
      name: "Артём Премиумов", phone: "+7 (495) 555-00-11", city: "Москва",
      companyName: "Premium Detail", inn: "7702345678", companyType: "Детейлинг-центр",
      address: "ул. Тверская, 15с2", district: "Центральный",
      description: "Эксклюзивный детейлинг-центр для авто премиум и люкс класса.",
      services: ["Полный детейлинг", "Полировка", "Керамика", "PPF", "Химчистка", "PDR"],
      workingHours: "Пн-Сб: 10:00–20:00", subscriptionPlan: "premium",
      subscriptionExpiry: "2027-12-31", subAccounts: [],
      createdAt: "2024-02-10T10:00:00Z", isVerified: true, rating: 5.0, reviewCount: 89, favorites: [],
    },
    {
      id: "spec1", role: "specialist", email: "alex@test.com", password: "123456",
      name: "Алексей Кузнецов", phone: "+7 (999) 111-22-33", city: "Москва",
      specialization: "Мастер-полировщик", experience: "5 лет",
      skills: ["Полировка кузова", "Керамическое покрытие", "Восстановление ЛКП"],
      isCertified: true, certificateNumber: "UC-2025-001",
      status: "searching", availableForGigs: true, portfolio: [], resumeText: "Опытный полировщик, работал в Premium Detail.",
      createdAt: "2024-05-01T10:00:00Z", isVerified: true, rating: 4.9, reviewCount: 45, favorites: [],
    },
    {
      id: "spec2", role: "specialist", email: "dmitry@test.com", password: "123456",
      name: "Дмитрий Волков", phone: "+7 (999) 222-33-44", city: "Санкт-Петербург",
      specialization: "Детейлер-универсал", experience: "7 лет",
      skills: ["PPF", "Керамика", "Полировка", "Химчистка"],
      isCertified: true, certificateNumber: "UC-2025-002",
      status: "searching", availableForGigs: true, portfolio: [], resumeText: "Детейлер с полным циклом.",
      createdAt: "2024-04-15T10:00:00Z", isVerified: true, rating: 5.0, reviewCount: 32, favorites: [],
    },
    {
      id: "spec3", role: "specialist", email: "mikhail@test.com", password: "123456",
      name: "Михаил Соколов", phone: "+7 (999) 333-44-55", city: "Москва",
      specialization: "Автомойщик", experience: "2 года",
      skills: ["Бесконтактная мойка", "Химчистка салона", "Полировка"],
      isCertified: false, status: "open", availableForGigs: true, portfolio: [],
      createdAt: "2024-08-01T10:00:00Z", isVerified: true, rating: 4.5, reviewCount: 12, favorites: [],
    },
    {
      id: "client1", role: "client", email: "client@test.com", password: "123456",
      name: "Владимир Автолюбов", phone: "+7 (999) 555-66-77", city: "Москва",
      createdAt: "2024-06-01T10:00:00Z", isVerified: true, rating: 0, reviewCount: 0, favorites: ["emp1", "emp3"],
    },
    {
      id: "sup1", role: "supplier", email: "koch@test.com", password: "123456",
      name: "Koch Chemie Россия", phone: "+7 (495) 800-00-01", city: "Москва",
      companyName: "Koch Chemie Россия", category: "Автохимия",
      products: ["Шампуни", "Полироли", "Защитные составы", "Средства для химчистки"],
      minOrder: "от 50 000 ₽", discount: "до 30% при коллективной закупке",
      description: "Официальный дистрибьютор Koch Chemie в России.",
      createdAt: "2024-01-01T10:00:00Z", isVerified: true, rating: 4.8, reviewCount: 156, favorites: [],
    },
  ];
  set(KEYS.USERS, users);

  // Seed vacancies
  const seedVacancies: Vacancy[] = [
    {
      id: "vac1", employerId: "emp1", companyName: "AutoShine Studio",
      title: "Мастер-полировщик", city: "Москва", district: "Юго-Западный",
      salary: "от 80 000 ₽", schedule: "5/2, с 9:00 до 20:00", experience: "от 2 лет",
      description: "Требуется опытный мастер-полировщик для работы с премиальными автомобилями.",
      requirements: ["Опыт полировки от 2 лет", "Знание материалов Koch, Meguiar's", "Аккуратность и внимание к деталям"],
      isHot: true, isVerified: true, status: "active", createdAt: "2026-02-19T08:00:00Z",
      applications: [
        { id: "app1", vacancyId: "vac1", specialistId: "spec1", specialistName: "Алексей Кузнецов",
          message: "Здравствуйте! Имею 5 лет опыта полировки. Сертифицирован.", status: "pending", createdAt: "2026-02-19T09:00:00Z" },
      ],
    },
    {
      id: "vac2", employerId: "emp2", companyName: "CleanCar Express",
      title: "Автомойщик", city: "Санкт-Петербург", district: "Невский",
      salary: "от 50 000 ₽", schedule: "Сменный 2/2", experience: "без опыта",
      description: "Ищем автомойщиков на новую точку. Обучение за счет компании.",
      requirements: ["Ответственность", "Физическая выносливость", "Желание учиться"],
      isHot: false, isVerified: true, status: "active", createdAt: "2026-02-18T14:00:00Z", applications: [],
    },
    {
      id: "vac3", employerId: "emp3", companyName: "Premium Detail",
      title: "Детейлер-универсал", city: "Москва", district: "Центральный",
      salary: "от 120 000 ₽", schedule: "5/2, гибкий график", experience: "от 3 лет",
      description: "Ищем детейлера с опытом работы с PPF и керамическими покрытиями.",
      requirements: ["Опыт оклейки PPF", "Навыки нанесения керамики", "Сертификат приветствуется"],
      isHot: true, isVerified: true, status: "active", createdAt: "2026-02-17T10:00:00Z", applications: [],
    },
  ];
  set(KEYS.VACANCIES, seedVacancies);

  // Seed gigs
  const seedGigs: Gig[] = [
    {
      id: "gig1", authorId: "emp1", authorName: "AutoShine Studio", type: "employer",
      title: "Мойщик на 1 день", city: "Москва", district: "Юго-Западный",
      date: "Завтра, 10:00–21:00", pay: "3 500 ₽",
      description: "Срочно нужен мойщик на смену. Не вышел сотрудник.", urgent: true,
      status: "active", createdAt: "2026-02-19T07:00:00Z", responses: [],
    },
    {
      id: "gig2", authorId: "spec1", authorName: "Алексей Кузнецов", type: "specialist",
      title: "Готов к подработке — полировка", city: "Москва", district: "Любой",
      date: "Свободен в эту пятницу", pay: "Договорная",
      description: "Мастер-полировщик с 5-летним опытом. Сертифицирован.", urgent: false,
      status: "active", createdAt: "2026-02-19T06:00:00Z", responses: [],
    },
  ];
  set(KEYS.GIGS, seedGigs);

  // Seed client orders
  const seedOrders: ClientOrder[] = [
    {
      id: "ord1", clientId: "client1", clientName: "Владимир Автолюбов",
      service: "Комплексная мойка + химчистка салона", city: "Москва", district: "Юго-Западный",
      preferredDate: "22 февраля 2026, 14:00", budget: "от 5 000 ₽",
      description: "Нужна комплексная мойка кузова и химчистка салона. Toyota Camry 2023.",
      carType: "Toyota Camry 2023", status: "active",
      createdAt: "2026-02-19T10:00:00Z", responses: [],
    },
    {
      id: "ord2", clientId: "client1", clientName: "Владимир Автолюбов",
      service: "Полировка кузова + керамика", city: "Москва", district: "Центральный",
      preferredDate: "25 февраля 2026", budget: "до 30 000 ₽",
      description: "BMW X5 2024, чёрный. Много мелких царапин. Полировка + керамика.",
      carType: "BMW X5 2024", status: "active",
      createdAt: "2026-02-19T08:00:00Z", responses: [],
    },
  ];
  set(KEYS.CLIENT_ORDERS, seedOrders);

  // Seed promos
  const seedPromos: Promo[] = [
    {
      id: "promo1", creatorId: "emp1", companyName: "CoffeePoint", partner: "CoffeePoint", category: "Кафе",
      title: "Скидка 15% на кофе", description: "Покажите промокод в любой кофейне CoffeePoint.",
      discount: "15%", code: "DETAIL15", validUntil: "2026-03-31", maxUses: 100, isActive: true, isExclusive: true, usedBy: [],
    },
    {
      id: "promo2", creatorId: "emp1", companyName: "AutoShine Studio", partner: "AutoShine Studio", category: "Автомойка",
      title: "Каждая 5-я мойка бесплатно", description: "Для зарегистрированных пользователей.",
      discount: "Бесплатно", code: "SHINE5FREE", validUntil: "2026-12-31", maxUses: 50, isActive: true, isExclusive: false, usedBy: [],
    },
  ];
  set(KEYS.PROMOS, seedPromos);

  // Seed collective purchases
  const seedPurchases: CollectivePurchase[] = [
    {
      id: "cp1", supplierId: "sup1", supplierName: "Koch Chemie Россия",
      product: "Шампунь NanoMagic 1L", description: "Профессиональный шампунь для бесконтактной мойки.",
      targetVolume: 100, currentVolume: 73, unitPrice: "450 ₽", retailPrice: "650 ₽",
      deadline: "2026-02-28", participants: [
        { userId: "emp1", userName: "AutoShine Studio", quantity: 30, joinedAt: "2026-02-10T10:00:00Z" },
        { userId: "emp2", userName: "CleanCar Express", quantity: 25, joinedAt: "2026-02-11T10:00:00Z" },
        { userId: "emp3", userName: "Premium Detail", quantity: 18, joinedAt: "2026-02-12T10:00:00Z" },
      ], status: "active",
    },
  ];
  set(KEYS.COLLECTIVE_PURCHASES, seedPurchases);

  // Seed training enrollments (graduates)
  const seedTraining: TrainingEnrollment[] = [
    {
      id: "te1", userId: "spec1", userName: "Алексей Кузнецов", course: "Детейлер-универсал",
      status: "completed", enrolledAt: "2024-12-01T10:00:00Z", completedAt: "2025-01-15T10:00:00Z",
      certificateNumber: "UC-2025-001",
    },
    {
      id: "te2", userId: "spec2", userName: "Дмитрий Волков", course: "Мастер-полировщик",
      status: "completed", enrolledAt: "2024-12-01T10:00:00Z", completedAt: "2025-01-15T10:00:00Z",
      certificateNumber: "UC-2025-002",
    },
  ];
  set(KEYS.TRAINING_ENROLLMENTS, seedTraining);

  // Seed community chat messages
  const seedChatMsgs: ChatMessage[] = [
    { id: "cm1", chatId: 2, authorId: "spec1", authorName: "Алексей К.", authorRole: "specialist",
      text: "Привет всем! Кто-нибудь работал с новой пастой Koch A1100?", createdAt: "2026-02-19T09:00:00Z" },
    { id: "cm2", chatId: 2, authorId: "spec2", authorName: "Дмитрий В.", authorRole: "specialist",
      text: "Да, отличная паста. Хорошо убирает голограммы.", createdAt: "2026-02-19T09:05:00Z" },
    { id: "cm3", chatId: 7, authorId: "client1", authorName: "Владимир", authorRole: "client",
      text: "Подскажите, как часто нужно обновлять керамическое покрытие?", createdAt: "2026-02-19T10:00:00Z" },
    { id: "cm4", chatId: 7, authorId: "spec1", authorName: "Алексей К.", authorRole: "specialist",
      text: "Зависит от производителя. В среднем раз в 1-2 года при правильном уходе.", createdAt: "2026-02-19T10:10:00Z" },
  ];
  set(KEYS.CHAT_MESSAGES, seedChatMsgs);

  // Seed conversations
  const seedConvs: Conversation[] = [
    {
      id: "conv1", participantIds: ["emp1", "spec1"],
      participantNames: ["AutoShine Studio", "Алексей Кузнецов"],
      participantRoles: ["employer", "specialist"],
      lastMessage: "Здравствуйте! Мы рассмотрели ваше резюме.", lastMessageAt: "2026-02-19T14:35:00Z",
      unreadCount: { emp1: 0, spec1: 1 },
    },
  ];
  set(KEYS.CONVERSATIONS, seedConvs);

  const seedMsgs: Message[] = [
    {
      id: "msg1", conversationId: "conv1", senderId: "emp1", senderName: "AutoShine Studio",
      receiverId: "spec1", text: "Здравствуйте! Мы рассмотрели ваше резюме и хотели бы пригласить вас на собеседование.",
      createdAt: "2026-02-19T14:35:00Z", read: false,
    },
  ];
  set(KEYS.MESSAGES, seedMsgs);

  localStorage.setItem(KEYS.INITIALIZED, "true");
}
