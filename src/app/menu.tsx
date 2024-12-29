import AppLink from "@/components/ui/app-link";

export default function Menu({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <nav>
        <ul className={`flex gap-x-6 gap-y-2 ${isMobile ? 'flex-col' : ''}`}>
            <li><AppLink href="/events">Мероприятия</AppLink></li>
            <li><AppLink href={{ pathname: "/schedule/2025" }}>Расписание на 2025 год</AppLink></li>
        </ul>
    </nav>
  );
}

