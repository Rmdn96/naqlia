import * as React from "react";

import { cn } from "@/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-28 w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
