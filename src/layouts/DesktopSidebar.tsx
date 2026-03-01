// src/layouts/DesktopSidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import type { NavItem } from "./MobileTabs";

// Активный пункт — в медно-янтарной гамме как твоя primary Button
const NAV_ACTIVE_COPPER =
    "text-[#07120E] " +
    "bg-gradient-to-b from-[#B56A18] via-[#A85A12] to-[#7E3D0A] " +
    "shadow-[0_10px_30px_rgba(0,0,0,0.35)] " +
    "border border-[#C57A24]/30 " +
    "hover:brightness-[1.03]";

export default function DesktopSidebar({ items }: { items: NavItem[] }) {
    return (
        <aside className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.55)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)] p-4">
            <div className="mb-3 text-lg font-semibold">Lesik</div>

            <nav className="flex flex-col gap-2">
                {items.map((t) => (
                    <NavLink
                        key={t.to}
                        to={t.to}
                        end={t.to === "/"}
                        className={({ isActive }) =>
                            "rounded-2xl px-4 py-3 text-sm font-semibold transition " +
                            "border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.99] " +
                            (isActive
                                ? NAV_ACTIVE_COPPER
                                : "border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white/85")
                        }
                    >
                        {t.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
