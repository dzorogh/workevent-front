import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary-dark active:bg-primary-darker transition-colors",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "ring-1 ring-inset ring-brand bg-background text-brand hover:bg-brand-background-dark active:bg-brand-background-darker",
        secondary:
          "ring-1 ring-inset ring-secondary bg-background text-secondary hover:bg-secondary active:bg-secondary",
        brand:
          "text-brand-foreground bg-gradient-to-r from-brand to-brand-dark ",
        muted:
          "ring-1 ring-inset ring-muted-foreground-dark bg-background text-muted-foreground-dark hover:bg-muted active:bg-muted",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-full ",
        sm: "h-7 px-4 rounded-full text-xs",
        lg: "h-10 px-8 rounded-full ",
        icon: "h-9 w-9 rounded-full ",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
