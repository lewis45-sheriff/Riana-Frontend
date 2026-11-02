"use client";

import * as React from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ButtonSize,
  type ButtonVariant,
  buttonStyles,
} from "@/components/ui/button-styles";

export { buttonStyles };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      disabled,
      icon: Icon,
      iconRight: IconRight,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(buttonStyles({ variant, size, className }), fullWidth && "w-full")}
        {...props}
      >
        {loading && <Loader2 size={15} className="absolute animate-spin" aria-hidden />}
        <span className={cn("inline-flex items-center gap-1.5", loading && "opacity-0")}>
          {Icon && <Icon size={size === "lg" ? 18 : 15} strokeWidth={2.2} aria-hidden />}
          {children}
          {IconRight && <IconRight size={15} strokeWidth={2.2} aria-hidden />}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";
