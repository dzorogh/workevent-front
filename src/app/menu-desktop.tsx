import Link from "next/link";
import { Route } from "next";
import { getSeoYear } from "@/lib/seo/constants";
import { cn } from "@/lib/utils";

export default function MenuDesktop({ className }: { className?: string }) {
  const schedulePath = `/schedule/${getSeoYear()}` as Route;

  return (
    <nav className={cn(className)}>
      <ul className="flex items-center gap-8 text-[15px] text-[#090D2B]">
        <li>
          <Link href={{ pathname: "/events" }} className="hover:text-[#4545EF]">
            Мероприятия
          </Link>
        </li>
        <li>
          <Link href={schedulePath} className="hover:text-[#4545EF]">
            Календарь
          </Link>
        </li>
        <li>
          <Link href={{ pathname: "/blog" }} className="hover:text-[#4545EF]">
            Журнал
          </Link>
        </li>
      </ul>
    </nav>
  );
}
