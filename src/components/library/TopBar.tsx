import React from "react";
import { TOKENS } from "../../lib/library/tokens";

export function LibraryTopBar() {
    return (
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full border flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                    <div
                        className="h-7 w-7 rounded-full"
                        style={{
                            background: "radial-gradient(circle at 30% 30%, rgba(0,230,118,0.85), rgba(0,230,118,0.05) 60%)",
                            boxShadow: "0 0 18px rgba(0,230,118,0.18)",
                        }}
                    />
                </div>
                <div className="text-[16px] font-semibold tracking-tight" style={{ color: TOKENS.text }}>
                    Илья, всё получится!
                </div>
            </div>
        </div>
    );
}
