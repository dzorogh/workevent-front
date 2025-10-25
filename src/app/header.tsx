'use client'

import Logo from "@/components/icons/logo";
import MenuDesktop from "./menu-desktop";
import MenuMobile from "./menu-mobile";
import Link from "next/link";
import { useState } from "react";
import Burger from "@/components/icons/burger.svg";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="rounded-lg md:bg-linear-to-r md:from-primary md:to-primary-dark md:p-[2px]">
            <div className={`md:px-4 py-2 bg-white rounded-md `}>
                <div className={`flex justify-between items-center gap-4 overflow-x-auto ${!isMenuOpen ? 'rounded-b-md' : 'rounded-b-none'}`}>
                    <Link href={{ pathname: "/" }}>
                        <Logo />
                    </Link> 
                    <div className="hidden md:flex">
                        <MenuDesktop />
                    </div>
                    <div className="md:hidden">
                        <Burger onClick={() => setIsMenuOpen(!isMenuOpen)} />
                    </div>
                </div>
                {isMenuOpen && <MenuMobile setIsMenuOpen={setIsMenuOpen} />}
            </div>

        </header>
    )
}