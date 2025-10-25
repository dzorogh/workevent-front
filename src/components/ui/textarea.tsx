import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg " +
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
})
Textarea.displayName = "Textarea"

export { Textarea }
