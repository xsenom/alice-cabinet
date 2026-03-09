import React from "react";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import MobileTabs, { NavItem } from "./MobileTabs";
import DesktopSidebar from "./DesktopSidebar";
import NetworkCanvasBackground from "../components/background/NetworkCanvasBackground";
import ForestBackdrop from "../components/background/ForestBackdrop";
import { useSessionProfile } from "../hooks/useSessionProfile";

const TOKENS = { text: "#F2F4F3" };

const NAV: NavItem[] = [
    { to: "/", label: "Главная", icon: "home" },
    { to: "/library", label: "Библиотека", icon: "library" },
    { to: "/assistant", label: "Ассистент", icon: "assistant" },
    { to: "/profile", label: "Профиль", icon: "profile" },
];

export default function AppLayout() {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

    const { profile } = useSessionProfile();
    const name = (profile?.full_name ?? "").trim();

    return (
        <div className="min-h-screen" style={{ color: TOKENS.text }}>
            <ForestBackdrop />
            {!reduceMotion && <NetworkCanvasBackground density={isDesktop ? 58 : 40} />}

            <div className={isDesktop ? "mx-auto max-w-6xl px-6 py-6" : ""}>
                {isDesktop ? (
                    <div className="grid grid-cols-[280px_1fr] gap-6">
                        <DesktopSidebar items={NAV} />
                        <main className="min-w-0">
                            <Outlet />
                        </main>
                    </div>
                ) : (
                    <>
                        <main className="mx-auto w-full max-w-md px-4 pt-5 pb-24">
                            <div className="mb-4 flex items-center gap-3">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Аватар"
                                        className="h-10 w-10 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)] object-cover"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full border border-white/10 bg-black shadow-[0_10px_30px_rgba(0,0,0,0.35)]" />
                                )}
                                <div className="text-base font-semibold tracking-tight">
                                    {name ? `${name}, всё получится!` : "LESik"}
                                </div>
                            </div>

                            <Outlet />
                        </main>
                        <MobileTabs items={NAV} />
                    </>
                )}
            </div>
        </div>
    );
}
