import H2 from '@/components/ui/h2';
import { EventResource, SearchEventsResourceMeta } from '@/lib/types';
import EventsList from '@/components/events-list';
import { discoverySectionTitleClass } from '@/lib/discovery-ui';

interface RecommendationsProps {
    initialEvents: EventResource[];
    initialMeta: SearchEventsResourceMeta;
}

export default function Recommendations({ initialEvents, initialMeta }: RecommendationsProps) {
    return (
        <div className="flex flex-col gap-10">
            <H2 className={discoverySectionTitleClass}>Рекомендуемые мероприятия</H2>
            <div className="flex flex-col gap-10">
                <EventsList
                    initialEvents={initialEvents}
                    initialMeta={initialMeta}
                    perPage={4}
                    params={{
                        is_priority: 'true'
                    }}
                />
            </div>
        </div>
    );
}
