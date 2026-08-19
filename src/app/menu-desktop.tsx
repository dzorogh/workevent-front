import AppLink from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Route } from "next";
import { getSeoYear } from "@/lib/seo/constants";

export default function MenuDesktop({ className }: { className?: string }) {
  const schedulePath = `/schedule/${getSeoYear()}` as Route;

  return (
    <nav className={className}>
      <ul className={`flex gap-x-6 gap-y-2`}>
        <li>
          <Button variant="ghost" asChild>
            <Link href={{ pathname: "/events" }}>Мероприятия</Link>
          </Button>
        </li>
        <li>
          <Button variant="ghost" asChild>
            <Link href={schedulePath}>Календарь</Link>
          </Button>
        </li>
        <li>
          <Button variant="ghost" asChild>
            <Link href={{ pathname: "/blog" }}>Блог</Link>
          </Button>
        </li>
      </ul>
    </nav>
  );
}

