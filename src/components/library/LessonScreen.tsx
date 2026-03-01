import React, { useEffect, useMemo, useState } from "react";
import type { Lesson, LessonComment, TopicKey } from "../../lib/library/types";
import { TOKENS } from "../../lib/library/tokens";
import { AppButton, AppButtonLabel } from "./LibraryButtons";
import { LibraryCard, SectionTitle } from "./ui";

export function LessonScreen({
                                 topic,
                                 lesson,
                                 onClose,
                             }: {
    topic: TopicKey;
    lesson: Lesson;
    onClose: () => void;
}) {
    // pseudo uploads
    const [uploadedVideoName, setUploadedVideoName] = useState<string | null>(null);
    const [uploadedPdfNames, setUploadedPdfNames] = useState<string[]>([]);

    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<LessonComment[]>([
        { lessonId: "f01", text: "Супер! Наконец-то стало понятно, как выстроить линейку.", ts: "сегодня, 12:40" },
    ]);

    const [answers, setAnswers] = useState<Record<string, string>>({});


    // rating per lesson: 1..5
    const [ratings, setRatings] = useState<Record<string, number>>({});

    // video text note (admin/author content) per lesson
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

    // ✅ ВАЖНО: сброс локальных состояний при смене урока
    useEffect(() => {
        setUploadedVideoName(null);
        setUploadedPdfNames([]);
        setAnswers({});
        setCommentText("");
        setNoteOpen(false);
    }, [lesson.id]);

    const openedComments = useMemo(
        () => comments.filter((c) => c.lessonId === lesson.id),
        [comments, lesson.id]
    );

    const addComment = () => {
        const t = commentText.trim();
        if (!t) return;
        setComments((prev) => [{ lessonId: lesson.id, text: t, ts: "только что" }, ...prev]);
        setCommentText("");
    };

    // ✅ Нормализация, чтобы не падать на spread
    const pdfs = lesson.pdfs ?? [];
    const pdfItems = [...pdfs, ...uploadedPdfNames.map((name) => ({ name }))];

    return (
        <div className="space-y-5">
            {/* breadcrumb */}
            <div className="flex items-center justify-between gap-3">
                <div className="text-white/70 text-[13px]">
                    {topic} /{" "}
                    <span className="text-white/90 font-semibold">
            Урок /{String(lesson.n).padStart(2, "0")}
          </span>
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

            {/* lesson title */}
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

            {/* goal */}
            <LibraryCard>
                <div className="text-[14px] font-extrabold text-white/95 underline underline-offset-4">
                    ЦЕЛЬ УРОКА:
                </div>
                <div className="mt-2 text-[14px] text-white/80 leading-relaxed">{lesson.goal}</div>
            </LibraryCard>

            {/* video */}
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
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(circle at 35% 25%, rgba(47,107,255,0.22), transparent 60%)",
                                }}
                            />
                            <div className="relative flex flex-col items-center gap-2">
                                <div
                                    className="h-16 w-16 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(47,107,255,0.85)" }}
                                >
                                    <div className="text-black text-[18px] font-black">▶</div>
                                </div>
                                <div className="text-[13px] text-white/70">{lesson.video?.label ?? "Видео урока"}</div>
                                {uploadedVideoName && (
                                    <div className="text-[12px] text-white/60">Загружено: {uploadedVideoName}</div>
                                )}
                            </div>
                        </div>
                    </div>

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

                    {/* rating bar */}
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
                            ] as const).map((it) => {
                                const active = (ratings[lesson.id] ?? 0) === it.v;
                                return (
                                    <button
                                        key={it.v}
                                        type="button"
                                        onClick={() => setRatings((p) => ({ ...p, [lesson.id]: it.v }))}
                                        className="h-9 w-9 rounded-full border flex items-center justify-center text-[18px]"
                                        style={{
                                            borderColor: active ? "rgba(0,230,118,0.40)" : "rgba(255,255,255,0.12)",
                                            background: active ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.04)",
                                            transform: active ? "translateY(-1px)" : undefined,
                                        }}
                                        aria-label={`Оценка ${it.v}`}
                                    >
                                        {it.e}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* video note (collapsible) */}
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
                                <div className="mt-2 text-[12px] text-white/55">
                                    Подсказка: держи 5–12 строк, списки и чек-листы. Длинные тексты лучше в PDF.
                                </div>
                            </div>
                        )}
                    </div>
                </LibraryCard>
            </div>

            {/* pdf */}
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
                                    {"pages" in p && (p as any).pages ? (
                                        <div className="text-[12px] text-white/55 mt-0.5">{(p as any).pages} стр.</div>
                                    ) : (
                                        <div className="text-[12px] text-white/55 mt-0.5">PDF</div>
                                    )}
                                </div>
                                <AppButton>ОТКРЫТЬ</AppButton>
                            </div>
                        ))}
                    </div>

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
                </LibraryCard>
            </div>

            {/* comments */}
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
                            <AppButton onClick={() => commentText.trim() && addComment()} className="shrink-0">
                                ОТПРАВИТЬ
                            </AppButton>
                        </div>
                    </div>

                    <div className="mt-3 space-y-2">
                        {openedComments.map((c, i) => (
                            <div key={i} className="rounded-[14px] border p-3" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)" }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-[12px] font-bold text-white/85">Илья</div>
                                    <div className="text-[11px] text-white/45">{c.ts}</div>
                                </div>
                                <div className="mt-1 text-[13px] text-white/80">{c.text}</div>
                            </div>
                        ))}
                        {openedComments.length === 0 && <div className="text-[13px] text-white/60">Пока нет комментариев.</div>}
                    </div>
                </LibraryCard>
            </div>

            {/* ✅ task (только если реально есть) */}
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
                                    const missing = lesson.task!.questions.filter(
                                        (qq) => qq.required && !(answers[qq.id] || "").trim()
                                    );
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