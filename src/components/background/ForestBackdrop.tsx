import React from "react";

export default function ForestBackdrop() {
    return (
        <div className="fixed inset-0 -z-20 pointer-events-none">
            {/* Светлее общий подсвет */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(1100px 700px at 50% 10%, rgba(26,90,56,0.35) 0%, rgba(6,17,13,0.72) 55%, rgba(2,8,6,0.92) 100%)",
                }}
            />

            {/* Силуэт леса (мягкий, без “мультяшности”) */}
            <svg
                className="absolute inset-x-0 bottom-0 w-full"
                viewBox="0 0 1440 260"
                preserveAspectRatio="none"
                aria-hidden
            >
                <defs>
                    <linearGradient id="forestFade" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="rgba(0,0,0,0)" />
                        <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
                    </linearGradient>
                </defs>

                <path
                    d="M0,210 C120,180 180,220 300,190 C380,170 460,130 560,160 C660,190 720,120 820,150 C930,185 1010,140 1120,165 C1240,195 1320,170 1440,190 L1440,260 L0,260 Z"
                    fill="rgba(9,38,24,0.55)"
                />
                <path
                    d="M0,185 C140,160 250,205 360,170 C470,135 560,110 650,140 C740,170 800,100 910,135 C1020,170 1110,120 1200,145 C1320,175 1380,155 1440,160 L1440,260 L0,260 Z"
                    fill="rgba(14,58,36,0.35)"
                />
                <rect x="0" y="0" width="1440" height="260" fill="url(#forestFade)" />
            </svg>
        </div>
    );
}
