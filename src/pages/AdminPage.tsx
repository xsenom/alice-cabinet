import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase/client";
import Button from "../components/ui/Button";

type Stats = {
    total: number;
    admins: number;
    free: number;
    paid1m: number;
    paid3m: number;
};

type VideoSection = "Главная" | "Библиотека";
type VideoAccess = "free" | "pro";

type VideoSlot = {
    id: string;
    section: VideoSection;
    title: string;
    filename: string;
    note: string;
};

type VideoGroupOption = {
    value: string;
    label: string;
    path: string;
};

type CustomVideoDraft = {
    title: string;
    group: string;
    slug: string;
    description: string;
    access: VideoAccess | "";
};

type UploadedCustomVideo = CustomVideoDraft & {
    access: VideoAccess;
    filePath: string;
    publicUrl: string;
};

const VIDEO_BUCKET = (import.meta.env.VITE_SUPABASE_VIDEOS_BUCKET as string | undefined)?.trim() || "videos";

const DEFAULT_VIDEO_GROUP_OPTIONS: VideoGroupOption[] = [
    { value: "miniapp", label: "Миниапп", path: "miniapp" },
    { value: "voronka", label: "Воронка", path: "voronka" },
    { value: "bots", label: "Боты", path: "bots" },
    { value: "ai", label: "AI", path: "ai" },
    { value: "prochee", label: "Прочее", path: "prochee" },
];

const VIDEO_SLOTS: VideoSlot[] = [
    {
        id: "home-how-to-use",
        section: "Главная",
        title: "Как пользоваться Lesik",
        filename: "how-to-use-lesik.mp4",
        note: "Быстрое онбординг-видео для новых пользователей.",
    },
    {
        id: "home-who-needs",
        section: "Главная",
        title: "Кому будет полезно",
        filename: "who-needs-lesik.mp4",
        note: "Короткий ролик с кейсами и пользой продукта.",
    },
    {
        id: "home-miniapp-pro",
        section: "Главная",
        title: "Mini App в Telegram (PRO)",
        filename: "miniapp-pro.mp4",
        note: "Платный ролик для витрины на главной странице.",
    },
    {
        id: "library-funnel-01",
        section: "Библиотека",
        title: "Воронки — урок 01",
        filename: "funnel-01.mp4",
        note: "Урок про продуктовую линейку.",
    },
    {
        id: "library-funnel-02",
        section: "Библиотека",
        title: "Воронки — урок 02",
        filename: "funnel-02.mp4",
        note: "Урок про прогревы.",
    },
    {
        id: "library-bot-01",
        section: "Библиотека",
        title: "Боты — урок 01",
        filename: "bot-01.mp4",
        note: "Премиум-урок по сценариям бота.",
    },
    {
        id: "library-ai-01",
        section: "Библиотека",
        title: "AI — урок 01",
        filename: "ai-01.mp4",
        note: "Премиум-урок про AI-ассистента.",
    },
    {
        id: "library-miniapp-01",
        section: "Библиотека",
        title: "Mini App — урок 01",
        filename: "miniapp-01.mp4",
        note: "Премиум-урок про экран каталога.",
    },
];

