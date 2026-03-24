import React, { useEffect, useMemo, useState } from "react";
import type { Lesson, LessonComment, TopicKey } from "../../lib/library/types";
import { TOKENS } from "../../lib/library/tokens";
import { AppButton, AppButtonLabel } from "./LibraryButtons";
import { LibraryCard, SectionTitle } from "./ui";
import { supabase } from "../../lib/supabase/client";
import { useSessionProfile } from "../../hooks/useSessionProfile";

type LessonDbComment = LessonComment & {
    author?: string;
};

const DEFAULT_COMMENTS: Record<string, LessonDbComment[]> = {
    f01: [{ lessonId: "f01", text: "Супер! Наконец-то стало понятно, как выстроить линейку.", ts: "сегодня, 12:40", author: "Илья" }],
};

function formatTimestamp(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "только что";
    return date.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function LessonScreen({
    topic,
    lesson,
    onClose,
}: {
    topic: TopicKey;
    lesson: Lesson;
    onClose: () => void;
}) {
    const { user, profile } = useSessionProfile();
    const isAdmin = !!profile?.status_admin;

    const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
    const [uploadedPdfNames, setUploadedPdfNames] = useState<string[]>([]);

    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<LessonDbComment[]>(DEFAULT_COMMENTS[lesson.id] ?? []);
    const [commentsWarning, setCommentsWarning] = useState<string | null>(null);
    const [submittingComment, setSubmittingComment] = useState(false);

    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [userRating, setUserRating] = useState<number | null>(null);
    const [savingRating, setSavingRating] = useState(false);
    const [ratingNotice, setRatingNotice] = useState<string | null>(null);

    const [videoNotes, setVideoNotes] = useState<Record<string, string>>({
        f01: `Как создать свою продуктовую линейку?

1. Определи главную проблему клиента — что мешает ему достичь результата?
2. Разбей решение на этапы — какие шаги он должен пройти?
3. Создай продукты, закрывающие эти этапы — начни с лид-магнита и доведи до основного продукта.
4. Добавь премиальный сегмент — часть аудитории готова платить больше за эксклюзивность.

Ошибки при создании продуктовой линейки:
✗ Продавать сразу дорогой продукт без разогрева.
✗ Продукты не связаны между собой и не ведут к логичной покупке.
✗ Нет бесплатного лид-магнита — сложно привлекать новых клиентов.
✗ Нет вариативности цен — теряется часть потенциальных клиентов.

Вывод: грамотно выстроенная продуктовая линейка помогает увеличить доход, упростить продажи и создать очередь клиентов.`,
    });

    const [noteOpen, setNoteOpen] = useState<boolean>(false);

    useEffect(() => {
        setUploadedVideoName(null);
        setUploadedPdfNames([]);
        setAnswers({});
        setCommentText("");
        setNoteOpen(false);
        setComments(DEFAULT_COMMENTS[lesson.id] ?? []);
        setCommentsWarning(null);
        setUserRating(null);
        setRatingNotice(null);
    }, [lesson.id]);

    useEffect(() => {
        let canceled = false;

        const loadCommentsAndRating = async () => {
            const commentsQuery = await supabase
                .from("lesson_comments_les")
                .select("lesson_id,text,created_at,author_name")
                .eq("lesson_id", lesson.id)
                .order("created_at", { ascending: false });

            if (!canceled) {
                if (commentsQuery.error) {
                    setCommentsWarning("Комментарии пока в демо-режиме: таблица lesson_comments_les не настроена.");
                    setComments(DEFAULT_COMMENTS[lesson.id] ?? []);
                } else {
                    setComments(
                        (commentsQuery.data ?? []).map((row) => ({
                            lessonId: row.lesson_id,
                            text: row.text,
                            ts: formatTimestamp(row.created_at),
                            author: row.author_name || "Пользователь",
                        }))
                    );
                }
            }

            if (!user?.id) return;

            const ratingQuery = await supabase
                .from("lesson_ratings_les")
                .select("rating")
                .eq("lesson_id", lesson.id)
                .eq("user_id", user.id)
                .maybeSingle();

            if (!canceled) {
                if (ratingQuery.error) {
                    setRatingNotice("Оценки пока в демо-режиме: таблица lesson_ratings_les не настроена.");
                } else {
                    setUserRating(ratingQuery.data?.rating ?? null);
                }
            }
        };

        void loadCommentsAndRating();

        return () => {
            canceled = true;
        };
    }, [lesson.id, user?.id]);

    const openedComments = useMemo(() => comments.filter((c) => c.lessonId === lesson.id), [comments, lesson.id]);

    const addComment = async () => {
        const t = commentText.trim();
        if (!t || !user?.id || submittingComment) return;

        setSubmittingComment(true);
        setCommentsWarning(null);

        const payload = {
            lesson_id: lesson.id,
            user_id: user.id,
            author_name: profile?.full_name?.trim() || profile?.email || "Пользователь",
            text: t,
        };

        const { data, error } = await supabase
            .from("lesson_comments_les")
            .insert(payload)
            .select("lesson_id,text,created_at,author_name")
            .single();

        if (error) {
            setCommentsWarning("Не удалось сохранить комментарий в БД. Проверь SQL в SUPABASE_SETUP.md.");
            setSubmittingComment(false);
            return;
        }

        setComments((prev) => [
            {
                lessonId: data.lesson_id,
                text: data.text,
                ts: formatTimestamp(data.created_at),
                author: data.author_name || "Пользователь",
            },
            ...prev,
        ]);
        setCommentText("");
        setSubmittingComment(false);
    };

    const saveRating = async (rating: number) => {
        if (!user?.id || savingRating || userRating) return;

        setSavingRating(true);
        setRatingNotice(null);

        const { error } = await supabase.from("lesson_ratings_les").upsert(
            {
                lesson_id: lesson.id,
                user_id: user.id,
                rating,
            },
            { onConflict: "lesson_id,user_id" }
        );

        if (error) {
            setRatingNotice("Не удалось сохранить оценку в БД. Проверь SQL в SUPABASE_SETUP.md.");
            setSavingRating(false);
            return;
        }

        setUserRating(rating);
        setRatingNotice("Спасибо! Оценка сохранена.");
        setSavingRating(false);
    };

    const pdfs = lesson.pdfs ?? [];
    const pdfItems = [...pdfs, ...uploadedPdfNames.map((name) => ({ name }))];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div className="text-white/70 text-[13px]">
                    {topic} / <span className="text-white/90 font-semibold">Урок /{String(lesson.n).padStart(2, "0")}</span>
                </div>
                <AppButton
                    onClick={() => {
                        setUploadedVideoName(null);
                        setUploadedPdfNames([]);
                        setAnswers({});
                        setCommentText("");
                        setNoteOpen(false);
                        onClose();
                    }}
                >
                    ← К СПИСКУ
                </AppButton>
            </div>

            <div
                className="rounded-[18px] border p-4"
                style={{
                    borderColor: TOKENS.stroke,
                    background: "rgba(255,255,255,0.06)",
                    boxShadow: TOKENS.shadow,
                }}
            >
                <div className="text-[20px] font-extrabold text-white/95">{lesson.title}</div>
                {lesson.needTask && (
                    <div
                        className="mt-2 inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold border"
                        style={{
                            borderColor: "rgba(47,107,255,0.45)",
                            background: "rgba(47,107,255,0.16)",
                            color: "rgba(242,244,243,0.92)",
                        }}
                    >
                        Необходимо выполнить задание
                    </div>
                )}
            </div>

            <LibraryCard>
                <div className="text-[14px] font-extrabold text-white/95 underline underline-offset-4">ЦЕЛЬ УРОКА:</div>
                <div className="mt-2 text-[14px] text-white/80 leading-relaxed">{lesson.goal}</div>
            </LibraryCard>

            <div>
                <SectionTitle>ВИДЕО</SectionTitle>
                <LibraryCard>
                    <div
                        className="rounded-[16px] border overflow-hidden"
                        style={{
                            borderColor: "rgba(255,255,255,0.10)",
                            background: "rgba(0,0,0,0.30)",
                        }}
                    >
                        <div className="relative aspect-video flex items-center justify-center">
                            {lesson.video?.url ? (
                                <video className="h-full w-full object-cover" controls preload="metadata" src={lesson.video.url} />
                            ) : (
                                <>
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: "radial-gradient(circle at 35% 25%, rgba(47,107,255,0.22), transparent 60%)",
                                        }}
                                    />
                                    <div className="relative flex flex-col items-center gap-2">
                                        <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: "rgba(47,107,255,0.85)" }}>
                                            <div className="text-black text-[18px] font-black">▶</div>
                                        </div>
                                        <div className="text-[13px] text-white/70">{lesson.video?.label ?? "Видео урока"}</div>
                                    </div>
                                </>
                            )}
                            {uploadedVideoName && (
                                <div className="absolute bottom-2 left-2 rounded-md bg-black/40 px-2 py-1 text-[12px] text-white/80">Загружено: {uploadedVideoName}</div>
                            )}
                        </div>
                    </div>

                    {isAdmin ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer">
                                <AppButtonLabel>ЗАГРУЗИТЬ ВИДЕО</AppButtonLabel>
                                <span className="sr-only">загрузить видео</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setUploadedVideoName(f.name);
                                    }}
                                />
                            </label>
                            <AppButton>ДОБАВИТЬ ТАЙМКОДЫ</AppButton>
                        </div>
                    ) : null}

                    {!userRating ? (
                        <div
                            className="mt-4 rounded-[16px] border px-4 py-3 flex items-center justify-between gap-3"
                            style={{
                                borderColor: "rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.06)",
                            }}
                        >
                            <div className="text-[14px] font-semibold text-white/85">Оцените занятие</div>
                            <div className="flex items-center gap-2">
                                {([
                                    { v: 1, e: "😫" },
                                    { v: 2, e: "😟" },
                                    { v: 3, e: "😐" },
                                    { v: 4, e: "😊" },
                                    { v: 5, e: "😄" },
                                ] as const).map((it) => (
                                    <button
                                        key={it.v}
                                        type="button"
                                        onClick={() => void saveRating(it.v)}
                                        disabled={savingRating || !user?.id}
                                        className="h-9 w-9 rounded-full border flex items-center justify-center text-[18px] disabled:opacity-60"
                                        style={{
                                            borderColor: "rgba(255,255,255,0.12)",
                                            background: "rgba(255,255,255,0.04)",
                                        }}
                                        aria-label={`Оценка ${it.v}`}
                                    >
                                        {it.e}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {ratingNotice ? <div className="mt-2 text-xs text-white/60">{ratingNotice}</div> : null}

                    <div
                        className="mt-3 rounded-[16px] border overflow-hidden"
                        style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)" }}
                    >
                        <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
                            <div className="text-[13px] font-extrabold text-white/85">Текстовое пояснение к видео</div>
                            <AppButton onClick={() => setNoteOpen((v) => !v)} className="h-9 px-4 text-[11px]">
                                {noteOpen ? "СВЕРНУТЬ" : "ОТКРЫТЬ"}
                            </AppButton>
                        </div>
                        {noteOpen && (
                            <div className="px-4 pb-4">
                                <textarea
                                    value={videoNotes[lesson.id] ?? ""}
                                    onChange={(e) => setVideoNotes((p) => ({ ...p, [lesson.id]: e.target.value }))}
                                    className="w-full min-h-[160px] bg-transparent outline-none text-[13px] text-white/85 placeholder:text-white/35 border rounded-[14px] p-3"
                                    style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)" }}
                                    placeholder="Добавь конспект/текстовые шаги/ссылки — это сильно повышает доходимость урока."
                                />
                                <div className="mt-2 text-[12px] text-white/55">Подсказка: держи 5–12 строк, списки и чек-листы. Длинные тексты лучше в PDF.</div>
                            </div>
                        )}
                    </div>
                </LibraryCard>
            </div>

            <div>
                <SectionTitle>МАТЕРИАЛЫ (PDF)</SectionTitle>
                <LibraryCard>
                    <div className="space-y-2">
                        {pdfItems.map((p, i) => (
                            <div
                                key={i}
                                className="rounded-[14px] border p-3 flex items-center justify-between"
                                style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}
                            >
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-white/90 truncate">{p.name}</div>
                                    <div className="text-[12px] text-white/55 mt-0.5">{"pages" in p && typeof p.pages === "number" ? `${p.pages} стр.` : "PDF"}</div>
                                </div>
                                <AppButton>ОТКРЫТЬ</AppButton>
                            </div>
                        ))}
                    </div>

                    {isAdmin ? (
                        <div className="mt-3">
                            <label className="cursor-pointer inline-flex">
                                <AppButtonLabel>ЗАГРУЗИТЬ PDF</AppButtonLabel>
                                <span className="sr-only">загрузить PDF</span>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setUploadedPdfNames((prev) => [f.name, ...prev]);
                                    }}
                                />
                            </label>
                        </div>
                    ) : null}
                </LibraryCard>
            </div>

            <div>
                <SectionTitle>КОММЕНТАРИИ ПОД ВИДЕО</SectionTitle>
                <LibraryCard>
                    <div className="rounded-[14px] border p-3" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(0,230,118,0.10)" }} />
                            <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Написать комментарий…"
                                className="w-full bg-transparent outline-none placeholder:text-white/45 text-white/85 text-[13px]"
                            />
                            <AppButton onClick={() => void addComment()} className="shrink-0">
                                {submittingComment ? "ОТПРАВКА..." : "ОТПРАВИТЬ"}
                            </AppButton>
                        </div>
                    </div>

                    {commentsWarning ? <div className="mt-2 text-xs text-white/60">{commentsWarning}</div> : null}

                    <div className="mt-3 space-y-2">
                        {openedComments.map((c, i) => (
                            <div key={i} className="rounded-[14px] border p-3" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-[12px] font-bold text-white/85">{c.author || "Пользователь"}</div>
                                    <div className="text-[11px] text-white/45">{c.ts}</div>
                                </div>
                                <div className="mt-1 text-[13px] text-white/80">{c.text}</div>
                            </div>
                        ))}
                        {openedComments.length === 0 && <div className="text-[13px] text-white/60">Пока нет комментариев.</div>}
                    </div>
                </LibraryCard>
            </div>

            {lesson.task && (
                <div>
                    <SectionTitle>ЗАДАНИЕ</SectionTitle>
                    <LibraryCard>
                        <div className="text-[14px] font-extrabold text-white/90">{lesson.task.title}:</div>

                        <ol className="mt-2 space-y-2 list-decimal pl-5 text-[13px] text-white/80">
                            {lesson.task.questions.map((qq) => (
                                <li key={qq.id}>
                                    {qq.text} {qq.required && <span className="text-white/60">— *обязательное поле</span>}
                                </li>
                            ))}
                        </ol>

                        <div className="mt-4 space-y-3">
                            {lesson.task.questions.map((qq, idx) => (
                                <div key={qq.id} className="rounded-[14px] border p-3" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                                    <div className="text-[12px] text-white/70 font-bold">
                                        {idx + 1}. {qq.text}
                                    </div>
                                    <textarea
                                        value={answers[qq.id] ?? ""}
                                        onChange={(e) => setAnswers((prev) => ({ ...prev, [qq.id]: e.target.value }))}
                                        className="mt-2 w-full min-h-[90px] bg-transparent outline-none text-[13px] text-white/85 placeholder:text-white/35"
                                        placeholder="Ваш ответ…"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <AppButton
                                onClick={() => {
                                    const missing = lesson.task!.questions.filter((qq) => qq.required && !(answers[qq.id] || "").trim());
                                    if (missing.length) {
                                        alert(`Заполни обязательные поля: ${missing.map((m) => m.id).join(", ")}`);
                                        return;
                                    }
                                    alert("Отправлено! (в прототипе без бэка)");
                                }}
                            >
                                ОТПРАВИТЬ
                            </AppButton>
                        </div>
                    </LibraryCard>
                </div>
            )}
        </div>
    );
}
