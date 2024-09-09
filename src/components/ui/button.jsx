import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "replichat-inline-flex replichat-items-center replichat-justify-center replichat-whitespace-nowrap replichat-rounded-md replichat-text-sm replichat-font-medium replichat-ring-offset-background replichat-transition-colors focus-visible:replichat-outline-none focus-visible:replichat-ring-2 focus-visible:replichat-ring-ring focus-visible:replichat-ring-offset-2 disabled:replichat-pointer-events-none disabled:replichat-opacity-50",
  {
    variants: {
      variant: {
        default: "replichat-bg-primary replichat-text-primary-foreground hover:replichat-bg-primary/90",
        destructive:
          "replichat-bg-destructive replichat-text-destructive-foreground hover:replichat-bg-destructive/90",
        outline:
          "replichat-border replichat-border-input replichat-bg-background hover:replichat-bg-accent hover:replichat-text-accent-foreground",
        secondary:
          "replichat-bg-secondary replichat-text-secondary-foreground hover:replichat-bg-secondary/80",
        ghost: "hover:replichat-bg-accent hover:replichat-text-accent-foreground",
        link: "replichat-text-primary replichat-underline-offset-4 hover:replichat-underline",
      },
      size: {
        default: "replichat-h-10 replichat-px-4 replichat-py-2",
        sm: "replichat-h-9 replichat-rounded-md replichat-px-3",
        lg: "replichat-h-11 replichat-rounded-md replichat-px-8",
        icon: "replichat-h-10 replichat-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
