import AppLink from "@/components/ui/app-link";

export default function MenuDesktop({ className }: { className?: string }) {
  return (
    <nav className={className}>
        <ul className={`flex gap-x-6 gap-y-2`}>
            <li><AppLink href={{ pathname: "/events" }}>Мероприятия</AppLink></li>
            <li><AppLink href={{ pathname: "/schedule/2025" }}>Календарь</AppLink></li>
            <li><AppLink href={{ pathname: "/blog" }}>Блог</AppLink></li>
        </ul>
    </nav>
  );
}

