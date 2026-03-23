import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase/client";
import { DEMO } from "../lib/library/demo";
import type { LessonComment, LessonPdf, TopicKey } from "../lib/library/types";

type Stats = {
    total: number;
    admins: number;
    free: number;
    paid1m: number;
    paid3m: number;
};

type LessonAccess = "free" | "pro";

type AdminLesson = {
    id: string;
    title: string;
    goal: string;
    access: LessonAccess;
    videoLabel: string;
    videoUrl: string;
    timecodes: string;
    videoDescription: string;
    pdfs: LessonPdf[];
    comments: LessonComment[];
    averageRating: number;
    ratingsCount: number;
};

type AdminGroup = {
    id: string;
    title: string;
    lessons: AdminLesson[];
};

type HomeVideoSlot = {
    id: string;
    title: string;
    description: string;
    videoLabel: string;
    access: LessonAccess;
    filename: string;
    publicPath: string;
};

const VIDEO_BUCKET = (import.meta.env.VITE_SUPABASE_VIDEOS_BUCKET as string | undefined)?.trim() || "videos";

const DEFAULT_COMMENT_MAP: Record<string, LessonComment[]> = {
    f01: [
        { lessonId: "f01", text: "Супер! Наконец-то стало понятно, как выстроить линейку.", ts: "сегодня, 12:40" },
        { lessonId: "f01", text: "Хочется ещё пример по прогреву через сторис.", ts: "вчера, 18:10" },
    ],
    f02: [{ lessonId: "f02", text: "Очень полезны тайм-коды, пересматриваю отдельные куски.", ts: "сегодня, 09:15" }],
    b01: [{ lessonId: "b01", text: "Добавьте шаблон сообщений для welcome-цепочки.", ts: "сегодня, 11:02" }],
};

const HOME_VIDEO_SLOTS: HomeVideoSlot[] = [
    {
        id: "home-how-to-use",
        title: "Как пользоваться приложением",
        description: "Онбординг-ролик для новых пользователей на главной странице.",
        videoLabel: "Как пользоваться Lesik",
        access: "free",
        filename: "how-to-use-lesik.mp4",
        publicPath: "/videos/how-to-use-lesik.mp4",
    },
    {
        id: "home-who-needs",
        title: "Кому будет полезно",
        description: "Короткий ролик про сценарии, кому подходит продукт.",
        videoLabel: "Кому будет полезно",
        access: "free",
        filename: "who-needs-lesik.mp4",
        publicPath: "/videos/who-needs-lesik.mp4",
    },
    {
        id: "home-miniapp-pro",
        title: "Mini App в Telegram (PRO)",
        description: "Промо-видео для платного контента на главной странице.",
        videoLabel: "Mini App в Telegram",
        access: "pro",
        filename: "miniapp-pro.mp4",
        publicPath: "/videos/miniapp-pro.mp4",
    },
];

const DEFAULT_RATINGS: Record<string, { averageRating: number; ratingsCount: number }> = {
    f01: { averageRating: 4.8, ratingsCount: 32 },
    f02: { averageRating: 4.6, ratingsCount: 18 },
    b01: { averageRating: 4.9, ratingsCount: 14 },
    ai01: { averageRating: 4.7, ratingsCount: 11 },
    m01: { averageRating: 4.5, ratingsCount: 9 },
};

