import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

/**
 * LESik — single-file canvas prototype
 * - 4 tabs: Home / Library / Assistant / Profile
 * - Premium emerald theme + olive constellation
 * - NetworkCanvasBackground: DPR-aware, resize-safe, subtle drift + mouse parallax
 */

// ─────────────────────────────────────────────────────────────
// Theme tokens
// ─────────────────────────────────────────────────────────────
const TOKENS = {
    bg0: "#06110D",
    bg1: "#071A12",
    panel0: "#0D241A",
    panel1: "#102A20",
    neon: "#61FF8A",
    constellation: "#B7A85E",
    text: "#F2F4F3",
    muted: "#A9B3AE",
};

// ─────────────────────────────────────────────────────────────
// Small UI primitives
// ─────────────────────────────────────────────────────────────
function Card({
                  children,
                  className = "",
              }: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={
                "rounded-2xl border border-white/10 bg-[rgba(13,36,26,0.82)] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-md " +
                className
            }
        >
            {children}
        </div>
    );
}

function Button({
                    children,
                    onClick,
                    variant = "primary",
                    className = "",
                }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "ghost" | "chip";
    className?: string;
}) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition active:scale-[0.99]";
    const styles =
        variant === "primary"
            ? "bg-[rgba(97,255,138,0.14)] text-[#F2F4F3] border border-[rgba(97,255,138,0.26)] hover:bg-[rgba(97,255,138,0.18)]"
            : variant === "chip"
                ? "bg-white/5 text-[#F2F4F3] border border-white/10 hover:bg-white/7"
                : "bg-transparent text-[#F2F4F3] border border-white/10 hover:bg-white/5";
    return (
        <button onClick={onClick} className={`${base} ${styles} ${className}`}>
            {children}
        </button>
    );
}

function Chip({
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
                    ? "border-[rgba(183,168,94,0.55)] bg-[rgba(183,168,94,0.14)] text-[#F2F4F3]"
                    : "border-white/10 bg-white/5 text-[#A9B3AE] hover:text-[#F2F4F3]")
            }
        >
            {children}
        </button>
    );
}

