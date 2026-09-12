import React from "react";
import { cn } from "@/lib/utils";

interface EventCardGridProps {
    children: React.ReactNode;
    layout?: 'grid' | 'list';
}

export default function EventCardGrid({ children, layout = 'grid' }: EventCardGridProps) {
    if (layout === 'list') {
        return <div className="flex flex-col gap-3">{children}</div>;
    }

    return (
        <div className={cn("grid grid-cols-1 min-[768px]:grid-cols-2 min-[1200px]:grid-cols-3 gap-[17px]")}>
            {children}
        </div>
    );
}
