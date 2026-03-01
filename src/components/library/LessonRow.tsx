import React from "react";
import type { Lesson } from "../../lib/library/types";
import { TOKENS } from "../../lib/library/tokens";
import { AppButton } from "./LibraryButtons";

export function LessonRow({ lesson, onOpen }: { lesson: Lesson; onOpen: () => void }) {
    return (
        <div className="flex gap-3">
            {/* left poster */}
            <div
                className="w-[170px] h-[84px] rounded-[14px] border overflow-hidden relative"
                style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "linear-gradient(135deg, rgba(25,60,110,0.95), rgba(5,12,9,0.9))",
                }}
            >
                <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at 30% 20%, rgba(0,230,118,0.22), transparent 55%)" }} />
                <div className="relative p-3 h-full flex flex-col justify-between">
                    <div className="text-white/90 font-black tracking-wide">
                        УРОК <span className="text-white">/{String(lesson.n).padStart(2, "0")}</span>
                    </div>
                    <AppButton onClick={onOpen} className="h-9 px-4 text-[11px]">
                        ПЕРЕЙТИ
                    </AppButton>
                </div>
            </div>

            {/* right content */}
            <button
                type="button"
                onClick={onOpen}
                className="flex-1 rounded-[14px] border p-3 text-left"
                style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.06)", boxShadow: TOKENS.shadow }}
            >
                {lesson.needTask && (
                    <div
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-bold border"
                        style={{ borderColor: "rgba(47,107,255,0.45)", background: "rgba(47,107,255,0.16)", color: "rgba(242,244,243,0.92)" }}
                    >
                        Необходимо выполнить задание
                    </div>
                )}
                <div className="mt-2 text-[22px] leading-[1.1] font-semibold" style={{ color: "rgba(242,244,243,0.92)" }}>
                    {lesson.title}
                </div>
            </button>
        </div>
    );
}
