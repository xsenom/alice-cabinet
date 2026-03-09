import React, { useRef } from "react";

export default function HScroll({
    children,
    className = "",
    step = 280,
}: {
    children: React.ReactNode;
    className?: string;
    step?: number;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const startScrollLeftRef = useRef(0);

    const scrollBy = (dx: number) => {
        ref.current?.scrollBy({ left: dx, behavior: "smooth" });
    };

    const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
        const el = ref.current;
        if (!el) return;
        draggingRef.current = true;
        startXRef.current = e.clientX;
        startScrollLeftRef.current = el.scrollLeft;
        el.setPointerCapture(e.pointerId);
    };

    const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
        const el = ref.current;
        if (!el || !draggingRef.current) return;
        const dx = e.clientX - startXRef.current;
        el.scrollLeft = startScrollLeftRef.current - dx;
    };

    const endDrag = () => {
        draggingRef.current = false;
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => scrollBy(-step)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-xl border border-white/10 bg-[rgba(6,17,13,0.65)] backdrop-blur hover:bg-[rgba(6,17,13,0.8)] grid place-items-center text-[#A9B3AE]"
                aria-label="Назад"
            >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18 9 12l6-6" />
                </svg>
            </button>

            <button
                type="button"
                onClick={() => scrollBy(step)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-xl border border-white/10 bg-[rgba(6,17,13,0.65)] backdrop-blur hover:bg-[rgba(6,17,13,0.8)] grid place-items-center text-[#A9B3AE]"
                aria-label="Вперёд"
            >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18 15 12 9 6" />
                </svg>
            </button>

            <div
                ref={ref}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onPointerLeave={endDrag}
                className={
                    "flex gap-4 overflow-x-auto pb-2 px-10 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing " +
                    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
                    className
                }
            >
                {children}
            </div>
        </div>
    );
}
