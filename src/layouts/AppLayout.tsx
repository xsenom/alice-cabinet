import React from "react";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";
import MobileTabs, { NavItem } from "./MobileTabs";
import DesktopSidebar from "./DesktopSidebar";
import NetworkCanvasBackground from "../components/background/NetworkCanvasBackground";
import ForestBackdrop from "../components/background/ForestBackdrop";
import { useSessionProfile } from "../hooks/useSessionProfile";
import { APP_NAME } from "../lib/branding";
import { SITE_FOOTER } from "../lib/siteConfig";

const TOKENS = { text: "#F2F4F3" };

const BASE_NAV: NavItem[] = [
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

    const navItems: NavItem[] = profile?.status_admin
        ? [...BASE_NAV, { to: "/admin", label: "Админ", icon: "admin" }]
        : BASE_NAV;

    return (
        <div className="min-h-screen" style={{ color: TOKENS.text }}>
            <ForestBackdrop />
            {!reduceMotion && <NetworkCanvasBackground density={isDesktop ? 58 : 40} />}

            <div className={isDesktop ? "mx-auto max-w-6xl px-6 py-6" : ""}>
                {isDesktop ? (
                    <div className="grid grid-cols-[280px_1fr] gap-6">
                        <DesktopSidebar items={navItems} />
                        <main className="min-w-0 space-y-4">
                            <Outlet />
                            <FooterBlock />
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
                                    {name ? `${name}, всё получится!` : APP_NAME}
                                </div>
                            </div>

                            <Outlet />
                            <FooterBlock />
                        </main>
                        <MobileTabs items={navItems} />
                    </>
                )}
            </div>
        </div>
    );
}


function FooterBlock() {
    return (
        <footer className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.45)] px-4 py-4 text-sm text-white/70 backdrop-blur-xl">
            <div className="font-semibold text-white">{APP_NAME}</div>
            <div className="mt-1 text-xs text-white/55">{SITE_FOOTER.caption}</div>

            {SITE_FOOTER.links.length ? (
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/75">
                    {SITE_FOOTER.links.map((link) =>
                        link.href ? (
                            <a key={link.label} href={link.href} className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/5">
                                <span className="text-white/45">{link.label}:</span> {link.value}
                            </a>
                        ) : (
                            <div key={link.label} className="rounded-full border border-white/10 px-3 py-1">
                                <span className="text-white/45">{link.label}:</span> {link.value}
                            </div>
                        )
                    )}
                </div>
            ) : null}

            <div className="mt-3 text-xs text-white/45">{SITE_FOOTER.legalText}</div>
        </footer>
    );
}
