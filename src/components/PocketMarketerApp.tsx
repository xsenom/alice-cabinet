import React, { useState } from "react";

// Карманный маркетолог: мастер воронок и контента
// Однофайловый React-компонент. Использует Tailwind для оформления.
// Теперь шаги оформлены как отдельные "окна регистрации" + можно добавить видео-инструкции.

type Role =
    | "Эксперт"
    | "Предприниматель"
    | "SMM-специалист/маркетолог"
    | "Личный бренд (блогер)";

type ProductType =
    | "Консультации/сессии"
    | "Онлайн-курс/наставничество"
    | "Подписка/закрытый клуб"
    | "Оффлайн-услуги"
    | "Физический продукт/товар";

type Goal =
    | "Запустить новый продукт"
    | "Стабильно продавать текущие продукты"
    | "Набрать базу/лиды"
    | "Поднять охваты и доверие";

type Platform =
    | "Telegram"
    | "VK"
    | "Instagram"
    | "YouTube"
    | "Другое";

type FormData = {
    role: Role | "";
    niche: string;
    productType: ProductType | "";
    productName: string;
    avgCheck: string;
    goal: Goal | "";
    timeHorizon: string;
    platforms: Platform[];
    frequency: string;
    tone: string;
    // Видео по шагам (опционально)
    videoIntro: string; // шаг 1 — кто я
    videoProduct: string; // шаг 2 — продукт
    videoGoal: string; // шаг 3 — цель и тон
    videoPlatforms: string; // шаг 4 — соцсети
};

type FunnelSuggestion = {
    name: string;
    subtitle: string;
    steps: string[];
    contentMix: string[];
    weeklyPlan: string[];
    tips: string[];
};

const STEPS = [
    { id: 1, label: "Кто я" },
    { id: 2, label: "Продукт / услуга" },
    { id: 3, label: "Цель контента" },
    { id: 4, label: "Соцсети" },
    { id: 5, label: "Результат" },
];

const initialForm: FormData = {
    role: "",
    niche: "",
    productType: "",
    productName: "",
    avgCheck: "",
    goal: "",
    timeHorizon: "30 дней",
    platforms: ["Telegram"],
    frequency: "5–7 раз в неделю",
    tone: "дружелюбный, экспертный",
    videoIntro: "",
    videoProduct: "",
    videoGoal: "",
    videoPlatforms: "",
};

function togglePlatform(list: Platform[], value: Platform): Platform[] {
    return list.includes(value)
        ? list.filter((p) => p !== value)
        : [...list, value];
}

