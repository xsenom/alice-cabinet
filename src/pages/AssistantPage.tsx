import React, { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { supabase } from "../lib/supabase/client";
import { useSessionProfile } from "../hooks/useSessionProfile";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

function todayKey() {
    return new Date().toISOString().slice(0, 10);
}

function buildReply(input: string, paid: boolean) {
    if (paid) {
        return `PRO-ассистент:\n1) Цель: ${input}\n2) План на 24 часа: сделай 3 шага (оффер, канал, CTA).\n3) Метрика: отслеживай конверсию в заявку и стоимость лида.`;
    }

    return `Бесплатный ассистент: понял запрос «${input}». Рекомендую начать с одного простого шага сегодня и проверить результат вечером.`;
}

export default function AssistantPage() {
    const { user, profile } = useSessionProfile();
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [countToday, setCountToday] = useState(0);
    const [usageWarning, setUsageWarning] = useState<string | null>(null);

    const paid =
        !!profile?.plan_expires_at &&
        new Date(profile.plan_expires_at).getTime() > Date.now() &&
        profile.plan_status !== "free";

    const dailyLimit = paid ? Infinity : 5;
    const reachedLimit = !paid && countToday >= dailyLimit;

    const usageStorageKey = useMemo(() => {
        if (!user?.id) return null;
        return `assistant_usage_${user.id}_${todayKey()}`;
    }, [user?.id]);

    useEffect(() => {
        let canceled = false;

        const loadUsage = async () => {
            if (!user?.id) return;

            const fallback = () => {
                if (!usageStorageKey) return;
                const v = Number(localStorage.getItem(usageStorageKey) || "0");
                if (!canceled) setCountToday(Number.isFinite(v) ? v : 0);
            };

            const { data, error } = await supabase
                .from("assistant_usage_les")
                .select("questions_count")
                .eq("user_id", user.id)
                .eq("date_key", todayKey())
                .maybeSingle();

            if (error) {
                setUsageWarning("Таблица лимитов пока не настроена в БД. Временно считаю лимит локально в браузере.");
                fallback();
                return;
            }

            if (!canceled) {
                setCountToday(data?.questions_count ?? 0);
                if (usageStorageKey) localStorage.setItem(usageStorageKey, String(data?.questions_count ?? 0));
            }
        };

        loadUsage();
        return () => {
            canceled = true;
        };
    }, [user?.id, usageStorageKey]);

    const persistUsage = async (next: number) => {
        if (usageStorageKey) localStorage.setItem(usageStorageKey, String(next));
        if (!user?.id) return;

        const { error } = await supabase.from("assistant_usage_les").upsert({
            user_id: user.id,
            date_key: todayKey(),
            questions_count: next,
        });

        if (error) {
            setUsageWarning("Не удалось записать лимит в БД (проверь SQL в SUPABASE_SETUP.md). Пока считаю локально.");
        }
    };

    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        if (reachedLimit) return;

        setSending(true);
        setInput("");

        const userMessage: ChatMessage = {
            id: `u_${Date.now()}`,
            role: "user",
            text,
        };

        setMessages((prev) => [...prev, userMessage]);

        const reply = buildReply(text, paid);

        const assistantMessage: ChatMessage = {
            id: `a_${Date.now()}_1`,
            role: "assistant",
            text: reply,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        const nextCount = countToday + 1;
        setCountToday(nextCount);
        await persistUsage(nextCount);

        setSending(false);
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-[rgba(6,17,13,0.72)] p-4 md:p-5 backdrop-blur-xl">
            <div className="text-2xl font-semibold">Ассистент</div>
            <div className="mt-1 text-sm text-white/70">
                {paid
                    ? "PRO-ассистент активен: расширенные подсказки и без лимита запросов."
                    : `Бесплатный ассистент: ${Math.max(0, dailyLimit - countToday)} из 5 вопросов осталось сегодня.`}
            </div>

            {usageWarning ? (
                <div className="mt-3 rounded-xl border border-orange-300/25 bg-orange-500/10 p-3 text-xs text-orange-100">
                    {usageWarning}
                </div>
            ) : null}

            <div className="mt-4 h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-sm text-white/55">Задай вопрос — получишь ответ в формате вопрос/ответ.</div>
                ) : null}

                {messages.map((m) => (
                    <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div
                            className={
                                "max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap " +
                                (m.role === "user"
                                    ? "bg-[#7E3D0A]/60 border border-[#C57A24]/30"
                                    : "bg-white/5 border border-white/10")
                            }
                        >
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Напиши вопрос ассистенту..."
                    className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-white/25"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") send();
                    }}
                />
                <Button onClick={send} disabled={sending || !input.trim() || reachedLimit}>
                    {reachedLimit ? "Лимит" : sending ? "Отправка..." : "Отправить"}
                </Button>
            </div>

            {!paid ? (
                <div className="mt-3 text-xs text-white/60">
                    На платном тарифе подключается другой ассистент (PRO) и снимается дневной лимит.
                </div>
            ) : null}
        </div>
    );
}
