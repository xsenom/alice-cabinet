import React from "react";
import type { Lesson } from "../../lib/library/types";
import { TOKENS } from "../../lib/library/tokens";
import { AppButton } from "./LibraryButtons";

export function LessonRow({
    lesson,
    onOpen,
    locked,
}: {
    lesson: Lesson;
    onOpen: () => void;
    locked?: boolean;
}) {
    return (
        <div className="flex gap-3">
            <div
                className="w-[170px] h-[84px] rounded-[14px] border overflow-hidden relative"
                style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "linear-gradient(135deg, rgba(19,65,44,0.95), rgba(5,12,9,0.9))",
                }}
            >
                <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at 30% 20%, rgba(0,230,118,0.22), transparent 55%)" }} />
                <div className="relative p-3 h-full flex flex-col justify-between">
                    <div className="text-white/90 font-black tracking-wide">
                        УРОК <span className="text-white">/{String(lesson.n).padStart(2, "0")}</span>
                    </div>
                    <AppButton onClick={locked ? undefined : onOpen} className={`h-9 px-4 text-[11px] ${locked ? "opacity-70" : ""}`}>
                        {locked ? "PRO" : "ПЕРЕЙТИ"}
                    </AppButton>
                </div>
            </div>

            <button
                type="button"
                onClick={onOpen}
                disabled={locked}
                className="flex-1 rounded-[14px] border p-3 text-left disabled:opacity-80"
                style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.06)", boxShadow: TOKENS.shadow }}
            >
                <div className="flex items-center gap-2">
                    {lesson.needTask && (
                        <div
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold border"
                            style={{ borderColor: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.08)", color: "rgba(242,244,243,0.92)" }}
                        >
                            Необходимо выполнить задание
                        </div>
                    )}
                    {locked ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border border-[#C57A24]/45 bg-[#7E3D0A]/60 text-white">
                            Только для подписки
                        </div>
                    ) : null}
                </div>
                <div className="mt-2 text-[22px] leading-[1.1] font-semibold" style={{ color: "rgba(242,244,243,0.92)" }}>
                    {lesson.title}
                </div>
            </button>
        </div>
    );
}
