import React from "react";

export default function Container({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`container max-w-(--breakpoint-xl) mx-auto px-4 md:px-4 ${className}`}>
            {children}
        </div>
    );
}
