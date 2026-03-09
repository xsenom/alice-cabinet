import type { Lesson, TopicKey } from "./types";

const FALLBACK_TASK = {
    title: "Домашнее задание",
    questions: [{ id: "q1", text: "Сделайте конспект ключевых шагов и примените их в своём проекте.", required: true }],
};

export const DEMO: Record<TopicKey, Lesson[]> = {
    Воронки: [
        {
            id: "f01",
            n: 1,
            title: "Продуктовая линейка",
            needTask: true,
            goal: "Разобраться в логике продуктовой линейки и пути клиента.",
            video: { label: "Урок 01 — Продуктовая линейка", url: "/videos/funnel-01.mp4" },
            pdfs: [{ name: "Шаблон продуктовой линейки.pdf", pages: 2 }],
            task: FALLBACK_TASK,
        },
        {
            id: "f02",
            n: 2,
            title: "Прогревы",
            needTask: true,
            goal: "Понять структуру прогревов и точки касания.",
            video: { label: "Урок 02 — Прогревы", url: "/videos/funnel-02.mp4" },
            pdfs: [{ name: "Схемы прогрева.pdf", pages: 3 }],
            task: FALLBACK_TASK,
        },
    ],
    Боты: [
        {
            id: "b01",
            n: 1,
            title: "Сценарии бота и ветвления",
            needTask: true,
            premium: true,
            goal: "Собрать структуру диалога и логику ветвления.",
            video: { label: "Боты 01 — Сценарии", url: "/videos/bot-01.mp4" },
            pdfs: [{ name: "Карта сценариев.pdf", pages: 2 }],
            task: FALLBACK_TASK,
        },
    ],
    AI: [
        {
            id: "ai01",
            n: 1,
            title: "AI-ассистент для контента",
            needTask: false,
            premium: true,
            goal: "Автоматизировать генерацию контента и рубрик.",
            video: { label: "AI 01 — Ассистент", url: "/videos/ai-01.mp4" },
            pdfs: [{ name: "Промпт-пак.pdf", pages: 1 }],
            task: FALLBACK_TASK,
        },
    ],
    "Mini App": [
        {
            id: "m01",
            n: 1,
            title: "Mini App: экран каталога",
            needTask: false,
            premium: true,
            goal: "Понять как собрать структуру Mini App в Telegram.",
            video: { label: "Mini App 01 — Каталог", url: "/videos/miniapp-01.mp4" },
            pdfs: [{ name: "Mini App wireframe.pdf", pages: 2 }],
            task: FALLBACK_TASK,
        },
    ],
};
