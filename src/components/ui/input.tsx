import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-sm " +
          "bg-input " +
          "px-4 py-2 " +
          "text-input-foreground transition-colors " +
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-input-foreground " +
          "placeholder:text-muted-foreground " +
          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus:outline-primary " +
          "disabled:cursor-not-allowed disabled:opacity-50  " +
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
