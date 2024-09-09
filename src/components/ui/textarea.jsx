import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "replichat-flex replichat-min-h-[80px] replichat-w-full replichat-rounded-md replichat-border replichat-border-input replichat-bg-background replichat-px-3 replichat-py-2 replichat-text-sm replichat-ring-offset-background placeholder:replichat-text-muted-foreground focus-visible:replichat-outline-none focus-visible:replichat-ring-2 focus-visible:replichat-ring-ring focus-visible:replichat-ring-offset-2 disabled:replichat-cursor-not-allowed disabled:replichat-opacity-50",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
