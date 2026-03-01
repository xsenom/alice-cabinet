import React from "react";
import { TOKENS } from "../../lib/library/tokens";

const BTN_CLASS =
    "h-10 px-5 rounded-full text-[12px] font-extrabold tracking-wide uppercase border inline-flex items-center justify-center";

const BTN_STYLE = {
    borderColor: TOKENS.orangeBorder,
    background: TOKENS.orangeBg,
    color: "#FFFFFF",
    boxShadow: "0 10px 22px rgba(255,138,0,0.18)",
} as const;

export function AppButton({
                              children,
                              onClick,
                              type = "button",
                              className = "",
                          }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    className?: string;
}) {
    return (
        <button type={type} onClick={onClick} className={`${BTN_CLASS} ${className}`.trim()} style={BTN_STYLE}>
            {children}
        </button>
    );
}

export function AppButtonLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`${BTN_CLASS} ${className}`.trim()} style={BTN_STYLE}>
      {children}
    </span>
    );
}
