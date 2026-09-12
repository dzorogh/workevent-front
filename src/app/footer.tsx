import Wordmark from '@/components/icons/wordmark';
import Container from '@/components/ui/container';
import Link from 'next/link';
import { Route } from 'next';
import { getSeoHubs } from '@/lib/seo/hubs';

export default async function Footer() {
    const { topCities, topIndustries, seoYear } = await getSeoHubs();

    return (
        <footer data-site-footer className="bg-[#090D2B] text-white">
            <Container className="py-14 pb-28 min-[768px]:py-16 min-[768px]:pb-28">
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 min-[900px]:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))]">
                    <div className="col-span-2 flex flex-col gap-5 min-[900px]:col-span-1">
                        <Link href={{ pathname: "/" }} className="w-fit">
                            <Wordmark invert />
                        </Link>
                        <p className="max-w-xs text-[14px] leading-6 text-white/55">
                            Каталог конференций, выставок и форумов для профессионального роста.
                        </p>
                        <Link
                            href={"/events/new" as Route}
                            className="inline-flex h-[38px] w-fit items-center justify-center rounded-full bg-[#4545EF] px-4 text-[14px] text-white hover:bg-[#3838d4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                            Добавить событие
                        </Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/40">Разделы</div>
                        <Link href={{ pathname: "/events" }} className="text-[15px] text-white/80 hover:text-white">Мероприятия</Link>
                        <Link href={`/schedule/${seoYear}` as Route} className="text-[15px] text-white/80 hover:text-white">Календарь</Link>
                        <Link href={{ pathname: "/blog" }} className="text-[15px] text-white/80 hover:text-white">Журнал</Link>
                    </div>

                    {topCities.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/40">Города</div>
                            {topCities.map((city) => (
                                <Link
                                    key={city.id}
                                    href={city.href as Route}
                                    className="text-[15px] text-white/80 hover:text-white"
                                >
                                    {city.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    {topIndustries.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/40">Отрасли</div>
                            {topIndustries.map((industry) => (
                                <Link
                                    key={industry.id}
                                    href={industry.href as Route}
                                    className="text-[15px] text-white/80 hover:text-white"
                                >
                                    {industry.title}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/40">Календарь</div>
                        <Link
                            href={`/schedule/${seoYear}` as Route}
                            className="text-[15px] text-white/80 hover:text-white"
                        >
                            Календарь на {seoYear}
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex flex-row flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[13px] text-white/45">
                    <div>© {new Date().getFullYear()} workevent</div>
                    <Link href="/" className="hover:text-white">Политика конфиденциальности</Link>
                </div>
            </Container>
        </footer>
    )
}
