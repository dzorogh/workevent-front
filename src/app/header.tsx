'use client'

import Logo from "@/components/icons/logo";
import MenuDesktop from "./menu-desktop";
import MenuMobile from "./menu-mobile";
import Link from "next/link";
import { useState } from "react";
import Burger from "@/components/icons/burger";
import Container from "@/components/ui/container";
import LogoSmall from "@/components/icons/logo-small";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-light border-b py-1 backdrop-blur-sm sticky top-0 z-10">
            <Container>
                <div className={`flex justify-between items-center gap-4 overflow-x-auto ${!isMenuOpen ? 'rounded-b-md' : 'rounded-b-none'}`}>
                    <Link href={{ pathname: "/" }}>
                        <LogoSmall className="size-10" />
                    </Link>
                    <div className="hidden md:flex">
                        <MenuDesktop />
                    </div>
                    <div className="md:hidden flex items-center justify-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Burger />
                        </button>
                    </div>
                </div>
                {isMenuOpen && <MenuMobile setIsMenuOpen={setIsMenuOpen} />}
            </Container>
        </header>
    )
}