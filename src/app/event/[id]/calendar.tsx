import { Calendar } from "@/components/ui/calendar"
import { EventResource } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import InfoLabel from "./info-label";

interface CalendarComponentProps {
    event: EventResource;
}

export default function CalendarComponent({ event }: CalendarComponentProps) {
    return <div className="flex flex-col gap-4 min-w-80">


        {event.start_date !== event.end_date && (
            <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                    <InfoLabel label="Дата начала" />
                    <div className="font-semibold no-wrap">{formatDate(event.start_date)}</div>
                </div>
                <div className="flex items-end">
                    <div className="font-semibold">—</div>
                </div>
                <div className="flex flex-col gap-2">
                    <InfoLabel label="Дата окончания" />
                    <div className="font-semibold no-wrap">{formatDate(event.end_date)}</div>
                </div>
            </div>
        )}

        {event.start_date === event.end_date && (
            <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                    <InfoLabel label="Дата проведения" />
                    <div className="font-semibold no-wrap">{formatDate(event.start_date)}</div>
                </div>
            </div>
        )}

        <div className="border rounded-lg">
            <Calendar
                mode="range"
                month={new Date(event.start_date)}
                selected={{ from: new Date(event.start_date), to: new Date(event.end_date) }}
                className="w-full"
                startMonth={new Date(event.start_date)}
                endMonth={new Date(event.end_date)}
            />
        </div>
    </div>
}