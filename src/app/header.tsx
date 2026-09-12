'use client'

import Wordmark from "@/components/icons/wordmark";
import MenuDesktop from "./menu-desktop";
import MenuMobile from "./menu-mobile";
import Link from "next/link";
import { useState } from "react";
import Container from "@/components/ui/container";
import { IconSearch } from "@tabler/icons-react";
import { Route } from "next";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-10 bg-[#F6F8FC]">
            <Container>
                <div className="flex w-full min-w-0 items-center h-[72px]">
                    <Link href={{ pathname: "/" }} className="shrink-0">
                        <Wordmark />
                    </Link>
                    <MenuDesktop className="hidden min-[768px]:flex ml-8 lg:ml-10" />
                    <div className="hidden min-[768px]:flex items-center gap-3 ml-auto">
                        <Link
                            href={"/events" as Route}
                            aria-label="Поиск мероприятий"
                            className="flex size-10 items-center justify-center text-[#657087] hover:text-[#090D2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]"
                        >
                            <IconSearch className="size-5" stroke={1.75} />
                        </Link>
                        <Link
                            href={"/events/new" as Route}
                            className="inline-flex h-[38px] w-[168px] items-center justify-center rounded-full border border-[#D4DAE8] bg-white text-[14px] text-[#090D2B] hover:bg-[#E9E8FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]"
                        >
                            Добавить событие
                        </Link>
                    </div>
                    <div className="ml-auto flex items-center justify-center min-[768px]:hidden">
                        <button
                            type="button"
                            className="flex size-11 shrink-0 flex-col items-center justify-center gap-1.5 text-[#090D2B]"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Открыть меню"
                        >
                            <span className="block h-0.5 w-5 bg-current" />
                            <span className="block h-0.5 w-5 bg-current" />
                            <span className="block h-0.5 w-5 bg-current" />
                        </button>
                    </div>
                </div>
                {isMenuOpen && <MenuMobile setIsMenuOpen={setIsMenuOpen} />}
            </Container>
        </header>
    )
}
