'use client'

import Logo from "@/components/icons/logo";
import Menu from "@/app/menu";
import Auth from "@/components/auth";
import Link from "next/link";
import { useState } from "react";
import { Menu as HamburgerMenu, X as CloseIcon } from "lucide-react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="rounded-lg bg-gradient-to-r from-brand to-brand-dark p-[2px]">
            <div className={`px-4 py-2 bg-white rounded-md `}>
                <div className={`flex justify-between items-center gap-4 overflow-x-auto ${!isMenuOpen ? 'rounded-b-md' : 'rounded-b-none'}`}>
                    <Link href="/">
                        <Logo />
                    </Link>
                    <div className="hidden md:flex">
                        <Menu />
                    </div>
                    <div className="md:hidden">
                        <button className="text-brand flex items-center gap-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <CloseIcon size={40} /> : <HamburgerMenu size={40} />}
                        </button>
                    </div>
                    <Auth />
                </div>
                <div className={`md:hidden rounded-b-lg transition-all duration-300 ease-in-out ${isMenuOpen ? 'mt-4 max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <Menu isMobile={true} />
                </div>
            </div>

        </header>
    )
}