import Link from "next/link";
import { ReactNode } from "react";

export default function AppLink({ children, href }: { children: ReactNode, href: string }) {
    return (
        <Link href={href} className="
            bg-gradient-to-r
            from-secondary
            to-secondary-dark
            bg-clip-text
            text-transparent
            inline-block

            font-medium

            relative
            whitespace-nowrap
            after:absolute
            after:bottom-0.5
            after:left-0.5
            after:right-0.5
            after:h-[1px]
            after:bg-transparent
            after:bg-gradient-to-r
            after:from-secondary
            after:to-secondary-dark

            after:scale-x-0
            after:origin-left
            hover:after:scale-x-100

            transition-all
            after:transition-all
        ">
            {children}
        </Link>
    );
}

