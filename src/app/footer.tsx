import Logo from '@/components/icons/logo';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import WorkeventText from '@/components/icons/footer-brand';
const menu = [
    [
        {
            title: 'Мероприятия',
            href: '/events',
        },
        {
            title: 'Компании',
            href: '/companies',
        },
        {
            title: 'Спикеры',
            href: '/speakers',
        },
        {
            title: 'Площадки',
            href: '/venues',
        },
    ],
    [
        {
            title: 'Платные услуги',
            href: '/pricing',
        },
        {
            title: 'Обратная связь',
            href: '/feedback',
        },
        {
            title: 'Контакты',
            href: '/contacts',
        },
    ],
    [
        {
            title: 'Личный кабинет',
            href: '/login',
        },
        {
            title: 'Регистрация',
            href: '/register',
        },
    ]
]

export default function Footer() {
    return (
        <div className="pt-20 bg-gradient-to-b from-footer-background to-footer-background-dark">
            <Container>
                <div className="flex flex-col gap-12">
                    <div className="flex gap-32">
                        <div className="flex flex-col gap-20 justify-between">
                            <div className="flex flex-col gap-10">
                                <Logo className="*:fill-white" width={60} height={40} />
                                <Button variant="primary">
                                    Добавить мероприятие
                                </Button>
                            </div>
                            <div className="text-muted-foreground-dark text-sm">
                                © {new Date().getFullYear()} workevent
                            </div>
                        </div>
                        <div className="flex flex-col gap-20 justify-between">
                            <div className="flex gap-20 grow">
                                {menu.map((column, index) => (
                                    <div key={index} className="flex flex-col gap-4">
                                        {column.map((item) => (
                                            <Link key={item.href} href="/" className="text-brand-foreground text-lg">{item.title}</Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Link href="/privacy" className="text-muted-foreground-dark text-sm">Политика конфиденциальности</Link>
                            </div>
                        </div>
                    </div>
                    <WorkeventText className="w-full" />
                </div>
            </Container>
        </div>
    )
}