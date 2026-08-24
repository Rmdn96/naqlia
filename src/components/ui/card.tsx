import * as React from "react";

import { cn } from "@/utils/cn";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
