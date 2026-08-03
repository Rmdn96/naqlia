import * as React from "react";

import { cn } from "@/utils/cn";

export const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
  ({ className, ...props }, ref) => (
    <label className={cn("text-sm font-semibold leading-none", className)} ref={ref} {...props} />
  ),
);

Label.displayName = "Label";
