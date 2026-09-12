import { Calendar } from '@/components/ui/calendar';
import { EventResource } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { discoveryCardClass, discoveryFilterLabelClass } from '@/lib/discovery-ui';

interface CalendarComponentProps {
    event: EventResource;
}

export default function CalendarComponent({ event }: CalendarComponentProps) {
    const sameDay = event.start_date === event.end_date;

    return (
        <div className={`${discoveryCardClass} flex min-w-72 flex-col gap-4 p-5`}>
            {sameDay ? (
                <div className="flex items-baseline justify-between gap-3">
                    <div className={discoveryFilterLabelClass}>Дата проведения</div>
                    <div className="whitespace-nowrap font-semibold text-[#090D2B]">{formatDate(event.start_date)}</div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <div className={discoveryFilterLabelClass}>Начало</div>
                        <div className="whitespace-nowrap font-semibold text-[#090D2B]">{formatDate(event.start_date)}</div>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                        <div className={discoveryFilterLabelClass}>Окончание</div>
                        <div className="whitespace-nowrap font-semibold text-[#090D2B]">{formatDate(event.end_date)}</div>
                    </div>
                </div>
            )}

            <Calendar
                mode="range"
                month={new Date(event.start_date)}
                selected={{ from: new Date(event.start_date), to: new Date(event.end_date) }}
                className="w-full p-0"
                startMonth={new Date(event.start_date)}
                endMonth={new Date(event.end_date)}
            />
        </div>
    );
}