function generateFunnelSuggestion(data: FormData): FunnelSuggestion {
    const isTelegramMain = data.platforms.includes("Telegram");

    let name = "Базовая контент-воронка";
    let subtitle = "Мягкий прогрев и стабильные заявки через контент";

    if (data.goal === "Запустить новый продукт") {
        name = "Прогрев + запуск за 30 дней";
        subtitle = "Контент-воронка к запуску: интерес → доверие → прогрев → старт продаж";
    } else if (data.goal === "Набрать базу/лиды") {
        name = "Лидогенерационная воронка через гайд/чек-лист";
        subtitle = "Фокус на подписке в базу и сбор контактов под ваши запуски";
    } else if (data.goal === "Поднять охваты и доверие") {
        name = "Воронка доверия и охватов";
        subtitle = "Личный бренд + экспертность, чтобы стать своим человеком для аудитории";
    }

    if (data.productType === "Подписка/закрытый клуб") {
        name = "Подписка / закрытый клуб через Telegram-воронку";
        subtitle = "Постоянный прогрев к ежемесячным платежам и удержание участников";
    }

    const steps: string[] = [];

    // Шаги воронки (верхнеуровневые)
    if (data.goal === "Набрать базу/лиды") {
        steps.push(
            "1. Лид-магнит: гайд, чек-лист или мини-урок по главной боли вашей ЦА",
            isTelegramMain
                ? "2. Окно регистрации в Telegram-боте: человек оставляет контакты и получает материал"
                : "2. Окно регистрации на лендинге или в форме: человек оставляет контакты и получает материал",
            "3. Серия касаний: 3–5 писем/постов с историями, кейсами и полезными примерами",
            "4. Мягкое предложение основного продукта с ограничением по времени или количеству мест",
        );
    } else if (data.goal === "Запустить новый продукт") {
        steps.push(
            "1. Анонс: объявляете тему и идею продукта, собираете интерес через опросы",
            "2. Прогрев: 7–14 дней сторителлинга, пользы и разборов кейсов",
            "3. Окно регистрации: мини-лендинг или бот с заявкой на участие / список ожидания",
            "4. Старт продаж: ограниченное предложение, бонусы первым, социальное доказательство",
            "5. Допродажи и удержание: кейсы, ответы на возражения, повторные касания",
        );
    } else {
        steps.push(
            "1. Базовый встречающий контент: пост обо мне, чем могу быть полезен, как со мной связаться",
            "2. Ежедневный контент: чередование пользы, личного и продаж",
            "3. Простое окно регистрации: закреплённый пост/бот/форма для заявок",
            "4. Дайджест раз в неделю: сбор ключевых материалов и повтор приглашения в воронку",
        );
    }

    const contentMix: string[] = [
        "40% — полезно-экспертный контент (разборы, инструкции, чек-листы)",
        "30% — личный и сторителлинг (ваш путь, ценности, закулисье продукта)",
        "20% — продающий контент (кейсы, офферы, разбор возражений)",
        "10% — виральный контент (подборки, карусели, списки сервисов / идей)",
    ];

    if (data.goal === "Поднять охваты и доверие") {
        contentMix[0] = "35% — полезно-экспертный контент";
        contentMix[1] = "35% — личный и сторителлинг";
        contentMix[3] = "20% — виральный контент";
    }

    const weeklyPlan: string[] = [
        "Понедельник — большой экспертный пост или карусель по главной боли недели",
        "Вторник — сторителлинг: история клиента или ваш личный путь, связанный с продуктом",
        "Среда — мягкая продающая единица: кейс, отзыв, до/после, разбор ошибок",
        "Четверг — виральный формат: чек-лист, список сервисов, мини-гайд, который хочется переслать",
        "Пятница — живой формат: опрос, Q&A, разбор вопросов из комментариев/бота",
        "Суббота — лёгкий личный или закулисный пост, чтобы усиливать доверие",
        "Воскресенье — дайджест недели + повтор приглашения в основную воронку/окно регистрации",
    ];

    const tips: string[] = [
        "Сделайте одну понятную точку входа: закреплённый пост или кнопку в боте с текстом ‘Записаться’.",
        "Каждый продающий пост завершайте простым CTA: ‘Напишите слово СТАРТ в бот’ или ‘Оставьте заявку по кнопке’.",
        "Раз в неделю пересматривайте контент: что сохранили, переслали и на что пришли заявки — усиливайте это.",
    ];

    return { name, subtitle, steps, contentMix, weeklyPlan, tips };
}

