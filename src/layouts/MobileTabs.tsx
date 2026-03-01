// src/layouts/MobileTabs.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

export type NavItem = {
    to: string;
    label: string;
    icon: "home" | "library" | "assistant" | "profile";
};

// Активный таб — в медно-янтарной гамме как твоя primary Button
const TAB_ACTIVE_COPPER =
    "text-[#07120E] " +
    "bg-gradient-to-b from-[#B56A18] via-[#A85A12] to-[#7E3D0A] " +
    "shadow-[0_10px_30px_rgba(0,0,0,0.35)] " +
    "border border-[#C57A24]/30 " +
    "hover:brightness-[1.03]";

function TabIcon({ name, active }: { name: NavItem["icon"]; active?: boolean }) {
    // В активном табе делаем иконку тёмной (как текст на кнопке)
    const c = active ? "text-[#07120E]" : "text-[#A9B3AE]";
    const base = "h-5 w-5";

    if (name === "home")
        return (
            <svg viewBox="0 0 24 24" className={`${base} ${c}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 11.5 12 4l9 7.5" />
                <path d="M6.5 10.8V20h11V10.8" />
            </svg>
        );

    if (name === "library")
        return (
            <svg viewBox="0 0 24 24" className={`${base} ${c}`} fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 4h12v16H6z" />
                <path d="M9 7h6" />
                <path d="M9 11h6" />
                <path d="M9 15h4" />
            </svg>
        );

    if (name === "assistant")
        return (
            <svg viewBox="0 0 24 24" className={`${base} ${c}`} fill="currentColor" aria-hidden>
                <path d="M12 2.6l1.25 5.15 5.15 1.25-5.15 1.25L12 15.4l-1.25-5.15L5.6 9l5.15-1.25L12 2.6z" />
                <path d="M18.7 11.1l.55 2.25 2.25.55-2.25.55-.55 2.25-.55-2.25-2.25-.55 2.25-.55.55-2.25z" />
                <path d="M5.6 12.8l.45 1.85 1.85.45-1.85.45-.45 1.85-.45-1.85-1.85-.45 1.85-.45.45-1.85z" />
            </svg>
        );

    // profile
    return (
        <svg viewBox="0 0 24 24" className={`${base} ${c}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
    );
}

export default function MobileTabs({ items }: { items: NavItem[] }) {
    const location = useLocation();

    // Tailwind не любит динамику grid-cols-${n} → фикс/мап
    const gridColsClass =
        items.length === 4 ? "grid-cols-4" : items.length === 3 ? "grid-cols-3" : "grid-cols-2";

    return (
        <div className="fixed inset-x-0 bottom-0 z-20">
            <div className="mx-auto w-full max-w-md px-4 pb-4">
                <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.78)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)]">
                    <div className={`grid ${gridColsClass}`}>
                        {items.map((t) => {
                            const active =
                                t.to === "/"
                                    ? location.pathname === "/"
                                    : location.pathname === t.to || location.pathname.startsWith(t.to + "/");

                            return (
                                <NavLink
                                    key={t.to}
                                    to={t.to}
                                    end={t.to === "/"}
                                    className={() =>
                                        "mx-2 my-2 rounded-2xl px-2 py-3 transition " +
                                        "flex flex-col items-center justify-center gap-1 " +
                                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.99] " +
                                        (active ? TAB_ACTIVE_COPPER : "text-[#A9B3AE] hover:bg-white/5")
                                    }
                                >
                                    <TabIcon name={t.icon} active={active} />
                                    <span className={"text-[11px] " + (active ? "font-semibold" : "")}>{t.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
