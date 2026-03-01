import React from "react";

export default function ProgressBar({ value }: { value: number }) {
    const v = Math.max(0, Math.min(100, value));
    return (
        <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden border border-white/10">
            <div
                className="h-full rounded-full"
                style={{
                    width: `${v}%`,
                    background:
                        "linear-gradient(90deg, rgba(192,122,42,0.10), rgba(192,122,42,0.85), rgba(97,255,138,0.35))",
                }}
            />
        </div>
    );
}
