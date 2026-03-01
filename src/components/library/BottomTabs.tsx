import React from "react";
import { TOKENS } from "../../lib/library/tokens";

export function LibraryBottomTabs() {
    const Tab = ({ label, active }: { label: string; active?: boolean }) => (
        <button type="button" className="flex flex-col items-center justify-center gap-1 py-2">
            <div
                className="h-5 w-5 rounded-md border"
                style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background: active ? "rgba(0,230,118,0.10)" : "rgba(255,255,255,0.04)",
                }}
            />
            <div className="text-[11px] font-semibold" style={{ color: active ? TOKENS.accent : "rgba(242,244,243,0.70)" }}>
                {label}
            </div>
        </button>
    );

    return (
        <div
            className="absolute left-0 right-0 bottom-0 z-20 px-4 pb-5 pt-3"
            style={{
                background:
                    "linear-gradient(180deg, rgba(7,21,15,0) 0%, rgba(7,21,15,0.65) 30%, rgba(7,21,15,0.92) 100%)",
            }}
        >
            <div
                className="rounded-[22px] border px-3 py-2"
                style={{
                    background: "rgba(5,12,9,0.65)",
                    borderColor: "rgba(255,255,255,0.10)",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <div className="grid grid-cols-4">
                    <Tab label="Главная" />
                    <Tab label="Библиотека" active />
                    <Tab label="Ассистент" />
                    <Tab label="Профиль" />
                </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-28 rounded-full bg-white/10" />
        </div>
    );
}
