import React, { useEffect, useMemo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

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

function NetworkCanvasBackground({ density = 56 }: { density?: number }) {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, has: false });
    const nodesRef = useRef<NodeT[]>([]);

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
            mouseRef.current = { x: e.clientX, y: e.clientY, has: true };
        };
        window.addEventListener("mousemove", onMove, { passive: true });

        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const tick = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;

            ctx.clearRect(0, 0, w, h);

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

            for (const p of nodes) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -20) p.x = w + 20;
                if (p.x > w + 20) p.x = -20;
                if (p.y < -20) p.y = h + 20;
                if (p.y > h + 20) p.y = -20;
            }

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

                    const alpha = (1 - d / maxDist) * 0.12;
                    ctx.strokeStyle = `rgba(183,168,94,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x + px * 0.25, a.y + py * 0.25);
                    ctx.lineTo(b.x + px * 0.25, b.y + py * 0.25);
                    ctx.stroke();
                }
            }

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
    const stroke = "rgba(183,168,94,0.28)";
    const fill = "rgba(183,168,94,0.06)";

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
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.lineTo(-3, -6);
        ctx.quadraticCurveTo(-3, -10, 1, -10);
        ctx.quadraticCurveTo(7, -10, 7, -4);
        ctx.quadraticCurveTo(7, 2, 1, 2);
        ctx.quadraticCurveTo(-1, 2, -2, 1);
        ctx.stroke();
    } else if (kind === "telegram") {
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

            {/* адаптив: мобилка + десктоп */}
            <div className="mx-auto w-full max-w-[520px] px-4 pt-5 pb-28 sm:max-w-[680px] lg:max-w-[920px]">
                {children}
            </div>

            <BottomTabs />
        </div>
    );
}

function TabIcon({ name, active }: { name: string; active?: boolean }) {
    const c = active ? "text-[#61FF8A]" : "text-[#A9B3AE]";
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

    return (
        <svg viewBox="0 0 24 24" className={`${base} ${c}`} fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
            <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
    );
}

function BottomTabs() {
    const location = useLocation();

    // ВАЖНО: /app/*
    const tabs = useMemo(
        () => [
            { to: "/app", label: "Главная", icon: "home" },
            { to: "/app/library", label: "Библиотека", icon: "library" },
            { to: "/app/assistant", label: "Ассистент", icon: "assistant" },
            { to: "/app/profile", label: "Профиль", icon: "profile" },
        ],
        []
    );

    return (
        <div className="fixed inset-x-0 bottom-0 z-20">
            <div className="mx-auto w-full max-w-[520px] px-4 pb-4 sm:max-w-[680px] lg:max-w-[920px]">
                <div className="rounded-2xl border border-white/10 bg-[rgba(6,17,13,0.78)] backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.55)]">
                    <div className="grid grid-cols-4">
                        {tabs.map((t) => {
                            const active = location.pathname === t.to || location.pathname.startsWith(t.to + "/");
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

export { Layout, Card, Button, Chip, ProgressBar };
