import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "replichat-z-50 replichat-overflow-hidden replichat-rounded-md replichat-border replichat-bg-popover replichat-px-3 replichat-py-1.5 replichat-text-sm replichat-text-popover-foreground replichat-shadow-md replichat-animate-in replichat-fade-in-0 replichat-zoom-in-95 data-[state=closed]:replichat-animate-out data-[state=closed]:replichat-fade-out-0 data-[state=closed]:replichat-zoom-out-95 data-[side=bottom]:replichat-slide-in-from-top-2 data-[side=left]:replichat-slide-in-from-right-2 data-[side=right]:replichat-slide-in-from-left-2 data-[side=top]:replichat-slide-in-from-bottom-2",
      className
    )}
    {...props} />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