function buildInitialGroups(): AdminGroup[] {
    return (Object.entries(DEMO) as Array<[TopicKey, typeof DEMO[TopicKey]]>).map(([topic, lessons]) => ({
        id: slugify(topic),
        title: topic,
        lessons: lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            goal: lesson.goal,
            access: lesson.premium ? "pro" : "free",
            videoLabel: lesson.video?.label ?? lesson.title,
            videoUrl: lesson.video?.url ?? "",
            timecodes: "00:00 — Вступление\n03:40 — Ключевая мысль\n12:15 — Практический пример",
            videoDescription: lesson.goal,
            pdfs: lesson.pdfs ?? [],
            comments: DEFAULT_COMMENT_MAP[lesson.id] ?? [],
            averageRating: DEFAULT_RATINGS[lesson.id]?.averageRating ?? 0,
            ratingsCount: DEFAULT_RATINGS[lesson.id]?.ratingsCount ?? 0,
        })),
    }));
}

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, admins: 0, free: 0, paid1m: 0, paid3m: 0 });

    const [groups, setGroups] = useState<AdminGroup[]>(() => buildInitialGroups());
    const [homeVideos, setHomeVideos] = useState<HomeVideoSlot[]>(HOME_VIDEO_SLOTS);
    const [homeVideoUrls, setHomeVideoUrls] = useState<Record<string, string>>({});
    const [editingHomeId, setEditingHomeId] = useState<string | null>(null);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [newGroupTitle, setNewGroupTitle] = useState("");

    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadNotice, setUploadNotice] = useState<string | null>(null);

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

    const totalLessons = useMemo(() => groups.reduce((acc, group) => acc + group.lessons.length, 0), [groups]);
    const totalComments = useMemo(
        () => groups.reduce((acc, group) => acc + group.lessons.reduce((sum, lesson) => sum + lesson.comments.length, 0), 0),
        [groups]
    );

    const updateGroup = (groupId: string, updater: (group: AdminGroup) => AdminGroup) => {
        setGroups((current) => current.map((group) => (group.id === groupId ? updater(group) : group)));
    };

    const updateLesson = (groupId: string, lessonId: string, updater: (lesson: AdminLesson) => AdminLesson) => {
        updateGroup(groupId, (group) => ({
            ...group,
            lessons: group.lessons.map((lesson) => (lesson.id === lessonId ? updater(lesson) : lesson)),
        }));
    };

    const uploadToStorage = async (storageKey: string, file: File) => {
        const { error: storageError } = await supabase.storage.from(VIDEO_BUCKET).upload(storageKey, file, {
            cacheControl: "3600",
            contentType: file.type || undefined,
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

    const updateHomeVideo = (slotId: string, updater: (slot: HomeVideoSlot) => HomeVideoSlot) => {
        setHomeVideos((current) => current.map((slot) => (slot.id === slotId ? updater(slot) : slot)));
    };

    const handleHomeVideoUpload = async (slot: HomeVideoSlot, file?: File) => {
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
            setHomeVideoUrls((current) => ({ ...current, [slot.id]: publicUrl }));
            setUploadNotice(`Ролик «${slot.title}» обновлён.`);
        } catch (uploadStorageError) {
            setUploadError(uploadStorageError instanceof Error ? uploadStorageError.message : "Не удалось загрузить видео.");
        } finally {
            setUploadingId(null);
        }
    };

    const handleVideoUpload = async (groupId: string, lessonId: string, file?: File) => {
        if (!file) return;
        if (!file.type.startsWith("video/")) {
            setUploadError("Можно загружать только видеофайлы.");
            setUploadNotice(null);
            return;
        }

        setUploadingId(lessonId);
        setUploadError(null);
        setUploadNotice(null);

        try {
            const ext = getFileExtension(file.name);
            const storageKey = `library/${groupId}/${lessonId}/video.${ext}`;
            const publicUrl = await uploadToStorage(storageKey, file);
            updateLesson(groupId, lessonId, (lesson) => ({ ...lesson, videoUrl: publicUrl }));
            setUploadNotice("Видео загружено и привязано к уроку.");
        } catch (uploadStorageError) {
            setUploadError(uploadStorageError instanceof Error ? uploadStorageError.message : "Не удалось загрузить видео.");
        } finally {
            setUploadingId(null);
        }
    };

    const handlePdfUpload = async (groupId: string, lessonId: string, file?: File) => {
        if (!file) return;
        if (file.type !== "application/pdf") {
            setUploadError("Можно загружать только PDF-файлы.");
            setUploadNotice(null);
            return;
        }

        setUploadingId(`${lessonId}-pdf`);
        setUploadError(null);
        setUploadNotice(null);

        try {
            const storageKey = `library/${groupId}/${lessonId}/pdf/${slugify(file.name.replace(/\.pdf$/i, "")) || "material"}.pdf`;
            await uploadToStorage(storageKey, file);
            updateLesson(groupId, lessonId, (lesson) => ({
                ...lesson,
                pdfs: [{ name: file.name }, ...lesson.pdfs],
            }));
            setUploadNotice("PDF добавлен к уроку.");
        } catch (uploadStorageError) {
            setUploadError(uploadStorageError instanceof Error ? uploadStorageError.message : "Не удалось загрузить PDF.");
        } finally {
            setUploadingId(null);
        }
    };

    const addGroup = () => {
        const title = newGroupTitle.trim();
        if (!title) {
            setUploadError("Введите название блока.");
            setUploadNotice(null);
            return;
        }

        const id = `${slugify(title) || "block"}-${Date.now()}`;
        setGroups((current) => [...current, { id, title, lessons: [] }]);
        setNewGroupTitle("");
        setEditingGroupId(id);
        setUploadError(null);
        setUploadNotice(`Блок «${title}» добавлен.`);
    };

    const addLesson = (groupId: string) => {
        const lessonId = `${groupId}-${Date.now()}`;
        updateGroup(groupId, (group) => ({
            ...group,
            lessons: [
                ...group.lessons,
                {
                    id: lessonId,
                    title: "Новый урок",
                    goal: "Добавьте краткое описание урока.",
                    access: "free",
                    videoLabel: "Новый урок",
                    videoUrl: "",
                    timecodes: "00:00 — Вступление",
                    videoDescription: "Добавьте описание к видео.",
                    pdfs: [],
                    comments: [],
                    averageRating: 0,
                    ratingsCount: 0,
                },
            ],
        }));
        setEditingLessonId(lessonId);
    };

    return (
        <div className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="text-2xl font-semibold">Админ-панель</div>
                <div className="mt-1 text-sm text-white/70">Единый блок управления библиотекой: группы, уроки, видео, тайм-коды, описание, PDF, оценки и комментарии.</div>

                {loading ? <div className="mt-4 text-white/70">Загрузка...</div> : null}
                {error ? <div className="mt-4 text-red-300">Ошибка: {error}</div> : null}

                {!loading && !error ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Card title="Всего клиентов" value={stats.total} />
                        <Card title="Администраторы" value={stats.admins} />
                        <Card title="Уроков в библиотеке" value={totalLessons} />
                        <Card title="Комментариев к урокам" value={totalComments} />
                    </div>
                ) : null}
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="text-xl font-semibold">Главная / Как пользоваться приложением</div>
                <div className="mt-1 text-sm text-white/70">Вернул отдельную панель для роликов на главной странице, чтобы можно было обновлять onboarding и промо-видео.</div>

                <div className="mt-5 grid gap-3 xl:grid-cols-3">
                    {homeVideos.map((slot) => {
                        const currentUrl = homeVideoUrls[slot.id] || slot.publicPath;
                        const isEditingHome = editingHomeId === slot.id;
                        return (
                            <div key={slot.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        {isEditingHome ? (
                                            <input
                                                value={slot.title}
                                                onChange={(event) => updateHomeVideo(slot.id, (current) => ({ ...current, title: event.target.value }))}
                                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white outline-none"
                                            />
                                        ) : (
                                            <div className="text-base font-semibold text-white">{slot.title}</div>
                                        )}
                                    </div>
                                    <Button type="button" onClick={() => setEditingHomeId(isEditingHome ? null : slot.id)}>
                                        {isEditingHome ? "Сохранить" : "Редактировать"}
                                    </Button>
                                </div>
                                <div className="mt-4 grid gap-4">
                                    <Field label="Название ролика">
                                        <input
                                            value={slot.title}
                                            onChange={(event) => updateHomeVideo(slot.id, (current) => ({ ...current, title: event.target.value }))}
                                            disabled={!isEditingHome}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                        />
                                    </Field>
                                    <Field label="Короткое название / label">
                                        <input
                                            value={slot.videoLabel}
                                            onChange={(event) => updateHomeVideo(slot.id, (current) => ({ ...current, videoLabel: event.target.value }))}
                                            disabled={!isEditingHome}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                        />
                                    </Field>
                                    <Field label="Описание">
                                        <textarea
                                            value={slot.description}
                                            onChange={(event) => updateHomeVideo(slot.id, (current) => ({ ...current, description: event.target.value }))}
                                            disabled={!isEditingHome}
                                            rows={3}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                        />
                                    </Field>
                                    <Field label="Доступ">
                                        <select
                                            value={slot.access}
                                            onChange={(event) => updateHomeVideo(slot.id, (current) => ({ ...current, access: event.target.value as LessonAccess }))}
                                            disabled={!isEditingHome}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                        >
                                            <option value="free" className="bg-[#06110D]">Бесплатный</option>
                                            <option value="pro" className="bg-[#06110D]">PRO</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                                    <div className="font-mono text-white">{slot.filename}</div>
                                    <div className="mt-1 break-all">{currentUrl}</div>
                                </div>
                                <label className="mt-4 inline-flex cursor-pointer items-center rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/10">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            void handleHomeVideoUpload(slot, event.target.files?.[0]);
                                            event.currentTarget.value = "";
                                        }}
                                    />
                                    <span>{uploadingId === slot.id ? "Загрузка..." : "Загрузить видео"}</span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="text-xl font-semibold">Библиотека</div>
                        <div className="mt-1 text-sm text-white/70">Без разделения на отдельные админ-блоки: здесь можно редактировать действующие блоки, добавлять новые названия блоков и новые уроки.</div>
                    </div>
                    <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                        <input
                            value={newGroupTitle}
                            onChange={(event) => setNewGroupTitle(event.target.value)}
                            placeholder="Название нового блока"
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
                        />
                        <Button type="button" onClick={addGroup} className="shrink-0">
                            Добавить блок
                        </Button>
                    </div>
                </div>

                {uploadError ? <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{uploadError}</div> : null}
                {uploadNotice ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{uploadNotice}</div> : null}

                <div className="mt-5 space-y-4">
                    {groups.map((group) => {
                        const isEditingGroup = editingGroupId === group.id;

                        return (
                            <div key={group.id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex-1">
                                        {isEditingGroup ? (
                                            <input
                                                value={group.title}
                                                onChange={(event) => updateGroup(group.id, (current) => ({ ...current, title: event.target.value }))}
                                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white outline-none"
                                            />
                                        ) : (
                                            <div className="text-lg font-semibold text-white">{group.title}</div>
                                        )}
                                        <div className="mt-1 text-sm text-white/55">Уроков: {group.lessons.length}</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" onClick={() => setEditingGroupId(isEditingGroup ? null : group.id)}>
                                            {isEditingGroup ? "Сохранить блок" : "Редактировать блок"}
                                        </Button>
                                        <Button type="button" onClick={() => addLesson(group.id)}>
                                            Добавить урок
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-4">
                                    {group.lessons.map((lesson, index) => {
                                        const isEditingLesson = editingLessonId === lesson.id;

                                        return (
                                            <div key={lesson.id} className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                                                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                                                    <div className="flex-1">
                                                        <div className="text-xs uppercase tracking-[0.2em] text-white/45">Урок {index + 1}</div>
                                                        {isEditingLesson ? (
                                                            <input
                                                                value={lesson.title}
                                                                onChange={(event) => updateLesson(group.id, lesson.id, (current) => ({ ...current, title: event.target.value }))}
                                                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-white outline-none"
                                                            />
                                                        ) : (
                                                            <div className="mt-2 text-base font-semibold text-white">{lesson.title}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button type="button" onClick={() => setEditingLessonId(isEditingLesson ? null : lesson.id)}>
                                                            {isEditingLesson ? "Сохранить урок" : "Редактировать урок"}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                                    <Field label="Название урока">
                                                        <input
                                                            value={lesson.title}
                                                            onChange={(event) => updateLesson(group.id, lesson.id, (current) => ({ ...current, title: event.target.value }))}
                                                            disabled={!isEditingLesson}
                                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                                        />
                                                    </Field>
                                                    <Field label="Доступ">
                                                        <select
                                                            value={lesson.access}
                                                            onChange={(event) => updateLesson(group.id, lesson.id, (current) => ({ ...current, access: event.target.value as LessonAccess }))}
                                                            disabled={!isEditingLesson}
                                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                                        >
                                                            <option value="free" className="bg-[#06110D]">Бесплатный</option>
                                                            <option value="pro" className="bg-[#06110D]">PRO</option>
                                                        </select>
                                                    </Field>
                                                    <Field label="Описание урока">
                                                        <textarea
                                                            value={lesson.goal}
                                                            onChange={(event) => updateLesson(group.id, lesson.id, (current) => ({ ...current, goal: event.target.value }))}
                                                            disabled={!isEditingLesson}
                                                            rows={4}
                                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                                        />
                                                    </Field>
                                                    <Field label="Описание к видео">
                                                        <textarea
                                                            value={lesson.videoDescription}
                                                            onChange={(event) => updateLesson(group.id, lesson.id, (current) => ({ ...current, videoDescription: event.target.value }))}
                                                            disabled={!isEditingLesson}
                                                            rows={4}
                                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                                                        />
                                                    </Field>
                                                    <Field label="Тайм-коды" className="xl:col-span-2">
                                                        <textarea
                                                            value={lesson.timecodes}
                                                            onChange={(event) => updateLesson(group.id, lesson.id, (current) => ({ ...current, timecodes: event.target.value }))}
                                                            disabled={!isEditingLesson}
                                                            rows={5}
                                                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white outline-none disabled:opacity-60"
                                                        />
                                                    </Field>
                                                </div>

                                                <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                                            <div>
                                                                <div className="text-sm font-semibold text-white">Видео урока</div>
                                                                <div className="mt-1 break-all text-xs text-white/55">{lesson.videoUrl || "Видео пока не загружено"}</div>
                                                            </div>
                                                            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/10">
                                                                <input
                                                                    type="file"
                                                                    accept="video/*"
                                                                    className="hidden"
                                                                    onChange={(event) => {
                                                                        void handleVideoUpload(group.id, lesson.id, event.target.files?.[0]);
                                                                        event.currentTarget.value = "";
                                                                    }}
                                                                />
                                                                <span>{uploadingId === lesson.id ? "Загрузка..." : "Загрузить видео"}</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <div className="text-sm font-semibold text-white">Оценка ролика</div>
                                                        <div className="mt-2 text-3xl font-semibold text-white">{lesson.averageRating ? lesson.averageRating.toFixed(1) : "—"}</div>
                                                        <div className="mt-1 text-sm text-white/55">Голосов: {lesson.ratingsCount}</div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="text-sm font-semibold text-white">PDF файлы</div>
                                                            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10">
                                                                <input
                                                                    type="file"
                                                                    accept="application/pdf"
                                                                    className="hidden"
                                                                    onChange={(event) => {
                                                                        void handlePdfUpload(group.id, lesson.id, event.target.files?.[0]);
                                                                        event.currentTarget.value = "";
                                                                    }}
                                                                />
                                                                <span>{uploadingId === `${lesson.id}-pdf` ? "Загрузка..." : "Добавить PDF"}</span>
                                                            </label>
                                                        </div>
                                                        <div className="mt-3 space-y-2">
                                                            {lesson.pdfs.length ? (
                                                                lesson.pdfs.map((pdf) => (
                                                                    <div key={`${lesson.id}-${pdf.name}`} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/80">
                                                                        {pdf.name}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-white/55">PDF пока не добавлены.</div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                        <div className="text-sm font-semibold text-white">Комментарии посмотревших</div>
                                                        <div className="mt-3 space-y-2">
                                                            {lesson.comments.length ? (
                                                                lesson.comments.map((comment, commentIndex) => (
                                                                    <div key={`${lesson.id}-${commentIndex}`} className="rounded-2xl border border-white/10 px-3 py-3">
                                                                        <div className="flex items-center justify-between gap-3 text-xs text-white/45">
                                                                            <span>Пользователь</span>
                                                                            <span>{comment.ts}</span>
                                                                        </div>
                                                                        <div className="mt-2 text-sm text-white/80">{comment.text}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-sm text-white/55">Комментариев пока нет.</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {!group.lessons.length ? <div className="text-sm text-white/55">В этом блоке пока нет уроков. Нажмите «Добавить урок».</div> : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

function Card({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/70">{title}</div>
            <div className="mt-1 text-3xl font-semibold text-white">{value}</div>
        </div>
    );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <div className="mb-2 text-sm text-white/60">{label}</div>
            {children}
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
