import { EventResource } from '@/lib/types';
import Link from 'next/link';
import { formatEventDates, formatPrice, createSlugWithId, cn } from '@/lib/utils';
import { Route } from 'next';
import { IconMapPin } from '@tabler/icons-react';
import HeroActions from './hero-actions';
import { discoveryChipClass, discoveryCardClass, discoveryFilterLabelClass } from '@/lib/discovery-ui';

interface InfoProps {
    event: EventResource;
    className?: string;
    hasMap?: boolean;
}

export default function Info({ event, className, hasMap }: InfoProps) {
    const additionalIndustries = event.industries
        ?.filter((industry) => industry.id !== event.industry?.id)
        .map((industry) => industry.title)
        .join(', ');

    let organizerName: string | null = null;
    if (event.website) {
        try {
            organizerName = new URL(event.website).hostname.replace(/^www\./, '');
        } catch {
            organizerName = null;
        }
    }

    const industrySlug =
        event.industries?.find((industry) => industry.id === event.industry?.id)?.slug
        ?? event.industries?.[0]?.slug;

    const activeTariffs = [...(event.tariffs ?? [])]
        .filter((tariff) => tariff.is_active)
        .sort((a, b) => a.price - b.price);
    const cheapest = activeTariffs[0];
    const venueLine = [event.venue?.title, event.venue?.address].filter(Boolean).join(', ');

    return (
        <div className={cn('flex flex-col gap-5', className)}>
            <h1 className="m-0 text-[28px] font-bold tracking-tight text-[#090D2B] min-[1200px]:text-[34px] min-[1200px]:leading-10">
                {event.title}
            </h1>

            <div className="flex flex-wrap gap-2">
                <span className={discoveryChipClass}>{formatEventDates(event)}</span>

                {event.city && (
                    <Link
                        href={`/city/${createSlugWithId(event.city.title, event.city.id)}` as Route}
                        className={discoveryChipClass}
                    >
                        {event.city.title}
                    </Link>
                )}

                {cheapest && (
                    <span className={discoveryChipClass}>от {formatPrice(cheapest.price)}</span>
                )}

                {event.format_label && (
                    <span className={discoveryChipClass}>{event.format_label}</span>
                )}

                {event.industry && industrySlug && (
                    <Link href={`/industry/${industrySlug}` as Route} className={discoveryChipClass}>
                        {event.industry.title}
                    </Link>
                )}

                {event.industry && !industrySlug && (
                    <span className={discoveryChipClass}>
                        {event.industry.title}
                        {additionalIndustries ? `, ${additionalIndustries}` : ''}
                    </span>
                )}

                {organizerName && (
                    <span className={discoveryChipClass}>{organizerName}</span>
                )}
            </div>

            {venueLine && hasMap && (
                <a
                    href="#map"
                    className="inline-flex items-start gap-1.5 text-[14px] leading-5 text-[#657087] hover:text-[#4545EF]"
                >
                    <IconMapPin className="mt-0.5 size-4 shrink-0" stroke={1.75} />
                    {venueLine}
                </a>
            )}

            {venueLine && !hasMap && (
                <div className="inline-flex items-start gap-1.5 text-[14px] leading-5 text-[#657087]">
                    <IconMapPin className="mt-0.5 size-4 shrink-0" stroke={1.75} />
                    {venueLine}
                </div>
            )}

            {activeTariffs.length > 1 && (
                <div className={`${discoveryCardClass} flex flex-col gap-2 px-5 py-4`}>
                    <div className={discoveryFilterLabelClass}>Тарифы</div>
                    <ul className="flex flex-col gap-1.5 text-[14px] text-[#090D2B]">
                        {activeTariffs.map((tariff) => (
                            <li key={tariff.id} className="flex justify-between gap-4">
                                <span className="text-[#657087]">{tariff.title}</span>
                                <span className="font-medium">{formatPrice(tariff.price)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <HeroActions event={event} />
        </div>
    );
}
