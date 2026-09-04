import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = | "primary" | "secondary" | "danger" | "ghost";

type ButtonSize = | "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-[#A84F37] text-white shadow-sm hover:bg-[#8F402C]",
    secondary: "border border-line bg-panel text-ink hover:bg-soft",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
    ghost: "bg-transparent text-muted hover:bg-soft hover:text-ink",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
};

export function Button({
    variant = "primary",
    size = "md",
    type = "button",
    className,
    ...props
} : ButtonProps) {
    return (
        <button
            type  = {type}
            className = {cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus",
                "disabled:cursor-not-allowed disabled:opacity-50",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    )
}