const Badge: React.FC<{ active?: boolean; children: React.ReactNode }> = ({
                                                                              active,
                                                                              children,
                                                                          }) => (
    <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border backdrop-blur-sm transition ${
            active
                ? "bg-emerald-500/10 border-emerald-400/70 text-emerald-200"
                : "bg-slate-900/40 border-slate-600/60 text-slate-200"
        }`}
    >
    {children}
  </span>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
                                                                                 title,
                                                                                 children,
                                                                             }) => (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
        <h2 className="mb-3 text-sm font-semibold tracking-[0.16em] uppercase text-slate-200/80">
            {title}
        </h2>
        <div className="space-y-4 text-sm text-slate-100/90">{children}</div>
    </section>
);

const InputLabel: React.FC<{ label: string; hint?: string }> = ({
                                                                    label,
                                                                    hint,
                                                                }) => (
    <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-200/90">{label}</span>
        {hint && <span className="text-[10px] text-slate-400/90">{hint}</span>}
    </div>
);

const VideoField: React.FC<{
    value: string;
    onChange: (value: string) => void;
}> = ({ value, onChange }) => (
    <div className="space-y-2">
        <InputLabel
            label="Видео-инструкция (опционально)"
            hint="Вставьте ссылку на YouTube / Telegram-ролик, который объясняет шаг"
        />
        <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const PocketMarketerApp: React.FC = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [form, setForm] = useState<FormData>(initialForm);
    const [copied, setCopied] = useState(false);

    const currentStep = STEPS[stepIndex];
    const suggestion = generateFunnelSuggestion(form);
    const totalSteps = STEPS.length;
    const isLastStep = stepIndex === totalSteps - 1;

    const nextStep = () => {
        if (stepIndex < totalSteps - 1) {
            setStepIndex((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        setStepIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleCopyPlan = async () => {
        const textLines: string[] = [
            `Название воронки: ${suggestion.name}`,
            suggestion.subtitle,
            "",
            "Шаги воронки:",
            ...suggestion.steps,
            "",
            "Контент-микс:",
            ...suggestion.contentMix,
            "",
            "План на неделю:",
            ...suggestion.weeklyPlan,
            "",
            "Советы:",
            ...suggestion.tips,
        ];

        const videoLines: string[] = [];
        if (form.videoIntro) videoLines.push(`Шаг 1 — кто я: ${form.videoIntro}`);
        if (form.videoProduct)
            videoLines.push(`Шаг 2 — продукт: ${form.videoProduct}`);
        if (form.videoGoal) videoLines.push(`Шаг 3 — цель: ${form.videoGoal}`);
        if (form.videoPlatforms)
            videoLines.push(`Шаг 4 — соцсети: ${form.videoPlatforms}`);

        if (videoLines.length) {
            textLines.push("", "Видео по шагам:", ...videoLines);
        }

        const textBlock = textLines.join("");

        try {
            await navigator.clipboard.writeText(textBlock);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep.id) {
            case 1:
                return (
                    <SectionCard title="Шаг 1. Кто вы и чем занимаетесь?">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <InputLabel label="Роль" hint="Кем вы себя позиционируете сейчас" />
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {([
                                            "Эксперт",
                                            "Предприниматель",
                                            "SMM-специалист/маркетолог",
                                            "Личный бренд (блогер)",
                                        ] as Role[]).map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, role }))}
                                                className={`rounded-2xl border px-3 py-2 text-left text-xs transition hover:border-emerald-400/70 hover:bg-emerald-500/5 ${
                                                    form.role === role
                                                        ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-100"
                                                        : "border-white/10 bg-slate-900/40 text-slate-100/90"
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel
                                        label="Ниша / тема"
                                        hint="Например: нутрициолог для мам, чат-боты для бизнеса, школа английского"
                                    />
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
                                        placeholder="Опишите, с кем и о чём вы работаете"
                                        value={form.niche}
                                        onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <VideoField
                                value={form.videoIntro}
                                onChange={(value) => setForm((f) => ({ ...f, videoIntro: value }))}
                            />
                        </div>
                    </SectionCard>
                );

            case 2:
                return (
                    <SectionCard title="Шаг 2. Продукт / услуга">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <InputLabel
                                        label="Формат продукта"
                                        hint="Выберите основной формат, который хотите продвигать первым"
                                    />
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {([
                                            "Консультации/сессии",
                                            "Онлайн-курс/наставничество",
                                            "Подписка/закрытый клуб",
                                            "Оффлайн-услуги",
                                            "Физический продукт/товар",
                                        ] as ProductType[]).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, productType: type }))}
                                                className={`rounded-2xl border px-3 py-2 text-left text-xs transition hover:border-emerald-400/70 hover:bg-emerald-500/5 ${
                                                    form.productType === type
                                                        ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-100"
                                                        : "border-white/10 bg-slate-900/40 text-slate-100/90"
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel
                                        label="Название продукта"
                                        hint="Как вы называете своё главное предложение?"
                                    />
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
                                        placeholder="Например: Практикум по чат-ботам, Закрытый клуб нутрициолога"
                                        value={form.productName}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, productName: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        label="Средний чек"
                                        hint="Можно указать вилку или один тариф"
                                    />
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
                                        placeholder="Например: 3 000 ₽ / 15 000 ₽ / 50 000 ₽"
                                        value={form.avgCheck}
                                        onChange={(e) => setForm((f) => ({ ...f, avgCheck: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <VideoField
                                value={form.videoProduct}
                                onChange={(value) => setForm((f) => ({ ...f, videoProduct: value }))}
                            />
                        </div>
                    </SectionCard>
                );

            case 3:
                return (
                    <SectionCard title="Шаг 3. Цель ведения контента сейчас">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <InputLabel label="Главная цель" hint="На ближайшие 30–60 дней" />
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {([
                                            "Запустить новый продукт",
                                            "Стабильно продавать текущие продукты",
                                            "Набрать базу/лиды",
                                            "Поднять охваты и доверие",
                                        ] as Goal[]).map((goal) => (
                                            <button
                                                key={goal}
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, goal }))}
                                                className={`rounded-2xl border px-3 py-2 text-left text-xs transition hover:border-emerald-400/70 hover:bg-emerald-500/5 ${
                                                    form.goal === goal
                                                        ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-100"
                                                        : "border-white/10 bg-slate-900/40 text-slate-100/90"
                                                }`}
                                            >
                                                {goal}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <InputLabel label="Горизонт планирования" />
                                        <input
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
                                            placeholder="Например: 30 дней, 90 дней"
                                            value={form.timeHorizon}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, timeHorizon: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            label="Тон общения"
                                            hint="Как вы хотите звучать для аудитории"
                                        />
                                        <input
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
                                            placeholder="Например: дружелюбный, живой, с юмором"
                                            value={form.tone}
                                            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <VideoField
                                value={form.videoGoal}
                                onChange={(value) => setForm((f) => ({ ...f, videoGoal: value }))}
                            />
                        </div>
                    </SectionCard>
                );

            case 4:
                return (
                    <SectionCard title="Шаг 4. Соцсети и частота контента">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <InputLabel label="Где вы ведёте контент" />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {([
                                            "Telegram",
                                            "VK",
                                            "Instagram",
                                            "YouTube",
                                            "Другое",
                                        ] as Platform[]).map((platform) => {
                                            const active = form.platforms.includes(platform);
                                            return (
                                                <button
                                                    key={platform}
                                                    type="button"
                                                    onClick={() =>
                                                        setForm((f) => ({
                                                            ...f,
                                                            platforms: togglePlatform(f.platforms, platform),
                                                        }))
                                                    }
                                                    className={`rounded-full border px-3 py-1 text-xs transition hover:border-emerald-400/70 hover:bg-emerald-500/5 ${
                                                        active
                                                            ? "border-emerald-400/80 bg-emerald-500/10 text-emerald-100"
                                                            : "border-white/10 bg-slate-900/40 text-slate-100/90"
                                                    }`}
                                                >
                                                    {platform}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <InputLabel
                                        label="Желаемая частота публикаций"
                                        hint="Реалистично для вас, а не ‘как надо’"
                                    />
                                    <input
                                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-0"
                                        placeholder="Например: 3–4 раза в неделю, 1 пост в день"
                                        value={form.frequency}
                                        onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <VideoField
                                value={form.videoPlatforms}
                                onChange={(value) =>
                                    setForm((f) => ({ ...f, videoPlatforms: value }))
                                }
                            />
                        </div>
                    </SectionCard>
                );

            case 5:
            default:
                return (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="lg:col-span-1 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-slate-900/80 to-slate-950/90 p-4 sm:p-6 shadow-[0_20px_60px_rgba(16,185,129,0.4)]">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h2 className="text-xs font-semibold tracking-[0.16em] uppercase text-emerald-100">
                                    Ваш профиль
                                </h2>
                                <Badge>Черновик воронки</Badge>
                            </div>
                            <div className="space-y-3 text-xs text-emerald-50/90">
                                <div>
                                    <p className="font-semibold text-sm">
                                        {form.role || "Роль не указана"}
                                    </p>
                                    <p className="text-emerald-100/80">
                                        {form.niche ||
                                            "Опишите свою нишу, чтобы рекомендации стали точнее"}
                                    </p>
                                </div>
                                <div className="border-t border-emerald-500/30 pt-3 space-y-1.5">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/80">
                                        Главный продукт
                                    </p>
                                    <p className="text-xs font-medium">
                                        {form.productName || "Название продукта"}
                                    </p>
                                    <p className="text-[11px] text-emerald-100/80">
                                        Формат: {form.productType || "—"}
                                    </p>
                                    {form.avgCheck && (
                                        <p className="text-[11px] text-emerald-100/80">
                                            Средний чек: {form.avgCheck}
                                        </p>
                                    )}
                                </div>
                                <div className="border-t border-emerald-500/30 pt-3 space-y-1.5">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/80">
                                        Цель & площадки
                                    </p>
                                    <p className="text-xs">
                                        Цель: {form.goal ||
                                        "уточните цель, чтобы увидеть точную воронку"}
                                    </p>
                                    <p className="text-[11px] text-emerald-100/80">
                                        Горизонт: {form.timeHorizon || "30 дней"}
                                    </p>
                                    <p className="text-[11px] text-emerald-100/80">
                                        Площадки: {form.platforms.join(", ")}
                                    </p>
                                    <p className="text-[11px] text-emerald-100/80">
                                        Частота: {form.frequency}
                                    </p>
                                </div>

                                {(form.videoIntro ||
                                    form.videoProduct ||
                                    form.videoGoal ||
                                    form.videoPlatforms) && (
                                    <div className="border-t border-emerald-500/30 pt-3 space-y-1.5">
                                        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/80">
                                            Видео по шагам
                                        </p>
                                        <ul className="space-y-1.5 text-[11px]">
                                            {form.videoIntro && (
                                                <li>
                                                    Шаг 1 — кто я: <span className="break-all">{form.videoIntro}</span>
                                                </li>
                                            )}
                                            {form.videoProduct && (
                                                <li>
                                                    Шаг 2 — продукт: <span className="break-all">{form.videoProduct}</span>
                                                </li>
                                            )}
                                            {form.videoGoal && (
                                                <li>
                                                    Шаг 3 — цель: <span className="break-all">{form.videoGoal}</span>
                                                </li>
                                            )}
                                            {form.videoPlatforms && (
                                                <li>
                                                    Шаг 4 — соцсети: <span className="break-all">{form.videoPlatforms}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="lg:col-span-2 space-y-4">
                            <SectionCard title="Рекомендуемая воронка">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-50">
                                            {suggestion.name}
                                        </p>
                                        <p className="text-xs text-slate-300/90">
                                            {suggestion.subtitle}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                        {suggestion.steps.map((step, idx) => (
                                            <div key={idx} className="flex gap-2">
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-emerald-400/70 text-[10px] text-emerald-200">
                          {idx + 1}
                        </span>
                                                <p className="text-slate-100/90">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SectionCard>

                            <div className="grid gap-4 md:grid-cols-2">
                                <SectionCard title="Контент-микс">
                                    <ul className="space-y-1.5 text-xs">
                                        {suggestion.contentMix.map((item, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400/80" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </SectionCard>

                                <SectionCard title="План на неделю">
                                    <ul className="space-y-1.5 text-xs">
                                        {suggestion.weeklyPlan.map((item, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-sm bg-slate-400/80" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </SectionCard>
                            </div>

                            <SectionCard title="Как использовать этого карманного маркетолога">
                                <div className="space-y-2 text-xs">
                                    <ul className="space-y-1.5">
                                        {suggestion.tips.map((tip, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400/80" />
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={handleCopyPlan}
                                        className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-emerald-400/80 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-50 shadow-[0_14px_40px_rgba(16,185,129,0.4)] transition hover:-translate-y-px hover:bg-emerald-400/20"
                                    >
                                        <span>{copied ? "План скопирован" : "Скопировать план себе"}</span>
                                    </button>
                                </div>
                            </SectionCard>
                        </section>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_0%_0%,rgba(45,212,191,0.13),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(129,140,248,0.32),transparent_60%)] text-slate-50">
            <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 pb-10 pt-6 sm:pt-10">
                <header className="flex flex-col gap-3">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-100/90 shadow-[0_12px_40px_rgba(16,185,129,0.55)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                            Карманный маркетолог
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                            Регистрация проекта: от профиля до воронки
                        </h1>
                        <p className="mt-1 max-w-xl text-xs text-slate-300">
                            Заполните 4 окна регистрации: кто вы, ваш продукт, цель контента и соцсети. На каждом шаге
                            можно прикрепить ссылку на видео-инструкцию. На финальном шаге вас ждёт черновик воронки и
                            контент-план.
                        </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300/90">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                            Шаг {currentStep.id} из {totalSteps}
                        </div>
                        <div className="hidden items-center gap-2 sm:flex">
                            <Badge>1 проект = 1 воронка</Badge>
                            <Badge>Подходит под Telegram и соцсети</Badge>
                        </div>
                    </div>
                </header>

                <main className="space-y-4">
                    {renderStepContent()}

                    <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300/90">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={stepIndex === 0}
                            className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-1.5 font-medium text-slate-100/90 shadow-[0_14px_40px_rgba(15,23,42,0.9)] transition hover:-translate-y-px hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:border-slate-700/60 disabled:bg-slate-900/40 disabled:text-slate-500"
                        >
                            ← Назад
                        </button>
                        <div className="flex flex-1 justify-end gap-2">
                            {!isLastStep && (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/80 bg-emerald-500/15 px-4 py-1.5 text-[11px] font-semibold text-emerald-50 shadow-[0_18px_50px_rgba(16,185,129,0.5)] transition hover:-translate-y-px hover:bg-emerald-400/25"
                                >
                                    <span>Далее</span>
                                    <span className="text-xs">→</span>
                                </button>
                            )}
                            {isLastStep && (
                                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-1.5 text-[11px] text-emerald-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                    Черновик воронки обновляется по вашим ответам
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PocketMarketerApp;
