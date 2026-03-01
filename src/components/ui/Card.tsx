import React from "react";

export default function Card({
                                 children,
                                 className = "",
                             }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={
                "rounded-3xl border border-emerald-500/15 " +
                "bg-[rgba(6,17,13,0.72)] " +
                "shadow-[0_18px_70px_rgba(0,0,0,0.45)] " +
                "backdrop-blur-xl " +
                className
            }
            style={{
                // лёгкая подсветка “лесом” изнутри
                backgroundImage:
                    "radial-gradient(900px 420px at 50% 115%, rgba(34,197,94,0.10), rgba(0,0,0,0) 60%)",
            }}
        >
            {children}
        </div>
    );
}
