import Link from "next/link";
import { ReactNode } from "react";
import type { Route } from 'next';
import { cn } from "@/lib/utils";
import { UrlObject } from "url";

type AppLinkProps<T extends string> = {
    children: ReactNode,
    href: Route<T> | UrlObject,
    target?: string,
    rel?: string,
    className?: string,
    variant?: "default" | "underline"
}

export default function AppLink<T extends string>({ 
    children, 
    variant = "default",
    href, 
    target, 
    rel, 
    className 
}: AppLinkProps<T>) {
    return (
        <Link href={href} target={target} rel={rel} className={cn(
            "text-primary hover:text-primary-dark font-medium transition-colors",
            variant === "default" ? "" : "underline underline-offset-2",
            className
        )}>
            {children}
        </Link>
    );
}

