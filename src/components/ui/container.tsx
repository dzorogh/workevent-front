import React from "react";
import { cn } from "@/lib/utils";

export default function Container({
  children,
  className,
  width = 'content',
}: {
  children: React.ReactNode
  className?: string
  width?: 'content' | 'subscribe'
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 px-5',
        width === 'subscribe' ? 'max-w-[1472px]' : 'max-w-[1368px]',
        className,
      )}
    >
      {children}
    </div>
  );
}