function ProgressBar({ value }: { value: number }) {
    const v = Math.max(0, Math.min(100, value));
    return (
        <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden border border-white/10">
            <div
                className="h-full rounded-full"
                style={{
                    width: `${v}%`,
                    background:
                        "linear-gradient(90deg, rgba(183,168,94,0.0), rgba(183,168,94,0.75), rgba(97,255,138,0.50))",
                }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Canvas background
// ─────────────────────────────────────────────────────────────
type NodeT = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    kind: "dot" | "pinterest" | "telegram" | "instagram";
};

function NetworkCanvasBackground({
                                     density = 56,
                                 }: {
    density?: number; // 40–70
}) {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, has: false });
    const nodesRef = useRef<NodeT[]>([]);

    // Create nodes once per resize
    const setup = () => {
        const canvas = ref.current;
        if (!canvas) return;
        const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
        const w = Math.floor(window.innerWidth);
        const h = Math.floor(window.innerHeight);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // nodes
        const n = Math.max(40, Math.min(70, density));
        const nodes: NodeT[] = [];

        const specialKinds: NodeT["kind"][] = ["pinterest", "telegram", "instagram"];
        const specials = specialKinds.map((k) => ({ kind: k, placed: false }));

        for (let i = 0; i < n; i++) {
            const baseR = 1.2 + Math.random() * 1.8;
            const node: NodeT = {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                r: baseR,
                kind: "dot",
            };
            nodes.push(node);
        }

        // Place special icon nodes in upper band (top 25%)
        const bandY = h * 0.25;
        const placedIdx = new Set<number>();
        for (const s of specials) {
            for (let tries = 0; tries < 50; tries++) {
                const idx = Math.floor(Math.random() * nodes.length);
                if (placedIdx.has(idx)) continue;
                placedIdx.add(idx);
                nodes[idx].kind = s.kind;
                nodes[idx].y = Math.random() * bandY;
                nodes[idx].r = 2.2;
                s.placed = true;
                break;
            }
        }

        nodesRef.current = nodes;
    };

    useEffect(() => {
        setup();
        const onResize = () => setup();
        window.addEventListener("resize", onResize);

        const onMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
                has: true,
            };
        };
        window.addEventListener("mousemove", onMove, { passive: true });

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const tick = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // Clear
            ctx.clearRect(0, 0, w, h);

            // Subtle vignette wash (keeps premium feel)
            const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.5, Math.max(w, h));
            g.addColorStop(0, "rgba(183,168,94,0.06)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            const nodes = nodesRef.current;
            if (!nodes.length) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            const m = mouseRef.current;
            const px = m.has ? (m.x / w - 0.5) * 18 : 0;
            const py = m.has ? (m.y / h - 0.5) * 18 : 0;

            // Update positions
            for (const p of nodes) {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap
                if (p.x < -20) p.x = w + 20;
                if (p.x > w + 20) p.x = -20;
                if (p.y < -20) p.y = h + 20;
                if (p.y > h + 20) p.y = -20;
            }

            // Draw lines (thin, dim)
            const maxDist = 140;
            ctx.lineWidth = 0.75;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d = Math.hypot(dx, dy);
                    if (d > maxDist) continue;

                    // Fade by distance; keep very subtle overall
                    const alpha = (1 - d / maxDist) * 0.12;
                    ctx.strokeStyle = `rgba(183,168,94,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x + px * 0.25, a.y + py * 0.25);
                    ctx.lineTo(b.x + px * 0.25, b.y + py * 0.25);
                    ctx.stroke();
                }
            }

            // Draw nodes
            for (const p of nodes) {
                const x = p.x + px * 0.35;
                const y = p.y + py * 0.35;

                if (p.kind === "dot") {
                    ctx.fillStyle = "rgba(183,168,94,0.18)";
                    ctx.beginPath();
                    ctx.arc(x, y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                    continue;
                }

                // icon nodes: dim outline only
                drawIconNode(ctx, p.kind, x, y);
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <canvas
            ref={ref}
            className="fixed inset-0 -z-10"
            style={{ pointerEvents: "none" }}
            aria-hidden
        />
    );
}

function drawIconNode(
    ctx: CanvasRenderingContext2D,
    kind: "pinterest" | "telegram" | "instagram",
    x: number,
    y: number
) {
    const stroke = "rgba(183,168,94,0.28)"; // 8–12% overall feel
    const fill = "rgba(183,168,94,0.06)";

    // Slightly larger node circle
    const r = 14;
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (kind === "pinterest") {
        // Simple P (monochrome outline)
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.lineTo(-3, -6);
        ctx.quadraticCurveTo(-3, -10, 1, -10);
        ctx.quadraticCurveTo(7, -10, 7, -4);
        ctx.quadraticCurveTo(7, 2, 1, 2);
        ctx.quadraticCurveTo(-1, 2, -2, 1);
        ctx.stroke();
    } else if (kind === "telegram") {
        // Paper plane
        ctx.beginPath();
        ctx.moveTo(-9, -2);
        ctx.lineTo(10, -9);
        ctx.lineTo(3, 10);
        ctx.lineTo(-1, 3);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-1, 3);
        ctx.lineTo(10, -9);
        ctx.stroke();
    } else {
        // Instagram camera outline
        const s = 12;
        const rr = 3.5;
        roundRectPath(ctx, -s / 2, -s / 2, s, s, rr);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(4, -4, 1.2, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function roundRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ─────────────────────────────────────────────────────────────
// Layout + Tabs
// ─────────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="min-h-screen"
            style={{
                background: `radial-gradient(1200px 900px at 50% 0%, ${TOKENS.bg1} 0%, ${TOKENS.bg0} 55%, #040B08 100%)`,
                color: TOKENS.text,
            }}
        >
            <NetworkCanvasBackground density={56} />

            <div className="mx-auto w-full max-w-md px-4 pt-5 pb-24">
                {children}
            </div>

            <BottomTabs />
        </div>
    );
}

