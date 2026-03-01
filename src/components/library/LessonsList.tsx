import React from "react";
import type { Lesson, TopicKey } from "../../lib/library/types";
import { TOKENS } from "../../lib/library/tokens";
import { LessonRow } from "./LessonRow";

export function LessonsList({
                                topic,
                                lessons,
                                onOpenLesson,
                            }: {
    topic: TopicKey;
    lessons: Lesson[];
    onOpenLesson: (id: string) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="text-[14px]" style={{ color: TOKENS.textDim }}>
                Активная тема: <span className="font-semibold" style={{ color: TOKENS.text }}>{topic}</span>
            </div>

            {lessons.length === 0 ? (
                <div className="rounded-[18px] border p-4 text-white/70" style={{ borderColor: TOKENS.stroke, background: "rgba(255,255,255,0.04)" }}>
                    В этой теме пока нет уроков (или ничего не найдено по поиску).
                </div>
            ) : (
                <div className="space-y-3">
                    {lessons.map((l) => (
                        <LessonRow key={l.id} lesson={l} onOpen={() => onOpenLesson(l.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}
