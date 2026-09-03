import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = | "primary" | "secondary" | "danger" | "ghost";

type ButtonSize = | "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
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
                "rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50",
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    )
}