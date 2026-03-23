import { DEMO } from "./library/demo";
import type { LessonComment, LessonPdf, TopicKey } from "./library/types";

export type LessonAccess = "free" | "pro";

export type AdminLesson = {
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

export type AdminGroup = {
    id: string;
    title: string;
    lessons: AdminLesson[];
};

export const LIBRARY_CONTENT_STORAGE_KEY = "lesik.libraryContent.v1";

const DEFAULT_COMMENT_MAP: Record<string, LessonComment[]> = {
    f01: [
        { lessonId: "f01", text: "Супер! Наконец-то стало понятно, как выстроить линейку.", ts: "сегодня, 12:40" },
        { lessonId: "f01", text: "Хочется ещё пример по прогреву через сторис.", ts: "вчера, 18:10" },
    ],
    f02: [{ lessonId: "f02", text: "Очень полезны тайм-коды, пересматриваю отдельные куски.", ts: "сегодня, 09:15" }],
    b01: [{ lessonId: "b01", text: "Добавьте шаблон сообщений для welcome-цепочки.", ts: "сегодня, 11:02" }],
};

const DEFAULT_RATINGS: Record<string, { averageRating: number; ratingsCount: number }> = {
    f01: { averageRating: 4.8, ratingsCount: 32 },
    f02: { averageRating: 4.6, ratingsCount: 18 },
    b01: { averageRating: 4.9, ratingsCount: 14 },
    ai01: { averageRating: 4.7, ratingsCount: 11 },
    m01: { averageRating: 4.5, ratingsCount: 9 },
};

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-zа-я0-9]+/gi, "-")
        .replace(/(^-|-$)+/g, "");
}

function buildDefaultGroups(): AdminGroup[] {
    return (Object.entries(DEMO) as Array<[TopicKey, typeof DEMO[TopicKey]]>).map(([topic, lessons], groupIndex) => ({
        id: slugify(topic) || `group-${groupIndex + 1}`,
        title: topic,
        lessons: lessons.map((lesson, lessonIndex) => ({
            id: lesson.id || `lesson-${groupIndex + 1}-${lessonIndex + 1}`,
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

function cloneGroups(groups: AdminGroup[]) {
    return groups.map((group) => ({
        ...group,
        lessons: group.lessons.map((lesson) => ({
            ...lesson,
            pdfs: lesson.pdfs.map((pdf) => ({ ...pdf })),
            comments: lesson.comments.map((comment) => ({ ...comment })),
        })),
    }));
}

export function loadLibraryContentSettings(): AdminGroup[] {
    const fallback = buildDefaultGroups();

    if (typeof window === "undefined") {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(LIBRARY_CONTENT_STORAGE_KEY);
        if (!raw) return fallback;

        const parsed = JSON.parse(raw) as AdminGroup[];
        return Array.isArray(parsed) && parsed.length ? cloneGroups(parsed) : fallback;
    } catch {
        return fallback;
    }
}

export function saveLibraryContentSettings(groups: AdminGroup[]) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(LIBRARY_CONTENT_STORAGE_KEY, JSON.stringify(groups));
}

export function buildLibraryLessonsMap(groups: AdminGroup[]) {
    return Object.fromEntries(
        groups.map((group) => [
            group.title as TopicKey,
            group.lessons.map((lesson, index) => ({
                id: lesson.id,
                n: index + 1,
                title: lesson.title,
                needTask: true,
                premium: lesson.access === "pro",
                goal: lesson.goal,
                video: { label: lesson.videoLabel, url: lesson.videoUrl || undefined },
                pdfs: lesson.pdfs,
                task: {
                    title: "Домашнее задание",
                    questions: [{ id: `${lesson.id}-q1`, text: "Сделайте конспект ключевых шагов и примените их в своём проекте.", required: true }],
                },
            })),
        ])
    ) as Record<TopicKey, typeof DEMO[TopicKey]>;
}
