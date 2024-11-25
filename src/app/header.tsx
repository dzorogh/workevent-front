import Logo from "@/components/icons/logo";
import Menu from "@/app/menu";
import Auth from "@/components/auth";
import Link from "next/link";
export default function Header() {
    return (
        <header className="rounded-lg bg-gradient-to-r from-brand to-brand-dark p-[2px]">
            <div className="flex justify-between items-center px-4 py-2 bg-white rounded-md gap-4 overflow-x-auto">
                <Link href="/">
                    <Logo />
                </Link>
                <Menu />
                <Auth />
            </div>
        </header>
    )
}