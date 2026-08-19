import Logo from '@/components/icons/logo';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Route } from 'next';
import { getSeoYear } from '@/lib/seo/constants';
import { getSeoHubs } from '@/lib/seo/hubs';

const menu = [
    [
        {
            title: 'Мероприятия',
            href: '/events',
        },
        {
            title: 'Расписание',
            href: `/schedule/${getSeoYear()}`,
        },
        {
            title: 'Блог',
            href: '/blog',
        },
    ],
]

export default async function Footer() {
    const { topCities, topIndustries, seoYear } = await getSeoHubs();

    return (
        <div className="pt-20 bg-linear-to-b from-footer-background to-footer-background-dark">
            <Container>
                <div className="flex flex-col gap-12">
                    <div className="flex flex-wrap gap-x-32 gap-y-12">
                        <div className="flex flex-col gap-20 justify-between">
                            <div className="flex flex-col gap-10">
                                <Logo className="*:fill-white" width={60} height={40} />
                                <Button variant="success">
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
                                                className="text-primary-foreground text-lg"
                                            >
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                                {topCities.length > 0 && (
                                    <div className="flex flex-col gap-4">
                                        <div className="text-primary-foreground text-lg">Города</div>
                                        {topCities.map((city) => (
                                            <Link
                                                key={city.id}
                                                href={city.href as Route}
                                                className="text-primary-foreground/80 text-sm"
                                            >
                                                {city.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {topIndustries.length > 0 && (
                                    <div className="flex flex-col gap-4">
                                        <div className="text-primary-foreground text-lg">Отрасли</div>
                                        {topIndustries.map((industry) => (
                                            <Link
                                                key={industry.id}
                                                href={industry.href as Route}
                                                className="text-primary-foreground/80 text-sm"
                                            >
                                                {industry.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <div className="flex flex-col gap-4">
                                    <div className="text-primary-foreground text-lg">Календарь</div>
                                    <Link
                                        href={`/schedule/${seoYear}` as Route}
                                        className="text-primary-foreground/80 text-sm"
                                    >
                                        Календарь на {seoYear}
                                    </Link>
                                </div>
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
                            alt="Workevent Footer background"
                        />
                    </div>
                </div>
            </Container>
        </div>
    )
}
