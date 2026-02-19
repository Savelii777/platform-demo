#!/usr/bin/env python3
"""Append remaining dashboard content to page.tsx"""

FILEPATH = '/Users/savelii/expotion-tz/detailing-platform/src/app/dashboard/page.tsx'

CONTENT = r'''                  <Link href="/specialists" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Users size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Найти специалиста</span>
                      <span className="text-[10px] text-muted">Каталог мастеров</span>
                    </div>
                  </Link>
                  <Link href="/orders" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><ShoppingBag size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Заказы клиентов</span>
                      <span className="text-[10px] text-muted">Биржа заказов</span>
                    </div>
                  </Link>
                </div>
              </Section>

              {/* Subscription */}
              <Section title="Подписка">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{planLabel(user.plan)}</span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">{user.plan || "free"}</span>
                </div>
                <p className="text-xs text-muted mb-3">
                  {"Вакансий: " + myVacancies.length + "/" + (user.plan === "premium" ? "∞" : user.plan === "standard" ? "10" : "3") + " · Суб-аккаунтов: " + (user.subAccounts || []).length + "/" + (user.plan === "premium" ? "∞" : user.plan === "standard" ? "3" : "0")}
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors">Улучшить план</button>
              </Section>

              {/* Recent vacancies */}
              {myVacancies.length > 0 && (
                <Section title="Последние вакансии">
                  <div className="space-y-3">
                    {myVacancies.slice(0, 3).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                        <div>
                          <span className="text-sm font-medium block">{v.title}</span>
                          <span className="text-xs text-muted">{v.city} · {v.salary} · {fmtDate(v.createdAt)}</span>
                        </div>
                        {statusBadge(v.status)}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Recent applications */}
              {allApplications.length > 0 && (
                <Section title="Последние отклики">
                  <div className="space-y-3">
                    {allApplications.slice(0, 5).map((a) => {
                      const applicant = authService.getUser(a.applicantId);
                      return (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                          <div>
                            <span className="text-sm font-medium block">{applicant?.name || "Специалист"}</span>
                            <span className="text-xs text-muted">{fmtDate(a.appliedAt)}</span>
                          </div>
                          {statusBadge(a.status)}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* ── Profile Tab ── */}
          {empTab === "profile" && (
            <Section title="Профиль компании">
              {isEditing ? (
                <div className="space-y-4">
                  <EditField label="Название" field="name" editData={editData} setEditData={setEditData} />
                  <EditField label="Город" field="city" editData={editData} setEditData={setEditData} />
                  <EditField label="Телефон" field="phone" editData={editData} setEditData={setEditData} />
                  <EditTextarea label="Описание" field="about" editData={editData} setEditData={setEditData} />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors">Сохранить</button>
                    <button onClick={cancelEditing} className="px-5 py-2 bg-surface border border-border rounded-full text-sm font-medium hover:border-primary/30 transition-colors">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm"><span className="text-muted">Название:</span> {user.name}</p>
                      <p className="text-sm"><span className="text-muted">Город:</span> {user.city || "—"}</p>
                      <p className="text-sm"><span className="text-muted">Телефон:</span> {user.phone || "—"}</p>
                      <p className="text-sm"><span className="text-muted">О компании:</span> {user.about || "—"}</p>
                    </div>
                    <button onClick={startEditing} className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-muted hover:text-primary transition-colors"><Edit size={16} /></button>
                  </div>
                  {user.isVerified && (
                    <div className="flex items-center gap-2 text-sm text-emerald-400"><Shield size={16} /> Компания верифицирована</div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* ── Vacancies Tab ── */}
          {empTab === "vacancies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Мои вакансии ({myVacancies.length})</h3>
                <Link href="/vacancies" className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"><Plus size={14} /> Создать</Link>
              </div>
              {myVacancies.length === 0 && <p className="text-sm text-muted text-center py-8">У вас пока нет вакансий.</p>}
              {myVacancies.map((v) => {
                const apps = v.applications || [];
                return (
                  <div key={v.id} className="p-5 rounded-2xl bg-card border border-border card-glow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{v.title}</h4>
                        <p className="text-xs text-muted">{v.city} · {v.salary} · {fmtDate(v.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(v.status)}
                        <button onClick={() => deleteVacancy(v.id)} className="p-2 rounded-lg bg-surface hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {apps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted mb-2">Отклики ({apps.length}):</p>
                        <div className="space-y-2">
                          {apps.map((a: any) => {
                            const applicant = authService.getUser(a.applicantId);
                            return (
                              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-surface">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                    {applicant?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium block">{applicant?.name || "Специалист"}</span>
                                    <span className="text-[10px] text-muted">{a.coverLetter?.slice(0, 60) || "—"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {a.status === "pending" ? (
                                    <>
                                      <button onClick={() => { vacancyService.updateApplicationStatus(v.id, a.id, "accepted"); loadData(); }} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium hover:bg-emerald-500/20 transition-colors">Принять</button>
                                      <button onClick={() => { vacancyService.updateApplicationStatus(v.id, a.id, "rejected"); loadData(); }} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-[10px] font-medium hover:bg-red-500/20 transition-colors">Отклонить</button>
                                    </>
                                  ) : statusBadge(a.status)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Gigs Tab ── */}
          {empTab === "gigs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Мои подработки ({myGigs.length})</h3>
                <Link href="/gigs" className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"><Plus size={14} /> Создать</Link>
              </div>
              {myGigs.length === 0 && <p className="text-sm text-muted text-center py-8">У вас пока нет подработок.</p>}
              {myGigs.map((g) => (
                <div key={g.id} className="p-5 rounded-2xl bg-card border border-border card-glow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{g.title}</h4>
                      <p className="text-xs text-muted">{g.city} · {g.payment} · {fmtDate(g.date)}</p>
                      <p className="text-sm text-muted mt-1">{g.description}</p>
                    </div>
                    <button onClick={() => deleteGig(g.id)} className="p-2 rounded-lg bg-surface hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  {(g.responses || []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted mb-2">Отклики ({g.responses.length}):</p>
                      {g.responses.map((r: any) => {
                        const resp = authService.getUser(r.specialistId);
                        return (
                          <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-surface">
                            <span className="text-sm">{resp?.name || "Специалист"}</span>
                            <span className="text-xs text-muted">{fmtDate(r.respondedAt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Promos Tab ── */}
          {empTab === "promos" && (
            <div className="space-y-4">
              <Section title="Промоакции">
                <div className="space-y-3">
                  {promos.filter((p) => p.createdBy === user.id).length === 0 && <p className="text-sm text-muted">У вас пока нет промоакций.</p>}
                  {promos.filter((p) => p.createdBy === user.id).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                      <div>
                        <span className="text-sm font-medium block">{p.code}</span>
                        <span className="text-xs text-muted">{p.description} · Скидка: {p.discountPercent}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted block">{"Исп.: " + p.usedCount + "/" + (p.maxUses ?? "∞")}</span>
                        <span className={`text-[10px] ${p.isActive ? "text-emerald-400" : "text-muted"}`}>{p.isActive ? "Активна" : "Неактивна"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              <Link href="/promos" className="inline-flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Создать промоакцию</Link>
            </div>
          )}

          {/* ── Subaccounts Tab ── */}
          {empTab === "subaccounts" && (
            <Section title="Суб-аккаунты">
              {(user.subAccounts || []).length === 0 && <p className="text-sm text-muted mb-4">У вас пока нет суб-аккаунтов.</p>}
              <div className="space-y-3 mb-4">
                {(user.subAccounts || []).map((sa) => (
                  <div key={sa.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                    <div>
                      <span className="text-sm font-medium block">{sa.name}</span>
                      <span className="text-xs text-muted">{sa.role} · {sa.email}</span>
                    </div>
                    <button onClick={() => removeSubAccount(sa.id)} className="p-2 rounded-lg bg-surface hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input id="sa-name" placeholder="Имя" className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm" />
                <input id="sa-email" placeholder="Email" className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm" />
                <select id="sa-role" className="px-3 py-2 bg-surface border border-border rounded-lg text-sm">
                  <option value="manager">Менеджер</option>
                  <option value="viewer">Наблюдатель</option>
                </select>
                <button onClick={() => {
                  const n = (document.getElementById("sa-name") as HTMLInputElement).value;
                  const e = (document.getElementById("sa-email") as HTMLInputElement).value;
                  const r = (document.getElementById("sa-role") as HTMLSelectElement).value as "manager" | "viewer";
                  if (n && e) addSubAccount(n, e, r);
                }} className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors">Добавить</button>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ════════════════════ SPECIALIST ════════════════════ */}
      {user.role === "specialist" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Панель специалиста</h1>
              <p className="text-sm text-muted mt-1">{user.name} · {user.specialization || "Не указана"}</p>
            </div>
            {user.isCertified && (
              <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={14} /> Сертифицирован</span>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Отклики" value={allApplications.length} icon={FileText} color="text-primary" />
            <StatCard label="Рейтинг" value={user.rating || 0} icon={Star} color="text-yellow-400" />
            <StatCard label="Сообщений" value={unreadMessages} icon={MessageSquare} color="text-amber-400" />
            <StatCard label="Портфолио" value={(user.portfolio || []).length} icon={Eye} color="text-blue-400" />
          </div>

          <TabBar
            tabs={[
              { key: "overview" as SpecialistTab, label: "Обзор" },
              { key: "profile" as SpecialistTab, label: "Профиль" },
              { key: "applications" as SpecialistTab, label: "Мои отклики" },
              { key: "gigs" as SpecialistTab, label: "Подработки" },
              { key: "training" as SpecialistTab, label: "Обучение" },
              { key: "reviews" as SpecialistTab, label: "Отзывы" },
              { key: "portfolio" as SpecialistTab, label: "Портфолио" },
            ]}
            active={specTab}
            onChange={setSpecTab}
          />

          {/* spec overview */}
          {specTab === "overview" && (
            <div className="space-y-6">
              <Section title="Быстрые действия">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link href="/vacancies" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Briefcase size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Вакансии</span>
                      <span className="text-[10px] text-muted">Найти работу</span>
                    </div>
                  </Link>
                  <Link href="/gigs" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Zap size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Подработки</span>
                      <span className="text-[10px] text-muted">Быстрый заработок</span>
                    </div>
                  </Link>
                  <Link href="/training" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Award size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Обучение</span>
                      <span className="text-[10px] text-muted">Сертификация</span>
                    </div>
                  </Link>
                </div>
              </Section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <h4 className="text-sm font-medium mb-1">Статус</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${user.isLookingForJob ? "bg-emerald-500/10 text-emerald-400" : "bg-surface text-muted"}`}>
                      {user.isLookingForJob ? "Ищу работу" : "Не ищу работу"}
                    </span>
                    <button onClick={() => toggleStatus("isLookingForJob")} className="text-[10px] text-primary hover:underline">Переключить</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${user.isAvailableForGigs ? "bg-amber-500/10 text-amber-400" : "bg-surface text-muted"}`}>
                      {user.isAvailableForGigs ? "Готов к подработке" : "Не готов к подработке"}
                    </span>
                    <button onClick={() => toggleStatus("isAvailableForGigs")} className="text-[10px] text-primary hover:underline">Переключить</button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="text-sm font-medium mb-1">Сертификация</h4>
                  {user.isCertified ? (
                    <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Вы сертифицированы</p>
                  ) : (
                    <>
                      <p className="text-xs text-muted mb-2">Пройдите обучение и получите надбавку +10 000 ₽</p>
                      <Link href="/training" className="text-xs text-primary hover:underline">Пройти обучение →</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* spec profile */}
          {specTab === "profile" && (
            <Section title="Мой профиль">
              {isEditing ? (
                <div className="space-y-4">
                  <EditField label="Имя" field="name" editData={editData} setEditData={setEditData} />
                  <EditField label="Специализация" field="specialization" editData={editData} setEditData={setEditData} />
                  <EditField label="Город" field="city" editData={editData} setEditData={setEditData} />
                  <EditField label="Телефон" field="phone" editData={editData} setEditData={setEditData} />
                  <EditField label="Опыт (лет)" field="experience" editData={editData} setEditData={setEditData} />
                  <EditField label="Желаемая ЗП" field="expectedSalary" editData={editData} setEditData={setEditData} />
                  <EditTextarea label="О себе" field="about" editData={editData} setEditData={setEditData} />
                  <EditSkills editData={editData} setEditData={setEditData} />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors">Сохранить</button>
                    <button onClick={cancelEditing} className="px-5 py-2 bg-surface border border-border rounded-full text-sm font-medium hover:border-primary/30 transition-colors">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm"><span className="text-muted">Имя:</span> {user.name}</p>
                      <p className="text-sm"><span className="text-muted">Специализация:</span> {user.specialization || "—"}</p>
                      <p className="text-sm"><span className="text-muted">Город:</span> {user.city || "—"}</p>
                      <p className="text-sm"><span className="text-muted">Телефон:</span> {user.phone || "—"}</p>
                      <p className="text-sm"><span className="text-muted">Опыт:</span> {user.experience ? user.experience + " лет" : "—"}</p>
                      <p className="text-sm"><span className="text-muted">Желаемая ЗП:</span> {user.expectedSalary || "—"}</p>
                      <p className="text-sm"><span className="text-muted">О себе:</span> {user.about || "—"}</p>
                    </div>
                    <button onClick={startEditing} className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-muted hover:text-primary transition-colors"><Edit size={16} /></button>
                  </div>
                  {(user.skills || []).length > 0 && (
                    <div>
                      <p className="text-xs text-muted mb-2">Навыки:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills!.map((s) => (
                          <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* spec applications */}
          {specTab === "applications" && (
            <Section title="Мои отклики">
              {allApplications.length === 0 && <p className="text-sm text-muted">Вы пока не откликались на вакансии.</p>}
              <div className="space-y-3">
                {allApplications.map((a) => {
                  const vac = vacancyService.getById(a.vacancyId);
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                      <div>
                        <span className="text-sm font-medium block">{vac?.title || "Вакансия"}</span>
                        <span className="text-xs text-muted">{vac?.company || ""} · {fmtDate(a.appliedAt)}</span>
                        {a.coverLetter && <p className="text-xs text-muted mt-1">{a.coverLetter.slice(0, 80)}…</p>}
                      </div>
                      {statusBadge(a.status)}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* spec gigs */}
          {specTab === "gigs" && (
            <Section title="Доступные подработки">
              {gigs.length === 0 && <p className="text-sm text-muted">Нет доступных подработок.</p>}
              <div className="space-y-3">
                {gigs.map((g) => {
                  const alreadyResponded = (g.responses || []).some((r: any) => r.specialistId === user.id);
                  return (
                    <div key={g.id} className="p-4 rounded-xl bg-surface border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{g.title}</h4>
                          <p className="text-xs text-muted">{g.city} · {g.payment} · {fmtDate(g.date)}</p>
                          <p className="text-xs text-muted mt-1">{g.description}</p>
                        </div>
                        {alreadyResponded ? (
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px]">Откликнулись</span>
                        ) : (
                          <button onClick={() => { gigService.respond(g.id, user.id); loadData(); }} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium hover:bg-primary/20 transition-colors">Откликнуться</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* spec training */}
          {specTab === "training" && (
            <Section title="Моё обучение">
              {enrollments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted mb-3">Вы ещё не записаны на обучение.</p>
                  <Link href="/training" className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors inline-block">Записаться</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                      <div>
                        <span className="text-sm font-medium block">{e.courseName}</span>
                        <span className="text-xs text-muted">Записан: {fmtDate(e.enrolledAt)}</span>
                        {e.completedAt && <span className="text-xs text-emerald-400 block">Завершено: {fmtDate(e.completedAt)}</span>}
                      </div>
                      {e.certificateId ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px]">Сертификат</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px]">В процессе</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* spec reviews */}
          {specTab === "reviews" && (
            <Section title="Отзывы обо мне">
              {myReviews.length === 0 ? (
                <p className="text-sm text-muted">У вас пока нет отзывов.</p>
              ) : (
                <div className="space-y-3">
                  {myReviews.map((r) => {
                    const author = authService.getUser(r.authorId);
                    return (
                      <div key={r.id} className="p-4 rounded-xl bg-surface">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{author?.name || "Пользователь"}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted">{r.text}</p>
                        <p className="text-[10px] text-muted mt-1">{fmtDate(r.createdAt)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {/* spec portfolio */}
          {specTab === "portfolio" && (
            <Section title="Портфолио">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {(user.portfolio || []).map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-surface border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <button onClick={() => removePortfolioItem(item.id)} className="p-1 text-muted hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </div>
                    <p className="text-xs text-muted">{item.description}</p>
                    {item.imageUrl && <div className="mt-2 h-32 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-xs text-muted">📷 {item.imageUrl}</div>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input id="pf-title" placeholder="Название" className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm" />
                <input id="pf-desc" placeholder="Описание" className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm" />
                <button onClick={() => {
                  const t = (document.getElementById("pf-title") as HTMLInputElement).value;
                  const d = (document.getElementById("pf-desc") as HTMLInputElement).value;
                  if (t) addPortfolioItem(t, d);
                }} className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors">Добавить</button>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* ════════════════════ CLIENT ════════════════════ */}
      {user.role === "client" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Панель клиента</h1>
          <p className="text-sm text-muted -mt-4">{user.name}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Мои заказы" value={clientOrders.length} icon={ShoppingBag} color="text-primary" />
            <StatCard label="Активные" value={clientOrders.filter((o) => o.status === "active").length} icon={Zap} color="text-emerald-400" />
            <StatCard label="Сообщений" value={unreadMessages} icon={MessageSquare} color="text-amber-400" />
            <StatCard label="Избранное" value={(user.favorites || []).length} icon={Heart} color="text-red-400" />
          </div>

          <TabBar
            tabs={[
              { key: "overview" as ClientTab, label: "Обзор" },
              { key: "profile" as ClientTab, label: "Профиль" },
              { key: "orders" as ClientTab, label: "Мои заказы" },
              { key: "favorites" as ClientTab, label: "Избранное" },
              { key: "history" as ClientTab, label: "История" },
            ]}
            active={clientTab}
            onChange={setClientTab}
          />

          {/* client overview */}
          {clientTab === "overview" && (
            <div className="space-y-6">
              <Section title="Быстрые действия">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link href="/orders" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Plus size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Создать заказ</span>
                      <span className="text-[10px] text-muted">Разместить заявку</span>
                    </div>
                  </Link>
                  <Link href="/companies" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Building2 size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Компании</span>
                      <span className="text-[10px] text-muted">Каталог автомоек</span>
                    </div>
                  </Link>
                  <Link href="/specialists" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Users size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Специалисты</span>
                      <span className="text-[10px] text-muted">Найти мастера</span>
                    </div>
                  </Link>
                </div>
              </Section>

              {clientOrders.filter((o) => o.status === "active").length > 0 && (
                <Section title="Активные заказы">
                  <div className="space-y-3">
                    {clientOrders.filter((o) => o.status === "active").slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                        <div>
                          <span className="text-sm font-medium block">{o.service}</span>
                          <span className="text-xs text-muted">{o.city} · {o.carBrand} {o.carModel} · {fmtDate(o.preferredDate)}</span>
                        </div>
                        <span className="text-sm text-primary font-medium">{o.budget}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* client profile */}
          {clientTab === "profile" && (
            <Section title="Мой профиль">
              {isEditing ? (
                <div className="space-y-4">
                  <EditField label="Имя" field="name" editData={editData} setEditData={setEditData} />
                  <EditField label="Город" field="city" editData={editData} setEditData={setEditData} />
                  <EditField label="Телефон" field="phone" editData={editData} setEditData={setEditData} />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors">Сохранить</button>
                    <button onClick={cancelEditing} className="px-5 py-2 bg-surface border border-border rounded-full text-sm font-medium hover:border-primary/30 transition-colors">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-muted">Имя:</span> {user.name}</p>
                    <p className="text-sm"><span className="text-muted">Город:</span> {user.city || "—"}</p>
                    <p className="text-sm"><span className="text-muted">Телефон:</span> {user.phone || "—"}</p>
                  </div>
                  <button onClick={startEditing} className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-muted hover:text-primary transition-colors"><Edit size={16} /></button>
                </div>
              )}
            </Section>
          )}

          {/* client orders */}
          {clientTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Мои заказы ({clientOrders.length})</h3>
                <Link href="/orders" className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"><Plus size={14} /> Создать</Link>
              </div>
              {clientOrders.length === 0 && <p className="text-sm text-muted text-center py-8">У вас пока нет заказов.</p>}
              {clientOrders.map((o) => (
                <div key={o.id} className="p-5 rounded-2xl bg-card border border-border card-glow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{o.service}</h4>
                      <p className="text-xs text-muted">{o.city} · {o.carBrand} {o.carModel} · {fmtDate(o.preferredDate)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-primary font-medium block">{o.budget}</span>
                      {statusBadge(o.status)}
                    </div>
                  </div>
                  <p className="text-sm text-muted">{o.description}</p>
                  {(o.responses || []).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted mb-2">Предложения ({o.responses.length}):</p>
                      <div className="space-y-2">
                        {o.responses.map((r: any) => {
                          const resp = authService.getUser(r.specialistId);
                          return (
                            <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-surface">
                              <div>
                                <span className="text-sm font-medium">{resp?.name || "Специалист"}</span>
                                <span className="text-xs text-muted block">{r.message?.slice(0, 60)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-primary mr-2">{r.price}</span>
                                {r.status === "pending" ? (
                                  <button onClick={() => { orderService.acceptResponse(o.id, r.id); loadData(); }} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium hover:bg-emerald-500/20 transition-colors">Принять</button>
                                ) : statusBadge(r.status)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* client favorites */}
          {clientTab === "favorites" && (
            <Section title="Избранное">
              {(user.favorites || []).length === 0 ? (
                <p className="text-sm text-muted">Вы ещё не добавили никого в избранное.</p>
              ) : (
                <div className="space-y-3">
                  {(user.favorites || []).map((fav) => {
                    const favUser = authService.getUser(fav.targetId);
                    return (
                      <div key={fav.targetId} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {favUser?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                          </div>
                          <div>
                            <span className="text-sm font-medium block">{favUser?.name || "Пользователь"}</span>
                            <span className="text-xs text-muted">{fav.targetType === "specialist" ? "Специалист" : "Компания"}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFavorite(fav.targetId)} className="p-2 text-red-400 hover:text-red-300 transition-colors"><Heart size={16} className="fill-red-400" /></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {/* client history */}
          {clientTab === "history" && (
            <Section title="История заказов">
              {clientOrders.filter((o) => o.status === "completed").length === 0 ? (
                <p className="text-sm text-muted">Нет завершённых заказов.</p>
              ) : (
                <div className="space-y-3">
                  {clientOrders.filter((o) => o.status === "completed").map((o) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                      <div>
                        <span className="text-sm font-medium block">{o.service}</span>
                        <span className="text-xs text-muted">{o.city} · {o.carBrand} {o.carModel}</span>
                      </div>
                      <span className="text-sm text-muted">{o.budget}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </div>
      )}

      {/* ════════════════════ SUPPLIER ════════════════════ */}
      {user.role === "supplier" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Панель поставщика</h1>
          <p className="text-sm text-muted -mt-4">{user.name}</p>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Закупки" value={collectivePurchases.length} icon={ShoppingBag} color="text-primary" />
            <StatCard label="Активные" value={collectivePurchases.filter((p) => p.status === "active").length} icon={Zap} color="text-emerald-400" />
            <StatCard label="Сообщений" value={unreadMessages} icon={MessageSquare} color="text-amber-400" />
          </div>

          <TabBar
            tabs={[
              { key: "overview" as SupplierTab, label: "Обзор" },
              { key: "profile" as SupplierTab, label: "Профиль" },
              { key: "purchases" as SupplierTab, label: "Закупки" },
              { key: "stats" as SupplierTab, label: "Статистика" },
            ]}
            active={supplierTab}
            onChange={setSupplierTab}
          />

          {/* supplier overview */}
          {supplierTab === "overview" && (
            <div className="space-y-6">
              <Section title="Быстрые действия">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/suppliers" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ShoppingBag size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Коллективные закупки</span>
                      <span className="text-[10px] text-muted">Создать или присоединиться</span>
                    </div>
                  </Link>
                  <Link href="/messages" className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><MessageSquare size={20} /></div>
                    <div>
                      <span className="text-sm font-medium block">Сообщения</span>
                      <span className="text-[10px] text-muted">Связь с партнёрами</span>
                    </div>
                  </Link>
                </div>
              </Section>

              {collectivePurchases.filter((p) => p.status === "active").length > 0 && (
                <Section title="Активные закупки">
                  <div className="space-y-3">
                    {collectivePurchases.filter((p) => p.status === "active").map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface">
                        <div>
                          <span className="text-sm font-medium block">{p.title}</span>
                          <span className="text-xs text-muted">{p.category} · {"Участников: " + p.participants.length + "/" + p.minParticipants}</span>
                        </div>
                        <span className="text-sm text-primary font-medium">{p.pricePerUnit}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* supplier profile */}
          {supplierTab === "profile" && (
            <Section title="Профиль поставщика">
              {isEditing ? (
                <div className="space-y-4">
                  <EditField label="Название" field="name" editData={editData} setEditData={setEditData} />
                  <EditField label="Город" field="city" editData={editData} setEditData={setEditData} />
                  <EditField label="Телефон" field="phone" editData={editData} setEditData={setEditData} />
                  <EditTextarea label="Описание" field="about" editData={editData} setEditData={setEditData} />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-hover transition-colors">Сохранить</button>
                    <button onClick={cancelEditing} className="px-5 py-2 bg-surface border border-border rounded-full text-sm font-medium hover:border-primary/30 transition-colors">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-muted">Название:</span> {user.name}</p>
                    <p className="text-sm"><span className="text-muted">Город:</span> {user.city || "—"}</p>
                    <p className="text-sm"><span className="text-muted">Телефон:</span> {user.phone || "—"}</p>
                    <p className="text-sm"><span className="text-muted">О компании:</span> {user.about || "—"}</p>
                  </div>
                  <button onClick={startEditing} className="p-2 rounded-lg bg-surface hover:bg-primary/10 text-muted hover:text-primary transition-colors"><Edit size={16} /></button>
                </div>
              )}
            </Section>
          )}

          {/* supplier purchases */}
          {supplierTab === "purchases" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Коллективные закупки ({collectivePurchases.length})</h3>
                <Link href="/suppliers" className="px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1"><Plus size={14} /> Создать</Link>
              </div>
              {collectivePurchases.length === 0 && <p className="text-sm text-muted text-center py-8">Нет коллективных закупок.</p>}
              {collectivePurchases.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-card border border-border card-glow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{p.title}</h4>
                      <p className="text-xs text-muted">{p.category} · {p.pricePerUnit} за ед.</p>
                    </div>
                    {statusBadge(p.status)}
                  </div>
                  <p className="text-sm text-muted">{p.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted mt-2">
                    <span>{"Участников: " + p.participants.length + "/" + p.minParticipants}</span>
                    <span>{"До: " + fmtDate(p.deadline)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* supplier stats */}
          {supplierTab === "stats" && (
            <Section title="Статистика">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface text-center">
                  <span className="text-2xl font-bold text-primary block">{collectivePurchases.length}</span>
                  <span className="text-xs text-muted">Всего закупок</span>
                </div>
                <div className="p-4 rounded-xl bg-surface text-center">
                  <span className="text-2xl font-bold text-emerald-400 block">{collectivePurchases.filter((p) => p.status === "completed").length}</span>
                  <span className="text-xs text-muted">Завершено</span>
                </div>
                <div className="p-4 rounded-xl bg-surface text-center">
                  <span className="text-2xl font-bold text-amber-400 block">{collectivePurchases.reduce((sum, p) => sum + p.participants.length, 0)}</span>
                  <span className="text-xs text-muted">Всего участников</span>
                </div>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Fallback */}
      {!["employer", "specialist", "client", "supplier"].includes(user.role) && (
        <div className="text-center py-12">
          <p className="text-muted">Неизвестная роль: {user.role}</p>
        </div>
      )}
    </div>
  );
}
'''

with open(FILEPATH, 'a') as f:
    f.write(CONTENT)

print("Done! Appended", len(CONTENT.splitlines()), "lines")
