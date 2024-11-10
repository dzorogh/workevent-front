import Image from 'next/image'

import Link from "next/link";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
    return (
        <Link href={'/'} className={"hover:scale-110 transition-transform will-change-transform"}>
            <Image priority={true} src="/logo.svg" alt="logo" width={60} height={40} className={className}/>
        </Link>
    );
}
