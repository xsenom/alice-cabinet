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

type VideoSlot = {
    id: string;
    section: "Главная" | "Библиотека";
    title: string;
    filename: string;
    note: string;
};

const VIDEO_BUCKET = (import.meta.env.VITE_SUPABASE_VIDEOS_BUCKET as string | undefined)?.trim() || "videos";

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

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, free: 0, paid1m: 0, paid3m: 0 });

    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadNotice, setUploadNotice] = useState<string | null>(null);
    const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});

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

        load();
    }, []);

    const groupedSlots = useMemo(() => {
        return VIDEO_SLOTS.reduce<Record<VideoSlot["section"], VideoSlot[]>>(
            (acc, slot) => {
                acc[slot.section].push(slot);
                return acc;
            },
            { Главная: [], Библиотека: [] }
        );
    }, []);

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

        const filePath = `public/${slot.filename}`;
        const { error: storageError } = await supabase.storage.from(VIDEO_BUCKET).upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type || "video/mp4",
            upsert: true,
        });

        if (storageError) {
            setUploadError(storageError.message);
            setUploadingId(null);
            return;
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(filePath);

        setUploadedUrls((current) => ({ ...current, [slot.id]: publicUrl }));
        setUploadNotice(`Файл «${slot.title}» загружен. Публичная ссылка готова.`);
        setUploadingId(null);
    };

    return (
        <div className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="text-2xl font-semibold">Админ-панель</div>
                <div className="mt-1 text-sm text-white/70">Статистика клиентов и центр загрузки видео для главной страницы и библиотеки.</div>

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
                        <div className="text-xl font-semibold">Загрузка роликов</div>
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

                                            {publicUrl ? (
                                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                                                    <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">Публичная ссылка</div>
                                                    <div className="break-all font-mono text-xs text-emerald-200">{publicUrl}</div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() => navigator.clipboard.writeText(publicUrl)}
                                                            className="!px-3 !py-2"
                                                        >
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
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
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
