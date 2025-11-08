import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
          "ring-1 ring-inset ring-border bg-background text-muted-foreground-dark hover:bg-muted active:bg-muted",
        ghost: "ring-0! hover:bg-accent hover:text-accent-foreground",
        link: "ring-0! text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "md:h-9 h-8 md:px-6 px-4 py-2 rounded-sm text-sm",
        sm: "md:h-6 h-5 md:px-4 px-3 rounded-sm text-xs",
        lg: "md:h-10 h-9 md:px-8 px-6 md:py-2 py-1 rounded-md text-sm ring-2",
        xl: "md:h-12 h-10 md:px-10 px-8 md:py-2 py-1 rounded-md text-lg [&_svg]:size-6",
        icon: "md:h-9 h-8 md:w-9 w-8 rounded-full ",
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
