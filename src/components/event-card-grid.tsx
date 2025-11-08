import React from "react";

interface EventCardGridProps {
    children: React.ReactNode;
}

export default function EventCardGrid({ children }: EventCardGridProps) {
    return (
        <div className="grid lg:grid-cols-4 gap-x-4 gap-y-4">
            {children}
        </div>
    );
}
