import React, { useEffect, useRef } from "react";

type NodeT = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    tw: number; // twinkle phase
    kind: "dot" | "pinterest" | "telegram" | "instagram";
};

type Props = {
    density?: number; // 40–80
};

export default function NetworkCanvasBackground({ density = 56 }: Props) {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, has: false });
    const nodesRef = useRef<NodeT[]>([]);
    const dprRef = useRef(1);

    const setup = () => {
        const canvas = ref.current;
        if (!canvas) return;

        const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
        dprRef.current = dpr;

        const w = Math.floor(window.innerWidth);
        const h = Math.floor(window.innerHeight);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const n = Math.max(40, Math.min(85, density));
        const nodes: NodeT[] = [];

        for (let i = 0; i < n; i++) {
            const baseR = 1.15 + Math.random() * 2.0;
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.20,
                vy: (Math.random() - 0.5) * 0.20,
                r: baseR,
                tw: Math.random() * Math.PI * 2,
                kind: "dot",
            });
        }

        // Place 3 special icon nodes on top band (as in logo: network w/ icons)
        const specialKinds: NodeT["kind"][] = ["pinterest", "telegram", "instagram"];
        const bandY = h * 0.22;
        const used = new Set<number>();

        for (const k of specialKinds) {
            for (let tries = 0; tries < 60; tries++) {
                const idx = Math.floor(Math.random() * nodes.length);
                if (used.has(idx)) continue;
                used.add(idx);
                nodes[idx].kind = k;
                nodes[idx].y = Math.random() * bandY;
                nodes[idx].r = 2.4;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let t0 = performance.now();

        const tick = (t: number) => {
            const dt = Math.min(40, t - t0);
            t0 = t;

            const w = window.innerWidth;
            const h = window.innerHeight;

            ctx.clearRect(0, 0, w, h);

            // Lightened forest wash + golden haze (logo vibe)
            const g = ctx.createRadialGradient(w * 0.5, h * 0.18, 0, w * 0.5, h * 0.4, Math.max(w, h));
            g.addColorStop(0, "rgba(99,217,81,0.08)");
            g.addColorStop(0.45, "rgba(151,149,82,0.06)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            const nodes = nodesRef.current;
            if (!nodes.length) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            const m = mouseRef.current;
            const px = m.has ? (m.x / w - 0.5) * 16 : 0;
            const py = m.has ? (m.y / h - 0.5) * 16 : 0;

            // Update positions
            for (const p of nodes) {
                p.x += p.vx * (dt / 16);
                p.y += p.vy * (dt / 16);
                p.tw += 0.02 * (dt / 16);

                if (p.x < -30) p.x = w + 30;
                if (p.x > w + 30) p.x = -30;
                if (p.y < -30) p.y = h + 30;
                if (p.y > h + 30) p.y = -30;
            }

            // Lines
            const maxDist = 150;
            ctx.lineWidth = 0.8;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d = Math.hypot(dx, dy);
                    if (d > maxDist) continue;

                    // Gold constellation line
                    const alpha = (1 - d / maxDist) * 0.12;
                    ctx.strokeStyle = `rgba(151,149,82,${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x + px * 0.25, a.y + py * 0.25);
                    ctx.lineTo(b.x + px * 0.25, b.y + py * 0.25);
                    ctx.stroke();
                }
            }

            // Nodes
            for (const p of nodes) {
                const x = p.x + px * 0.35;
                const y = p.y + py * 0.35;

                if (p.kind === "dot") {
                    const tw = 0.10 + (Math.sin(p.tw) + 1) * 0.08; // 0.10..0.26
                    ctx.fillStyle = `rgba(151,149,82,${tw})`;
                    ctx.beginPath();
                    ctx.arc(x, y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    drawIconNode(ctx, p.kind, x, y);
                }
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
    const stroke = "rgba(151,149,82,0.30)";
    const fill = "rgba(151,149,82,0.06)";

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
