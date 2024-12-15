import AppLink from "@/components/ui/app-link";

export default function Menu({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <nav>
        <ul className={`flex gap-x-6 gap-y-2 ${isMobile ? 'flex-col' : ''}`}>
            <li><AppLink href="/">Мероприятия</AppLink></li>
            <li><AppLink href="/companies">Компании</AppLink></li>
            <li><AppLink href="/speakers">Спикеры</AppLink></li>
            <li><AppLink href="/services">Услуги</AppLink></li>
            <li><AppLink href="/contacts">Контакты</AppLink></li>
        </ul>
    </nav>
  );
}

