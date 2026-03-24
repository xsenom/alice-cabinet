import React from "react";
import { TOKENS } from "../../lib/library/tokens";

export function LibraryChip({
    active,
    children,
    onClick,
}: {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition"
            style={{
                color: active ? "#07120E" : "rgba(255,219,180,0.92)",
                background: active
                    ? "linear-gradient(180deg, #B56A18, #7E3D0A)"
                    : "linear-gradient(180deg, rgba(181,106,24,0.24), rgba(126,61,10,0.18))",
                borderColor: active ? "rgba(197,122,36,0.42)" : "rgba(197,122,36,0.25)",
                boxShadow: active ? "0 10px 26px rgba(0,0,0,0.25)" : "0 6px 20px rgba(0,0,0,0.14)",
                textShadow: active ? undefined : "0 1px 0 rgba(0,0,0,0.25)",
                backdropFilter: active ? undefined : "blur(8px)",
            }}
        >
            {children}
        </button>
    );
}
