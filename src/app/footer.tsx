import Logo from '@/components/icons/logo';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import footerBg from '@/images/footer.svg';
import Image from 'next/image';

const menu = [
    [
        {
            title: 'Мероприятия',
            href: '/events',
        },
        {
            title: 'Расписание',
            href: '/schedule/2025',
        },
        {
            title: 'Компании',
            href: '/',
        },
        {
            title: 'Спикеры',
            href: '/',
        },
        {
            title: 'Площадки',
            href: '/',
        },
    ],
    [
        {
            title: 'Платные услуги',
            href: '/',
        },
        {
            title: 'Обратная связь',
            href: '/',
        },
        {
            title: 'Контакты',
            href: '/',
        },
        {
            title: 'Блог',
            href: '/blog',
        },
    ],
    [
        {
            title: 'Личный кабинет',
            href: '/',
        },
        {
            title: 'Регистрация',
            href: '/',
        },
    ]
]

export default function Footer() {
    return (
        <div className="pt-20 bg-gradient-to-b from-footer-background to-footer-background-dark">
            <Container>
                <div className="flex flex-col gap-12">
                    <div className="flex flex-wrap gap-x-32 gap-y-12">
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
                            <div className="flex flex-wrap gap-x-20 gap-y-12 grow">
                                {menu.map((column, index) => (
                                    <div key={index} className="flex flex-col gap-4">
                                        {column.map((item) => (
                                            <Link 
                                                key={item.title} 
                                                href={{ pathname: item.href }}
                                                className="text-brand-foreground text-lg"
                                            >
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Link href="/" className="text-muted-foreground-dark text-sm">Политика конфиденциальности</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Image
                            width={1258}
                            height={167}
                            src="/footer.svg"
                            unoptimized={true}
                            alt="Footer background"
                        />
                    </div>
                </div>
            </Container>
        </div>
    )
}