import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { TopicKey } from "../lib/library/types";
import { buildLibraryLessonsMap, loadLibraryContentSettings } from "../lib/adminLibrary";
import { TOKENS } from "../lib/library/tokens";
import { useSessionProfile } from "../hooks/useSessionProfile";

import { LibraryTopBar } from "../components/library/TopBar";
import { LibraryChip } from "../components/library/LibraryChip";
import { LessonsList } from "../components/library/LessonsList";
import { LessonScreen } from "../components/library/LessonScreen";
import Button from "../components/ui/Button";

const TOPICS: TopicKey[] = ["Воронки", "Боты", "AI", "Mini App"];

export default function LibraryPage() {
    const { profile } = useSessionProfile();
    const nav = useNavigate();
    const location = useLocation();

    const [topic, setTopic] = useState<TopicKey>("Воронки");
    const [openedLessonId, setOpenedLessonId] = useState<string | null>(null);

    const hasPaid =
        !!profile?.plan_expires_at &&
        new Date(profile.plan_expires_at).getTime() > Date.now() &&
        profile?.plan_status !== "free";

    const libraryContent = useMemo(() => buildLibraryLessonsMap(loadLibraryContentSettings()), []);
    const lessons = useMemo(() => libraryContent[topic] ?? [], [libraryContent, topic]);

    const opened = useMemo(() => {
        if (!openedLessonId) return null;
        return (libraryContent[topic] ?? []).find((l) => l.id === openedLessonId) ?? null;
    }, [libraryContent, topic, openedLessonId]);

    useEffect(() => {
        const openId = new URLSearchParams(location.search).get("open");
        if (!openId) return;

        for (const t of TOPICS) {
            const found = (libraryContent[t] ?? []).find((l) => l.id === openId);
            if (found) {
                if (found.premium && !hasPaid) return;
                setTopic(t);
                setOpenedLessonId(found.id);
                return;
            }
        }
    }, [location.search, hasPaid, libraryContent]);

    return (
        <div
            className="rounded-[28px] border p-4 md:p-5"
            style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: `linear-gradient(180deg, ${TOKENS.bgTop} 0%, ${TOKENS.bgMid} 32%, ${TOKENS.bgBot} 100%)`,
            }}
        >
            <LibraryTopBar />

            <div className="mt-5">
                <div className="text-[34px] font-extrabold" style={{ color: TOKENS.text }}>
                    Библиотека
                </div>
                <div className="mt-2 text-[14px]" style={{ color: TOKENS.textDim }}>
                    Темы, уроки, видео, PDF, задания и комментарии
                </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TOPICS.map((t) => (
                    <LibraryChip
                        key={t}
                        active={topic === t}
                        onClick={() => {
                            setTopic(t);
                            setOpenedLessonId(null);
                        }}
                    >
                        {t}
                    </LibraryChip>
                ))}
            </div>

            {!hasPaid ? (
                <div className="mt-4 rounded-2xl border border-[#C57A24]/30 bg-[#7E3D0A]/20 p-3 text-sm text-orange-100">
                    У вас бесплатный доступ: часть видео в темах Боты / AI / Mini App будет закрыта.
                    <div className="mt-2">
                        <Button onClick={() => nav("/profile")}>Открыть подписку</Button>
                    </div>
                </div>
            ) : null}

            <div className="mt-5">
                {!opened ? (
                    <LessonsList topic={topic} lessons={lessons} onOpenLesson={(id) => setOpenedLessonId(id)} hasPaid={hasPaid} />
                ) : (
                    <LessonScreen topic={topic} lesson={opened} onClose={() => setOpenedLessonId(null)} />
                )}
            </div>
        </div>
    );
}
