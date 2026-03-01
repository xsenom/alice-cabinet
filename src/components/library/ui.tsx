import React from "react";
import { TOKENS } from "../../lib/library/tokens";

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return <div className="text-[13px] font-extrabold tracking-wide text-white/70 mb-2">{children}</div>;
}

export function LibraryCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="rounded-[18px] border p-4"
            style={{
                borderColor: TOKENS.stroke,
                background: "rgba(255,255,255,0.05)",
                boxShadow: TOKENS.shadow,
            }}
        >
            {children}
        </div>
    );
}
