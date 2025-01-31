import { XIcon } from "lucide-react";
import Link from "next/link";
import { Route } from "next";

export default function MenuMobile({ setIsMenuOpen }: { setIsMenuOpen: (isMenuOpen: boolean) => void }) {
    return (
        <nav className="z-20 fixed left-0 top-0 h-screen w-screen bg-foreground/90 flex flex-col gap-12 items-end p-4">
            <button className="self-end" onClick={() => setIsMenuOpen(false)}>
                <XIcon className="w-14 h-14 text-white" />
            </button>
            <ul className={`flex flex-col gap-8 items-end text-white font-medium pr-4 text-xl`}>
                <li><Link href={{ pathname: "/events" }}>Мероприятия</Link></li>
                <li><Link href={{ pathname: "/schedule/2025" }}>Календарь</Link></li>
                <li><Link href={{ pathname: "/blog" }}>Блог</Link></li>
            </ul>
        </nav>
    )
}