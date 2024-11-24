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
    className?: string
}

export default function AppLink<T extends string>({ 
    children, 
    href, 
    target, 
    rel, 
    className 
}: AppLinkProps<T>) {
    return (
        <Link href={href} target={target} rel={rel} className={cn(
            "text-brand hover:text-brand-dark font-medium transition-colors",
            className
        )}>
            {children}
        </Link>
    );
}

