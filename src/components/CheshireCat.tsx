import { useEffect, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number };

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function clamp(v: number, a: number, b: number) {
    return Math.max(a, Math.min(b, v));
}

export default function CheshireCat() {
    const [pos, setPos] = useState<Pt>({ x: 60, y: 60 });
    const [seed, setSeed] = useState(0);
    const first = useRef(true);

    // очень медленный цикл: 24–34с
    const cycleMs = useMemo(() => Math.round(rand(24000, 34000)), [seed]);

    useEffect(() => {
        const place = () => {
            const w = window.innerWidth || 1200;
            const h = window.innerHeight || 800;

            // держим кота подальше от формы по центру:
            // выбираем позиции ближе к краям (левый/правый сектор), но не за пределы.
            const marginX = Math.max(180, Math.round(w * 0.16));
            const marginY = Math.max(140, Math.round(h * 0.14));

            const side = Math.random() < 0.5 ? "left" : "right";
            const x =
                side === "left"
                    ? clamp(rand(0, w * 0.35), marginX, w - marginX)
                    : clamp(rand(w * 0.65, w), marginX, w - marginX);

            const y = clamp(rand(0, h * 0.45), marginY, h - marginY);

            setPos({ x, y });
        };

        if (first.current) {
            first.current = false;
            place();
        }

        const t = window.setInterval(() => {
            place();
            setSeed((s) => s + 1);
        }, cycleMs);

        const onResize = () => place();
        window.addEventListener("resize", onResize);

        return () => {
            window.clearInterval(t);
            window.removeEventListener("resize", onResize);
        };
    }, [cycleMs]);

    // seed нужен, чтобы мягко перезапускать fade-цикл (не обязательно, но даёт “появился снова”)
    return (
        <div
            key={seed}
            className="cheshire"
            style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            aria-hidden="true"
        >
            <div className="cheshire__face">
                <div className="cheshire__eyes">
                    <span className="cheshire__eye" />
                    <span className="cheshire__eye" />
                </div>

                <div className="cheshire__smile" />
                <div className="cheshire__teeth" />
            </div>
        </div>
    );
}
