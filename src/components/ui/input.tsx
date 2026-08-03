import * as React from "react";

import { cn } from "@/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        "flex min-h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55 md:text-sm",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);

Input.displayName = "Input";
