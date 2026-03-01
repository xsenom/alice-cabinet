// src/layouts/navStyles.ts

export const NAV_BASE =
    "rounded-xl px-4 py-3 text-sm border transition " +
    "border-white/10 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 " +
    "active:scale-[0.99]";

export const NAV_ACTIVE_STEEL =
    // “стальной” эффект: холодный градиент + блик + контур
    "text-white " +
    "bg-gradient-to-b from-white/14 via-white/8 to-white/4 " +
    "shadow-[0_12px_34px_rgba(0,0,0,0.45)] " +
    "border-white/20 " +
    "backdrop-blur-xl " +
    "hover:brightness-[1.06]";

export const NAV_INACTIVE =
    "bg-transparent text-white/70 hover:bg-white/5 hover:text-white/85";
