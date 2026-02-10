// src/components/Background.tsx
import type { PropsWithChildren } from "react";
import CheshireCat from "./CheshireCat";


export default function Background({ children }: PropsWithChildren) {
    return (
        <div className="relative min-h-screen w-full bg-noise">
            {/* Cheshire cat: very slow glow/fade */}
            <CheshireCat />


            {/* floating emerald glow blobs */}
            <div
                className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl"
                style={{ background: "rgba(33,211,139,.20)" }}
            />
            <div
                className="pointer-events-none absolute right-[-120px] top-10 h-80 w-80 rounded-full blur-3xl"
                style={{ background: "rgba(231,199,122,.12)" }}
            />
            <div
                className="pointer-events-none absolute left-[35%] bottom-[-140px] h-96 w-96 rounded-full blur-3xl"
                style={{ background: "rgba(33,211,139,.14)" }}
            />

            {/* layout */}
            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-5 py-10">
                {children}
            </div>

            {/* bottom fade */}
            <div
                className="pointer-events-none absolute bottom-0 left-0 h-44 w-full"
                style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,.35))" }}
            />
        </div>
    );
}
