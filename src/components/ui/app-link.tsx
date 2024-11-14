import Link from "next/link";
import { ReactNode } from "react";
import type { Route } from 'next'

export default function AppLink<T extends string>({ children, href }: { children: ReactNode, href: Route<T> | URL }) {
    return (
        <Link href={href} className="
            text-brand
            hover:text-brand-dark
            font-medium
            transition-colors
        ">
            {children}
        </Link>
    );
}

