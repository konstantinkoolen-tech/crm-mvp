"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import {
  buttonVariants,
  type ButtonVariantProps,
} from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      type,
      variant,
      size,
      ...props
    },
    ref,
  ) => {
    const { pending } = useFormStatus();
    const isBusy = loading || (type !== "button" && pending);

    return (
      <button
        aria-busy={isBusy || undefined}
        className={cn(
          "relative",
          buttonVariants({ variant, size, className }),
        )}
        disabled={disabled || isBusy}
        ref={ref}
        type={type}
        {...props}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2",
            isBusy && "invisible",
          )}
        >
          {children}
        </span>
        {isBusy ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            <span className="sr-only">Wird verarbeitet</span>
          </span>
        ) : null}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
