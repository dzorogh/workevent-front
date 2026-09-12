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
                <div className="flex flex-col gap-1">
                    <div className={discoveryFilterLabelClass}>Дата проведения</div>
                    <div className="font-semibold text-[#090D2B]">{formatDate(event.start_date)}</div>
                </div>
            ) : (
                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <div className={discoveryFilterLabelClass}>Начало</div>
                        <div className="font-semibold text-[#090D2B]">{formatDate(event.start_date)}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className={discoveryFilterLabelClass}>Окончание</div>
                        <div className="font-semibold text-[#090D2B]">{formatDate(event.end_date)}</div>
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
