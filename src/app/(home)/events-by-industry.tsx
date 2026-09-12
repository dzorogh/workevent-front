'use client';

import { useMemo, useState } from 'react';
import { EventResource, IndustryResource, SearchEventsResourceMeta } from "@/lib/types";
import EventsList from '@/components/events-list';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconCaretDownFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const PREFERRED_TITLES = ['it', 'маркетинг', 'hr', 'финанс', 'персонал', 'реклам'];

const CHIP_ALIASES: Record<string, string> = {
    'IT': 'IT',
    'Управление персоналом': 'HR',
    'PR, реклама и маркетинг': 'Маркетинг',
    'Финансы': 'Финансы',
};

function pickVisible(industries: IndustryResource[]) {
    const preferred = industries.filter((industry) =>
        PREFERRED_TITLES.some((needle) => industry.title.toLowerCase().includes(needle))
    );
    const rest = industries.filter((industry) => !preferred.includes(industry));
    return [...preferred, ...rest];
}

const chipClass = (active: boolean) =>
    cn(
        'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]',
        active
            ? 'bg-[#4545EF] text-white'
            : 'bg-[#E9E8FF] text-[#090D2B] hover:bg-[#dcdbf8]'
    );

interface EventsByIndustryProps {
    initialIndustries: IndustryResource[];
    initialEvents: EventResource[];
    initialMeta: SearchEventsResourceMeta;
    frozen?: boolean;
}

export default function EventsByIndustry({
    initialIndustries,
    initialEvents,
    initialMeta,
    frozen = false,
}: EventsByIndustryProps) {
    const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
    const ordered = useMemo(() => pickVisible(initialIndustries), [initialIndustries]);
    const visible = ordered.slice(0, 4);
    const overflow = ordered.slice(4);
    const selectedOverflow = overflow.find((industry) => industry.id === selectedIndustry);

    const frozenEvents = useMemo(() => {
        if (!frozen || selectedIndustry == null) return initialEvents;
        return initialEvents.filter((event) => event.industry_id === selectedIndustry);
    }, [frozen, initialEvents, selectedIndustry]);

    return (
        <div className="flex flex-col">
            <div className="flex gap-3.5 overflow-x-auto pb-1 min-[768px]:flex-wrap min-[768px]:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                    type="button"
                    className={chipClass(selectedIndustry === null)}
                    onClick={() => setSelectedIndustry(null)}
                >
                    Все
                </button>
                {visible.map((industry) => (
                    <button
                        type="button"
                        className={chipClass(selectedIndustry === industry.id)}
                        key={industry.id}
                        onClick={() => setSelectedIndustry(industry.id)}
                    >
                        {CHIP_ALIASES[industry.title] ?? industry.title}
                    </button>
                ))}
                {overflow.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={chipClass(Boolean(selectedOverflow))}
                            >
                                {selectedOverflow ? (CHIP_ALIASES[selectedOverflow.title] ?? selectedOverflow.title) : 'Все отрасли'}
                                <IconCaretDownFilled className="ml-1 size-3.5 opacity-50" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-64 p-2">
                            <div className="flex flex-col">
                                {overflow.map((industry) => (
                                    <button
                                        key={industry.id}
                                        type="button"
                                        className="rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                                        onClick={() => setSelectedIndustry(industry.id)}
                                    >
                                        {industry.title}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            <div className="mt-[38px]">
                <EventsList
                    key={frozen ? String(selectedIndustry ?? 'all') : 'live'}
                    initialEvents={frozen ? frozenEvents : initialEvents}
                    initialMeta={frozen ? { ...initialMeta, total: frozenEvents.length, last_page: 1 } : initialMeta}
                    params={selectedIndustry == null ? {} : { industry_id: selectedIndustry }}
                    perPage={frozen ? 3 : 12}
                    withIndustry={selectedIndustry === null}
                    showViewControls
                    showLoadMore={!frozen}
                    frozen={frozen}
                    heading="Ближайшие события"
                />
            </div>
        </div>
    );
}
