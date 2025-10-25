import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "ring-1 ring-inset ring-primary bg-background text-primary hover:bg-primary-dark hover:border-primary-dark hover:ring-primary-dark hover:text-white active:bg-primary-darker",
        primary:
          "ring-0! bg-linear-to-r from-primary to-primary-dark text-primary-foreground hover:from-primary-dark hover:to-primary-darker",
        success:
          "ring-0! bg-success text-success-foreground hover:bg-success-dark active:bg-success-darker",
        destructive:
          "ring-0! bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "ring-1 ring-inset ring-secondary bg-background text-secondary hover:bg-secondary active:bg-secondary",
        muted:
          "ring-1 ring-inset ring-muted-foreground-dark bg-background text-muted-foreground-dark hover:bg-muted active:bg-muted",
        ghost: "ring-0! hover:bg-accent hover:text-accent-foreground",
        link: "ring-0! text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-6 py-2 rounded-full text-sm",
        sm: "h-7 md:px-4 px-3 rounded-full text-xs",
        lg: "h-10 px-8 rounded-full text-sm ring-2",
        xl: "h-12 px-10 rounded-full text-lg [&_svg]:size-6",
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
