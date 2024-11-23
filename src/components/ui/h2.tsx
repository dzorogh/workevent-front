import { cn } from "@/lib/utils"
import React from "react";

export default function H2({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h2 className={cn("mt-10 scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0", className)}>{children}</h2>;
}
