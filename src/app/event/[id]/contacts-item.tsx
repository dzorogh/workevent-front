import Link from "next/link";
import { Route } from "next";

export default function ContactsItem({
    link, icon, text
}: {
    link: string;
    icon: React.ReactNode;
    text: React.ReactNode;
}) {
    return <Link href={link as Route} target="_blank">
        <div className="flex items-center gap-2 bg-white rounded-sm text-primary font-medium px-4 py-2 hover:bg-primary-dark hover:text-white transition-all">
            {icon}
            {text}
        </div>
    </Link>
}