import React from "react";

export default function Chip({
                                 children,
                                 active,
                                 onClick,
                             }: {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={
                "whitespace-nowrap rounded-full px-3 py-2 text-xs border transition " +
                (active
                    ? "border-[rgba(192,122,42,0.55)] bg-[rgba(192,122,42,0.18)] text-[#F2F4F3]"
                    : "border-white/10 bg-white/5 text-[#A9B3AE] hover:text-[#F2F4F3]")
            }
        >
            {children}
        </button>
    );
}
