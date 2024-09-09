import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("replichat-relative replichat-overflow-hidden", className)}
    {...props}>
    <ScrollAreaPrimitive.Viewport className="replichat-h-full replichat-w-full replichat-rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "replichat-flex replichat-touch-none replichat-select-none replichat-transition-colors",
      orientation === "vertical" &&
        "replichat-h-full replichat-w-2.5 replichat-border-l replichat-border-l-transparent replichat-p-[1px]",
      orientation === "horizontal" &&
        "replichat-h-2.5 replichat-flex-col replichat-border-t replichat-border-t-transparent replichat-p-[1px]",
      className
    )}
    {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb
      className="replichat-relative replichat-flex-1 replichat-rounded-full replichat-bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
