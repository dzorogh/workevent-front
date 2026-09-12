import { EventResource } from '@/lib/types';
import EventCoverImage from '@/components/event-cover-image';
import { formatEventDateBadge, cn } from '@/lib/utils';

interface ImagesProps {
    event: EventResource;
    className?: string;
}

export default function Images({ event, className }: ImagesProps) {
    const badge = formatEventDateBadge(event);

    return (
        <div className={cn('relative overflow-hidden rounded-[16px]', className)}>
            <EventCoverImage
                cover={event.cover}
                title={event.title}
                size="lg"
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="rounded-[16px] border-0"
            />
            <div className="absolute left-[13px] top-[13px] flex min-h-16 min-w-[72px] flex-col justify-center rounded-[12px] bg-white px-3.5 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                <div className="text-[20px] font-semibold leading-none tracking-tight text-[#090D2B]">
                    {badge.day}
                </div>
                <div className="mt-1.5 text-[12px] leading-none text-[#657087]">{badge.month}</div>
            </div>
        </div>
    );
}
