import React, { useMemo, useState } from "react";
import type { TopicKey } from "../lib/library/types";
import { DEMO } from "../lib/library/demo";
import { TOKENS } from "../lib/library/tokens";

import { LibraryTopBar } from "../components/library/TopBar";
import { LibraryBottomTabs } from "../components/library/BottomTabs";
import { LibraryChip } from "../components/library/LibraryChip";
import { LessonsList } from "../components/library/LessonsList";
import { LessonScreen } from "../components/library/LessonScreen";

export default function LibraryPage() {
    const [topic, setTopic] = useState<TopicKey>("Воронки");
    const [openedLessonId, setOpenedLessonId] = useState<string | null>(null);

    const lessons = useMemo(() => DEMO[topic] ?? [], [topic]);

    const opened = useMemo(() => {
        if (!openedLessonId) return null;
        return (DEMO[topic] ?? []).find((l) => l.id === openedLessonId) ?? null;
    }, [topic, openedLessonId]);

    return (
        <div className="min-h-screen w-full bg-black flex items-start justify-center p-3">
            <div
                className="relative w-[980px] max-w-[98vw] h-[820px] overflow-hidden rounded-[28px] border"
                style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: `linear-gradient(180deg, ${TOKENS.bgTop} 0%, ${TOKENS.bgMid} 32%, ${TOKENS.bgBot} 100%)`,
                }}
            >
                <LibraryTopBar />

                {/* header row */}
                <div className="px-4 mt-6 flex items-end justify-between gap-4">
                    <div>
                        <div className="text-[26px] font-extrabold" style={{ color: TOKENS.text }}>
                            Библиотека
                        </div>
                        <div className="mt-2 text-[14px]" style={{ color: TOKENS.textDim }}>
                            Темы, уроки, видео, PDF, задания и комментарии
                        </div>
                    </div>
                </div>

                {/* topic chips */}
                <div className="px-4 mt-4">
                    <div className="flex gap-2 overflow-auto pb-1" style={{ maskImage: "linear-gradient(90deg, black 92%, transparent 100%)" }}>
                        {(["Воронки", "Боты", "AI", "Mini App"] as TopicKey[]).map((t) => (
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
                </div>

                {/* main */}
                <div className="px-4 mt-5 pb-[120px] h-[640px] overflow-auto">
                    {!opened ? (
                        <LessonsList topic={topic} lessons={lessons} onOpenLesson={(id) => setOpenedLessonId(id)} />
                    ) : (
                        <LessonScreen topic={topic} lesson={opened} onClose={() => setOpenedLessonId(null)} />
                    )}
                </div>

                <LibraryBottomTabs />
            </div>
        </div>
    );
}
