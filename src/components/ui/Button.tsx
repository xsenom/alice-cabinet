import React from "react";

type Variant = "primary" | "ghost" | "chip" | "danger";

type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    className?: string;
    variant?: Variant;
};

export default function Button({
                                   children,
                                   onClick,
                                   type = "button",
                                   disabled,
                                   className = "",
                                   variant = "primary",
                               }: Props) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition " +
        "active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 " +
        "disabled:opacity-60 disabled:cursor-not-allowed";

    const styles =
        variant === "primary"
            ? [
                // медно-янтарный градиент как на скрине
                "text-[#07120E]",
                "bg-gradient-to-b from-[#B56A18] via-[#A85A12] to-[#7E3D0A]",
                "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
                "border border-[#C57A24]/30",
                "hover:brightness-[1.03]",
            ].join(" ")
            : variant === "chip"
                ? "text-[#07120E] bg-[#A85A12] border border-[#C57A24]/30 hover:brightness-[1.03]"
                : variant === "danger"
                    ? "text-[#07120E] bg-[#A85A12] border border-[#C57A24]/30 hover:brightness-[1.03]"
                    : "text-[#07120E] bg-[#A85A12] border border-[#C57A24]/30 hover:brightness-[1.03]";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${styles} ${className}`}
        >
            {children}
        </button>
    );
}