function TabIcon({ name, active }: { name: string; active?: boolean }) {
    const c = active ? "text-[#61FF8A]" : "text-[#A9B3AE]";
    const base = "h-5 w-5";
    // Minimal inline SVGs
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
                {/* Sparkle icon (emoji-like ✨): main sparkle + 2 micro sparkles */}
                <path d="M12 2.6l1.25 5.15 5.15 1.25-5.15 1.25L12 15.4l-1.25-5.15L5.6 9l5.15-1.25L12 2.6z" />
                <path d="M18.7 11.1l.55 2.25 2.25.55-2.25.55-.55 2.25-.55-2.25-2.25-.55 2.25-.55.55-2.25z" />
                <path d="M5.6 12.8l.45 1.85 1.85.45-1.85.45-.45 1.85-.45-1.85-1.85-.45 1.85-.45.45-1.85z" />
            </svg>
        );
    return (
        <svg viewBox="0 0 24 24" className={`${base} ${c}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
    );
}

function BottomTabs() {
    const location = useLocation();
    const tabs = useMemo(
        () => [
            { to: "/", label: "Главная", icon: "home" },
            { to: "/library", label: "Библиотека", icon: "library" },
            { to: "/assistant", label: "Ассистент", icon: "assistant" },
            { to: "/profile", label: "Профиль", icon: "profile" },
        ],
        []
    );

    return (
        <div className="fixed inset-x-0 bottom-0 z-20">
            <div className="mx-auto w-full max-w-md px-4 pb-4">
                <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.78)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)]">
                    <div className="grid grid-cols-4">
                        {tabs.map((t) => {
                            const active =
                                t.to === "/" ? location.pathname === "/" : location.pathname.startsWith(t.to);
                            return (
                                <NavLink
                                    key={t.to}
                                    to={t.to}
                                    className={() =>
                                        "flex flex-col items-center justify-center gap-1 py-3 text-[11px] " +
                                        (active ? "text-[#61FF8A]" : "text-[#A9B3AE]")
                                    }
                                >
                                    <TabIcon name={t.icon} active={active} />
                                    <span>{t.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Screens
// ─────────────────────────────────────────────────────────────
function ScreenHome() {
    // Home: top bar + stories + video shelf (mobile-first)
    const stories = useMemo(
        () => [
            { title: "Старт", sub: "кому полезно" },
            { title: "Воронка", sub: "путь" },
            { title: "Бот", sub: "логика" },
            { title: "AI", sub: "помощник" },
            { title: "Mini App", sub: "кабинет" },
            { title: "PRO", sub: "уроки" },
        ],
        []
    );

    const videos = useMemo(
        () => [
            {
                id: "v1",
                title: "Как пользоваться LESik",
                hint: "60 секунд: трафик → бот → воронка → оплата",
            },
            {
                id: "v2",
                title: "Кому будет полезно",
                hint: "5 кейсов: эксперты, школы, мастера, сервисы",
            },
            {
                id: "v3",
                title: "Mini App в Telegram",
                hint: "Каталог / квиз / кабинет / оплата — быстро",
            },
        ],
        []
    );

    return (
        <div className="space-y-4">
            {/* Top bar: одна строка, без иконок справа */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Cat avatar */}
                    <div
                        className="h-10 w-10 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                        style={{
                            background:
                                "radial-gradient(18px 18px at 32% 38%, rgba(97,255,138,0.95) 0%, rgba(97,255,138,0.55) 35%, rgba(0,0,0,0) 60%), radial-gradient(18px 18px at 68% 38%, rgba(97,255,138,0.95) 0%, rgba(97,255,138,0.55) 35%, rgba(0,0,0,0) 60%), radial-gradient(180px 120px at 50% 25%, rgba(183,168,94,0.08) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(16,42,32,0.95) 0%, rgba(6,17,13,0.95) 100%)",
                        }}
                    />

                    <div className="text-base font-semibold tracking-tight">
                        Катерина, все получится!
                    </div>
                </div>
            </div>

            {/* Stories row */}
            <div className="flex gap-3 overflow-x-auto pb-1">
                {stories.map((s) => (
                    <button key={s.title} className="shrink-0 flex flex-col items-center gap-2">
                        <div
                            className="rounded-full p-[2px]"
                            style={{
                                background: `linear-gradient(135deg, rgba(183,168,94,0.85), rgba(97,255,138,0.60))`,
                            }}
                        >
                            <div className="h-14 w-14 rounded-full bg-[rgba(6,17,13,0.85)] border border-white/10 grid place-items-center">
                                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10" />
                            </div>
                        </div>
                        <div className="text-[11px] text-[#A9B3AE] leading-tight text-center">
                            <div className="text-[#F2F4F3]">{s.title}</div>
                            <div className="opacity-80">{s.sub}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Video shelf */}
            <Card className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xl font-semibold tracking-tight">Видео</div>
                        <div className="text-xs text-[#A9B3AE]">как пользоваться и кому полезно</div>
                    </div>
                    <button className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 grid place-items-center text-[#A9B3AE] hover:text-[#F2F4F3]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {videos.map((v) => (
                        <VideoCard key={v.id} title={v.title} subtitle={v.hint} />
                    ))}
                </div>
            </Card>

            <Button variant="primary" className="w-full">
                Купить доступ
            </Button>
        </div>
    );
}

function VideoCard({
                       title,
                       subtitle,
                   }: {
    title: string;
    subtitle: string;
}) {
    return (
        <div className="shrink-0 w-[240px]">
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/20">
                <div className="relative aspect-[16/9]">
                    {/* Placeholder preview (swap to <video> later) */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(520px 320px at 30% 20%, rgba(97,255,138,0.18) 0%, rgba(13,36,26,0.35) 45%, rgba(0,0,0,0.45) 100%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-70"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))",
                        }}
                    />

                    <div className="absolute inset-0 grid place-items-center">
                        <div className="h-12 w-12 rounded-full border border-white/15 bg-black/25 backdrop-blur-md grid place-items-center">
                            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#F2F4F3]" fill="currentColor">
                                <path d="M9 7.5v9l8-4.5-8-4.5z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="text-lg font-semibold leading-tight">{title}</div>
                <div className="mt-1 text-sm text-[#A9B3AE] line-clamp-2">{subtitle}</div>
                <button className="mt-4 inline-flex items-center gap-2 text-sm text-[#A9B3AE] hover:text-[#F2F4F3]">
                    <span className="text-base">▶</span>
                    <span>Смотреть</span>
                </button>
            </div>
        </div>
    );
}

function QuickCard({
                       title,
                       desc,
                       onClick,
                   }: {
    title: string;
    desc: string;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/7 transition p-4"
        >
            <div className="text-sm font-medium">{title}</div>
            <div className="mt-1 text-xs text-[#A9B3AE]">{desc}</div>
        </button>
    );
}

function ScreenLibrary() {
    // Библиотека: видео + инструкции + тесты (как база знаний)
    const [active, setActive] = useState<string>("Воронки");
    const [q, setQ] = useState("");
    const filters = ["Воронки", "Боты", "AI", "Mini App", "Контент", "Упаковка", "Тесты"];

    type Item = {
        id: string;
        title: string;
        track: string;
        kind: "video" | "guide" | "test";
        pro?: boolean;
        duration?: string;
        progress?: number;
        descr: string;
    };

    const items: Item[] = useMemo(
        () => [
            {
                id: "v-how",
                title: "Как пользоваться LESik",
                track: "Старт",
                kind: "video",
                pro: false,
                duration: "1:05",
                progress: 0,
                descr: "Быстро покажу: где уроки, как выбирать маршруты и что делать по шагам.",
            },
            {
                id: "f-101",
                title: "Воронка 101: Трафик → Бот → Оффер",
                track: "Воронки",
                kind: "video",
                pro: true,
                duration: "7:40",
                progress: 18,
                descr: "Скелет воронки и логика переходов. Без воды.",
            },
            {
                id: "b-lead",
                title: "Бот для заявки: структура диалога",
                track: "Боты",
                kind: "guide",
                pro: true,
                progress: 45,
                descr: "Шаблон: приветствие → сегментация → квалификация → заявка.",
            },
            {
                id: "b-pay",
                title: "Бот для оплаты: шаги и ошибки",
                track: "Боты",
                kind: "video",
                pro: true,
                duration: "6:10",
                progress: 10,
                descr: "Как довести до оплаты и не потерять конверсию на последнем шаге.",
            },
            {
                id: "ai-script",
                title: "AI‑ассистент: промпт‑каркас под нишу",
                track: "AI",
                kind: "guide",
                pro: true,
                progress: 0,
                descr: "Роли, ограничения, тон, память, сценарии и триггеры — в одном каркасе.",
            },
            {
                id: "ai-qa",
                title: "Тест: готов ли твой продукт к AI‑ассистенту?",
                track: "Тесты",
                kind: "test",
                pro: false,
                progress: 0,
                descr: "10 вопросов — и ты понимаешь, что нужно допаковать до запуска.",
            },
            {
                id: "mini-app",
                title: "Telegram Mini App: кабинет за недели",
                track: "Mini App",
                kind: "video",
                pro: true,
                duration: "9:20",
                progress: 0,
                descr: "Потоки: главная → библиотека → ассистент → профиль → оплата.",
            },
            {
                id: "content",
                title: "Контент, который вшивает продажу экологично",
                track: "Контент",
                kind: "guide",
                pro: true,
                progress: 0,
                descr: "Рубрики, связки, офферы и CTA без агрессии.",
            },
            {
                id: "pack",
                title: "Упаковка: визуальная система и доверие",
                track: "Упаковка",
                kind: "guide",
                pro: true,
                progress: 0,
                descr: "Структура профиля/лендинга, чтобы конверсия росла.",
            },
        ],
        []
    );

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return items.filter((it) => {
            const byTrack = active === "Все" ? true : it.track === active;
            const byQ = !qq
                ? true
                : (it.title + " " + it.descr + " " + it.track).toLowerCase().includes(qq);
            // фильтр «Тесты» как отдельная вкладка
            const byActive = active === "Тесты" ? it.kind === "test" : byTrack;
            return byActive && byQ;
        });
    }, [items, active, q]);

    return (
        <div className="space-y-4">
            <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">Библиотека</div>
                        <div className="text-sm text-[#A9B3AE]">
                            Видео, инструкции и тесты — как собирать ботов, воронки и AI‑ассистентов
                        </div>
                    </div>
                    <div className="rounded-full px-3 py-1 text-xs border border-[rgba(183,168,94,0.35)] bg-[rgba(183,168,94,0.10)]">
                        PRO
                    </div>
                </div>

                <div className="mt-4">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Поиск по урокам и темам…"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#F2F4F3] placeholder:text-[#A9B3AE] outline-none focus:border-[rgba(97,255,138,0.25)]"
                    />
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {filters.map((f) => (
                        <Chip key={f} active={active === f} onClick={() => setActive(f)}>
                            {f}
                        </Chip>
                    ))}
                </div>
            </Card>

            {/* Highlight row: быстрые маршруты */}
            <div className="flex gap-3 overflow-x-auto pb-1">
                <LibraryHighlight title="Собрать бота" meta="структура + сценарий" />
                <LibraryHighlight title="Собрать воронку" meta="трафик → логика → оффер" />
                <LibraryHighlight title="Запустить AI" meta="промпт‑каркас + режимы" />
            </div>

            {/* Content list */}
            <div className="space-y-3">
                {filtered.map((it) => (
                    <LibraryItemCard key={it.id} item={it} />
                ))}
            </div>

            <Button variant="primary" className="w-full">
                Купить доступ к библиотеке
            </Button>
        </div>
    );
}

function LibraryHighlight({ title, meta }: { title: string; meta: string }) {
    return (
        <div className="shrink-0 w-[220px] rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-xs text-[#A9B3AE]">{meta}</div>
            <div className="mt-3 text-xs text-[#B7A85E]">Открыть →</div>
        </div>
    );
}

function LibraryItemCard({
                             item,
                         }: {
    item: {
        id: string;
        title: string;
        track: string;
        kind: "video" | "guide" | "test";
        pro?: boolean;
        duration?: string;
        progress?: number;
        descr: string;
    };
}) {
    const badge =
        item.kind === "video" ? "Видео" : item.kind === "guide" ? "Инструкция" : "Тест";

    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold truncate">{item.title}</div>
                        {item.pro ? (
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] border border-[rgba(183,168,94,0.40)] bg-[rgba(183,168,94,0.12)]">
                PRO
              </span>
                        ) : (
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] border border-white/10 bg-white/5 text-[#A9B3AE]">
                FREE
              </span>
                        )}
                    </div>
                    <div className="mt-1 text-xs text-[#A9B3AE]">{item.descr}</div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="rounded-full px-2 py-0.5 text-[10px] border border-white/10 bg-black/20 text-[#A9B3AE]">
            {badge}
          </span>
                    {item.duration ? (
                        <span className="text-[10px] text-[#A9B3AE]">{item.duration}</span>
                    ) : null}
                </div>
            </div>

            {/* Preview strip */}
            <div className="mt-4 grid grid-cols-[96px_1fr] gap-3">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                    <div className="relative aspect-[16/10]">
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(240px 160px at 30% 20%, rgba(97,255,138,0.14) 0%, rgba(13,36,26,0.30) 45%, rgba(0,0,0,0.45) 100%)",
                            }}
                        />
                        {item.kind === "video" ? (
                            <div className="absolute inset-0 grid place-items-center">
                                <div className="h-8 w-8 rounded-full border border-white/15 bg-black/25 backdrop-blur grid place-items-center">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#F2F4F3]" fill="currentColor">
                                        <path d="M9 7.5v9l8-4.5-8-4.5z" />
                                    </svg>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col justify-between">
                    <div className="text-xs text-[#A9B3AE]">
                        Тема: <span className="text-[#F2F4F3]">{item.track}</span>
                    </div>

                    {typeof item.progress === "number" ? (
                        <div>
                            <ProgressBar value={item.progress} />
                            <div className="mt-2 text-xs text-[#A9B3AE]">Прогресс: {item.progress}%</div>
                        </div>
                    ) : null}

                    <div className="mt-3 flex gap-2">
                        <Button variant="chip" className="px-3 py-2">
                            Открыть
                        </Button>
                        <Button variant="ghost" className="px-3 py-2">
                            В план
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

type Msg = { role: "user" | "assistant"; text: string };


function ScreenAssistant() {
    const [mode, setMode] = useState<"Воронка" | "Сценарий" | "Контент" | "Mini App">("Воронка");
    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState<Msg[]>([
        {
            role: "assistant",
            text: "Я — Чеширский проводник LESik. Скажи, что хочешь собрать: воронку, сценарий бота, контент или mini app?",
        },
    ]);

    const quick = useMemo(
        () => [
            "Собери схему по шагам",
            "Дай 3 варианта оффера",
            "Сделай цепочку догрева",
            "Напиши 5 вопросов квиза",
        ],
        []
    );

    const send = () => {
        const text = input.trim();
        if (!text) return;
        setMsgs((m) => [...m, { role: "user", text }]);
        setInput("");

        // Demo response
        setTimeout(() => {
            const hint =
                mode === "Воронка"
                    ? "Ок. Начнём с источника трафика → входа в бота → 1 действия. Какие 2–3 канала трафика у тебя уже есть?"
                    : mode === "Сценарий"
                        ? "Ок. Сценарий: приветствие → выбор → уточнение → действие. Какой конечный шаг: заявка или оплата?"
                        : mode === "Контент"
                            ? "Ок. Сделаю контент-план на 7 дней: прогрев → польза → кейс → оффер. Какая ниша и продукт?"
                            : "Ок. Mini App: главная → каталог/уроки → ассистент → профиль. Что будет главным действием внутри?";
            setMsgs((m) => [...m, { role: "assistant", text: hint }]);
        }, 320);
    };

    return (
        <div className="space-y-4">
            <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">Ассистент</div>
                        <div className="text-sm text-[#A9B3AE]">Выбирай режим и собирай систему</div>
                    </div>
                    <div className="rounded-full px-3 py-1 text-xs border border-[rgba(97,255,138,0.25)] bg-[rgba(97,255,138,0.10)]">
                        online
                    </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {([
                        "Воронка",
                        "Сценарий",
                        "Контент",
                        "Mini App",
                    ] as const).map((m) => (
                        <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                            {m}
                        </Chip>
                    ))}
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {quick.map((q) => (
                        <Button key={q} variant="chip" className="whitespace-nowrap" onClick={() => setInput(q)}>
                            {q}
                        </Button>
                    ))}
                </div>
            </Card>

            <Card className="p-4">
                <div className="max-h-[48vh] overflow-y-auto space-y-3 pr-1">
                    {msgs.map((m, i) => (
                        <div
                            key={i}
                            className={
                                "rounded-2xl border p-3 text-sm leading-relaxed " +
                                (m.role === "user"
                                    ? "ml-8 border-[rgba(97,255,138,0.20)] bg-[rgba(97,255,138,0.07)]"
                                    : "mr-8 border-white/10 bg-white/5")
                            }
                        >
                            {m.text}
                        </div>
                    ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") send();
                        }}
                        placeholder="Напиши запрос…"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#F2F4F3] placeholder:text-[#A9B3AE] outline-none focus:border-[rgba(97,255,138,0.25)]"
                    />
                    <Button onClick={send}>Отправить</Button>
                </div>

                <div className="mt-3">
                    <Button variant="ghost" className="w-full">
                        Сохранить результат
                    </Button>
                </div>
            </Card>
        </div>
    );
}

function ScreenProfile() {
    return (
        <div className="space-y-4">
            <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">Профиль</div>
                        <div className="text-sm text-[#A9B3AE]">Доступ, прогресс, проекты</div>
                    </div>
                    <div className="rounded-full px-3 py-1 text-xs border border-[rgba(183,168,94,0.35)] bg-[rgba(183,168,94,0.10)]">
                        PRO
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <Stat title="Доступ" value="Активен" hint="до 30 дней" />
                    <Stat title="Прогресс" value="32%" hint="по маршрутам" />
                </div>
            </Card>

            <Card className="p-5">
                <div className="text-sm font-semibold">Мои проекты</div>
                <div className="mt-3 space-y-2">
                    <ProjectRow title="Воронка v1" meta="Instagram → бот → заявка" />
                    <ProjectRow title="Сценарий бота" meta="квиз → сегментация → оффер" />
                    <ProjectRow title="Mini App кабинет" meta="уроки + профиль + оплата" />
                </div>
            </Card>

            <Card className="p-5">
                <div className="text-sm font-semibold">Настройки</div>
                <div className="mt-3 space-y-2">
                    <SettingsRow label="Уведомления" value="Вкл" />
                    <SettingsRow label="Тема" value="Emerald" />
                    <SettingsRow label="Язык" value="Русский" />
                </div>
            </Card>
        </div>
    );
}

function Stat({ title, value, hint }: { title: string; value: string; hint: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#A9B3AE]">{title}</div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
            <div className="mt-1 text-xs text-[#A9B3AE]">{hint}</div>
        </div>
    );
}

function ProjectRow({ title, meta }: { title: string; meta: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-xs text-[#A9B3AE]">{meta}</div>
            </div>
            <div className="text-[#B7A85E]">→</div>
        </div>
    );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-sm">{label}</div>
            <div className="text-sm text-[#A9B3AE]">{value}</div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// App shell
// ─────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<ScreenHome />} />
                <Route path="/library" element={<ScreenLibrary />} />
                <Route path="/assistant" element={<ScreenAssistant />} />
                <Route path="/profile" element={<ScreenProfile />} />
            </Routes>
        </Layout>
    );
}

export default function PrototypeTabsPage() {
    return <AppRoutes />;
}



