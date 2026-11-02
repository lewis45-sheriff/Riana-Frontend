import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, id: idProp, required, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = idProp || fallbackId;
    const messageId = `${inputId}-message`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-0.5 text-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span
              className="pointer-events-none absolute left-3 text-muted"
              aria-hidden
            >
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error || hint ? messageId : undefined}
            className={cn(
              "h-10 w-full rounded-(--r-input) border bg-surface px-3 text-[15px] text-foreground",
              "placeholder:text-muted transition-colors",
              "focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
              icon && "pl-9",
              error ? "border-danger" : "border-border",
              className,
            )}
            {...props}
          />
        </div>
        {(error || hint) && (
          <p
            id={messageId}
            className={cn("mt-1.5 text-xs", error ? "text-danger" : "text-muted")}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
