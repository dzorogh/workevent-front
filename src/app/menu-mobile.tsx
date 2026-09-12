import { XIcon } from "lucide-react";
import Link from "next/link";
import { Route } from "next";
import { getSeoYear } from "@/lib/seo/constants";

export default function MenuMobile({ setIsMenuOpen }: { setIsMenuOpen: (isMenuOpen: boolean) => void }) {
    const schedulePath = `/schedule/${getSeoYear()}` as Route;

    return (
        <nav className="z-20 fixed inset-0 bg-foreground/90 flex flex-col gap-12 items-end p-4">
            <button className="self-end" onClick={() => setIsMenuOpen(false)}>
                <XIcon className="w-14 h-14 text-white" />
            </button>
            <ul className="flex flex-col gap-8 items-end text-white font-medium pr-4 text-xl">
                <li><Link href={{ pathname: "/events" }} onClick={() => setIsMenuOpen(false)}>Мероприятия</Link></li>
                <li><Link href={schedulePath} onClick={() => setIsMenuOpen(false)}>Календарь</Link></li>
                <li><Link href={{ pathname: "/blog" }} onClick={() => setIsMenuOpen(false)}>Журнал</Link></li>
                <li><Link href={"/events" as Route} onClick={() => setIsMenuOpen(false)}>Поиск</Link></li>
                <li><Link href={"/events/new" as Route} onClick={() => setIsMenuOpen(false)}>Добавить событие</Link></li>
            </ul>
        </nav>
    )
}
