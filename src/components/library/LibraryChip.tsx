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
            className="shrink-0 px-3 py-2 rounded-full text-[13px] font-semibold border"
            style={{
                color: active ? TOKENS.text : "rgba(242,244,243,0.70)",
                background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.06)",
                borderColor: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)",
                boxShadow: active ? "0 10px 26px rgba(0,0,0,0.18)" : undefined,
            }}
        >
            {children}
        </button>
    );
}
