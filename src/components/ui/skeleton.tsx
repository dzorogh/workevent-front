import { cn } from "@/lib/utils"
import React from "react";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-brand/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