const INITIAL_CUSTOM_DRAFT: CustomVideoDraft = {
    title: "",
    group: DEFAULT_VIDEO_GROUP_OPTIONS[0].value,
    slug: "",
    description: "",
    access: "",
};

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, free: 0, paid1m: 0, paid3m: 0 });

    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadNotice, setUploadNotice] = useState<string | null>(null);
    const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});

    const [videoGroups, setVideoGroups] = useState<VideoGroupOption[]>(DEFAULT_VIDEO_GROUP_OPTIONS);
    const [newGroupName, setNewGroupName] = useState("");
    const [customDraft, setCustomDraft] = useState<CustomVideoDraft>(INITIAL_CUSTOM_DRAFT);
    const [customFile, setCustomFile] = useState<File | null>(null);
    const [uploadedCustomVideos, setUploadedCustomVideos] = useState<UploadedCustomVideo[]>([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);

            const [all, admins, free, paid1m, paid3m] = await Promise.all([
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("status_admin", true),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("plan_status", "free"),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("plan_status", "paid_1m"),
                supabase.from("profiles_les").select("id", { head: true, count: "exact" }).eq("plan_status", "paid_3m"),
            ]);

            const firstError = all.error || admins.error || free.error || paid1m.error || paid3m.error;
            if (firstError) {
                setError(firstError.message);
                setLoading(false);
                return;
            }

            setStats({
                total: all.count ?? 0,
                admins: admins.count ?? 0,
                free: free.count ?? 0,
                paid1m: paid1m.count ?? 0,
                paid3m: paid3m.count ?? 0,
            });
            setLoading(false);
        };

        void load();
    }, []);

    const groupedSlots = useMemo(() => {
        return VIDEO_SLOTS.reduce<Record<VideoSection, VideoSlot[]>>(
            (acc, slot) => {
                acc[slot.section].push(slot);
                return acc;
            },
            { Главная: [], Библиотека: [] }
        );
    }, []);

    const activeGroup = useMemo(
        () => videoGroups.find((option) => option.value === customDraft.group) ?? videoGroups[0],
        [customDraft.group, videoGroups]
    );

    const customPreviewSlug = slugify(customDraft.slug || "example-video");

    const uploadToStorage = async (storageKey: string, file: File) => {
        const { error: storageError } = await supabase.storage.from(VIDEO_BUCKET).upload(storageKey, file, {
            cacheControl: "3600",
            contentType: file.type || "video/mp4",
            upsert: true,
        });

        if (storageError) {
            throw new Error(storageError.message);
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(storageKey);

        return publicUrl;
    };

    const handleUpload = async (slot: VideoSlot, file?: File) => {
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            setUploadError("Можно загружать только видеофайлы.");
            setUploadNotice(null);
            return;
        }

        setUploadingId(slot.id);
        setUploadError(null);
        setUploadNotice(null);

        try {
            const publicUrl = await uploadToStorage(`public/${slot.filename}`, file);
            setUploadedUrls((current) => ({ ...current, [slot.id]: publicUrl }));
            setUploadNotice(`Файл «${slot.title}» загружен. Публичная ссылка готова.`);
        } catch (uploadStorageError) {
            const message = uploadStorageError instanceof Error ? uploadStorageError.message : "Не удалось загрузить видео.";
            setUploadError(message);
        } finally {
            setUploadingId(null);
        }
    };

    const handleCustomFieldChange = (field: keyof CustomVideoDraft, value: string) => {
        setCustomDraft((current) => {
            if (field === "title") {
                const nextSlug = current.slug || slugify(value);
                return { ...current, title: value, slug: nextSlug };
            }

            return { ...current, [field]: value };
        });
    };

    const handleAddGroup = () => {
        const safeValue = slugify(newGroupName);
        const trimmedLabel = newGroupName.trim();

        if (!trimmedLabel) {
            setUploadError("Введите название новой группы.");
            setUploadNotice(null);
            return;
        }

        if (!safeValue) {
            setUploadError("Название группы должно содержать латиницу или цифры, чтобы можно было создать путь.");
            setUploadNotice(null);
            return;
        }

        if (videoGroups.some((group) => group.value === safeValue || group.label.toLowerCase() === trimmedLabel.toLowerCase())) {
            setUploadError("Такая группа уже существует.");
            setUploadNotice(null);
            return;
        }

        const nextGroup = { value: safeValue, label: trimmedLabel, path: safeValue };
        setVideoGroups((current) => [...current, nextGroup]);
        setCustomDraft((current) => ({ ...current, group: nextGroup.value }));
        setNewGroupName("");
        setUploadError(null);
        setUploadNotice(`Группа «${trimmedLabel}» добавлена.`);
    };

    const handleCustomUpload = async () => {
        if (!customDraft.title.trim()) {
            setUploadError("Укажите название ролика.");
            setUploadNotice(null);
            return;
        }

        if (!customDraft.group) {
            setUploadError("Выберите группу для ролика.");
            setUploadNotice(null);
            return;
        }

        if (!customDraft.access) {
            setUploadError("Обязательно выберите доступ: Pro или бесплатный.");
            setUploadNotice(null);
            return;
        }

        if (!customDraft.slug.trim()) {
            setUploadError("Укажите системное имя ролика.");
            setUploadNotice(null);
            return;
        }

        if (!customFile) {
            setUploadError("Выберите видеофайл для загрузки.");
            setUploadNotice(null);
            return;
        }

        if (!customFile.type.startsWith("video/")) {
            setUploadError("Можно загружать только видеофайлы.");
            setUploadNotice(null);
            return;
        }

        const safeSlug = slugify(customDraft.slug);
        if (!safeSlug) {
            setUploadError("Системное имя должно содержать латиницу или цифры.");
            setUploadNotice(null);
            return;
        }

        if (!activeGroup) {
            setUploadError("Не удалось определить группу для ролика.");
            setUploadNotice(null);
            return;
        }

        const access = customDraft.access as VideoAccess;

        setUploadingId("custom-video");
        setUploadError(null);
        setUploadNotice(null);

        try {
            const ext = getFileExtension(customFile.name);
            const filePath = `custom/${activeGroup.path}/${safeSlug}.${ext}`;
            const publicUrl = await uploadToStorage(filePath, customFile);

            setUploadedCustomVideos((current) => [
                {
                    ...customDraft,
                    slug: safeSlug,
                    access,
                    filePath,
                    publicUrl,
                },
                ...current,
            ]);
            setUploadNotice(
                `Новый ролик «${customDraft.title}» добавлен в группу «${activeGroup.label}» с доступом «${getAccessLabel(access)}».`
            );
            setCustomDraft((current) => ({ ...INITIAL_CUSTOM_DRAFT, group: current.group }));
            setCustomFile(null);
        } catch (uploadStorageError) {
            const message = uploadStorageError instanceof Error ? uploadStorageError.message : "Не удалось загрузить видео.";
            setUploadError(message);
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <div className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="text-2xl font-semibold">Админ-панель</div>
                <div className="mt-1 text-sm text-white/70">Статистика клиентов и центр загрузки видео для главной страницы, библиотеки и будущих роликов.</div>

                {loading ? <div className="mt-4 text-white/70">Загрузка...</div> : null}
                {error ? <div className="mt-4 text-red-300">Ошибка: {error}</div> : null}

                {!loading && !error ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Card title="Всего клиентов" value={stats.total} />
                        <Card title="Администраторы" value={stats.admins} />
                        <Card title="Бесплатный" value={stats.free} />
                        <Card title="Тариф 1 месяц" value={stats.paid1m} />
                        <Card title="Тариф 3 месяца" value={stats.paid3m} />
                    </div>
                ) : null}
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="text-xl font-semibold">Загрузка действующих роликов</div>
                        <div className="mt-1 text-sm text-white/70">
                            Видео отправляются в Supabase Storage bucket <span className="font-semibold text-white">{VIDEO_BUCKET}</span> по пути
                            <span className="ml-1 font-mono text-white">public/&lt;filename&gt;</span>.
                        </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
                        Если ваш CDN или reverse proxy смотрит в этот bucket, новые файлы можно публиковать без деплоя фронтенда.
                    </div>
                </div>

                {uploadError ? <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{uploadError}</div> : null}
                {uploadNotice ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{uploadNotice}</div> : null}

                <div className="mt-5 space-y-5">
                    {(["Главная", "Библиотека"] as const).map((section) => (
                        <div key={section}>
                            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">{section}</div>
                            <div className="grid gap-3 xl:grid-cols-2">
                                {groupedSlots[section].map((slot) => {
                                    const publicUrl = uploadedUrls[slot.id];
                                    const isUploading = uploadingId === slot.id;

                                    return (
                                        <div key={slot.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-base font-semibold text-white">{slot.title}</div>
                                                    <div className="mt-1 text-sm text-white/65">{slot.note}</div>
                                                </div>
                                                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-white/60">
                                                    <div className="font-mono text-white">{slot.filename}</div>
                                                    <div className="mt-1">/{slot.filename}</div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10">
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={(event) => {
                                                            void handleUpload(slot, event.target.files?.[0]);
                                                            event.currentTarget.value = "";
                                                        }}
                                                    />
                                                    <span>{isUploading ? "Загрузка..." : "Выбрать видео"}</span>
                                                </label>

                                                <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                                                    <span className="rounded-full border border-white/10 px-3 py-1">MP4 / MOV / WEBM</span>
                                                    <span className="rounded-full border border-white/10 px-3 py-1">upsert включён</span>
                                                </div>
                                            </div>

                                            {publicUrl ? <UrlCard publicUrl={publicUrl} /> : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="text-xl font-semibold">Новый ролик для будущих материалов</div>
                        <div className="mt-1 text-sm text-white/70">
                            Здесь можно заранее завести новый ролик: ввести название, добавить новую группу при необходимости и обязательно выбрать тип доступа.
                        </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                        Путь будет создан в формате <span className="font-mono text-white">custom/{activeGroup?.path ?? "group"}/{customPreviewSlug}.mp4</span>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Название ролика">
                                <input
                                    type="text"
                                    value={customDraft.title}
                                    onChange={(event) => handleCustomFieldChange("title", event.target.value)}
                                    placeholder="Например: Mini App — экран оплаты"
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                                />
                            </Field>

                            <Field label="Доступ">
                                <select
                                    value={customDraft.access}
                                    onChange={(event) => handleCustomFieldChange("access", event.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value="" className="bg-[#06110D]">Выберите доступ</option>
                                    <option value="free" className="bg-[#06110D]">Бесплатный</option>
                                    <option value="pro" className="bg-[#06110D]">PRO</option>
                                </select>
                            </Field>

                            <Field label="Группа">
                                <select
                                    value={customDraft.group}
                                    onChange={(event) => handleCustomFieldChange("group", event.target.value)}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                                >
                                    {videoGroups.map((option) => (
                                        <option key={option.value} value={option.value} className="bg-[#06110D]">
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Системное имя">
                                <input
                                    type="text"
                                    value={customDraft.slug}
                                    onChange={(event) => handleCustomFieldChange("slug", event.target.value)}
                                    placeholder="miniapp-ekran-oplaty"
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                                />
                            </Field>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="mb-3 text-sm text-white/60">Добавить новую группу</div>
                            <div className="flex flex-col gap-3 lg:flex-row">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(event) => setNewGroupName(event.target.value)}
                                    placeholder="Например: Вебинары"
                                    className="w-full rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.65)] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                                />
                                <Button type="button" onClick={handleAddGroup} className="shrink-0">
                                    Добавить группу
                                </Button>
                            </div>
                            <div className="mt-2 text-xs text-white/45">Для storage будет использован slug на латинице, например `webinary` или `sales-course`.</div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field label="Видеофайл">
                                <label className="flex min-h-[48px] cursor-pointer items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(event) => setCustomFile(event.target.files?.[0] ?? null)}
                                    />
                                    <span className="truncate">{customFile?.name ?? "Выбрать видео"}</span>
                                </label>
                            </Field>
                            <Field label="Итоговый доступ">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                                    {customDraft.access ? getAccessLabel(customDraft.access) : "Не выбран"}
                                </div>
                            </Field>
                        </div>

                        <Field label="Комментарий / примечание" className="mt-4">
                            <textarea
                                value={customDraft.description}
                                onChange={(event) => handleCustomFieldChange("description", event.target.value)}
                                rows={4}
                                placeholder="Например: ролик для будущего блока по продажам в Mini App"
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                            />
                        </Field>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Button type="button" onClick={() => void handleCustomUpload()} disabled={uploadingId === "custom-video"}>
                                {uploadingId === "custom-video" ? "Загрузка..." : "Добавить новый ролик"}
                            </Button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCustomDraft((current) => ({ ...INITIAL_CUSTOM_DRAFT, group: current.group }));
                                    setCustomFile(null);
                                }}
                                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 hover:bg-white/10"
                            >
                                Сбросить
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Предпросмотр пути</div>
                        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                            <div className="text-xs text-white/45">Storage key</div>
                            <div className="mt-2 break-all font-mono text-emerald-200">
                                custom/{activeGroup?.path ?? "group"}/{customPreviewSlug}.{getFileExtension(customFile?.name)}
                            </div>
                            <div className="mt-4 text-xs text-white/45">Параметры публикации</div>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/65">
                                <li>Группу можно выбрать из списка или добавить новую прямо в админке.</li>
                                <li>Для каждого нового ролика обязательно указывается доступ: бесплатный или PRO.</li>
                                <li>После загрузки вы сразу получаете готовую публичную ссылку.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {uploadedCustomVideos.length ? (
                    <div className="mt-5">
                        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Недавно добавленные будущие ролики</div>
                        <div className="grid gap-3 xl:grid-cols-2">
                            {uploadedCustomVideos.map((video) => {
                                const groupLabel = videoGroups.find((option) => option.value === video.group)?.label ?? video.group;

                                return (
                                    <div key={video.filePath} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="text-base font-semibold text-white">{video.title}</div>
                                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{groupLabel}</span>
                                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                                                {getAccessLabel(video.access)}
                                            </span>
                                        </div>
                                        {video.description ? <div className="mt-2 text-sm text-white/65">{video.description}</div> : null}
                                        <div className="mt-3 text-xs text-white/45">{video.filePath}</div>
                                        <UrlCard publicUrl={video.publicUrl} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </section>
        </div>
    );
}

function UrlCard({ publicUrl }: { publicUrl: string }) {
    return (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">Публичная ссылка</div>
            <div className="break-all font-mono text-xs text-emerald-200">{publicUrl}</div>
            <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={() => navigator.clipboard.writeText(publicUrl)} className="!px-3 !py-2">
                    Копировать ссылку
                </Button>
                <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                    Открыть видео
                </a>
            </div>
        </div>
    );
}

function Field({
    label,
    children,
    className = "",
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <div className="mb-2 text-sm text-white/60">{label}</div>
            {children}
        </div>
    );
}

function Card({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/70">{title}</div>
            <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
    );
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

function getFileExtension(filename?: string) {
    const rawExt = filename?.split(".").pop()?.toLowerCase() || "mp4";
    return rawExt.replace(/[^a-z0-9]/g, "") || "mp4";
}

function getAccessLabel(access: VideoAccess) {
    return access === "pro" ? "PRO" : "Бесплатный";
}
