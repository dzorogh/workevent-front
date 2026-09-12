import { EventResource } from '@/lib/types';
import { Route } from 'next';
import Link from 'next/link';
import { formatPhone, encodeUrl, createSlugWithId } from '@/lib/utils';
import { IconMail, IconPhone, IconWorld } from '@tabler/icons-react';
import ContactsItem from './contacts-item';
import { ShareButtons } from './share-buttons';
import { discoveryCardClass, discoveryPrimaryButtonClass } from '@/lib/discovery-ui';

interface ContactsProps {
    event: EventResource;
}

export default function Contacts({ event }: ContactsProps) {
    return (
        <div className={`${discoveryCardClass} px-5 py-6 min-[768px]:px-8`}>
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:flex-wrap">
                    {event.website && (
                        <ContactsItem
                            link={encodeUrl(event.website, { utm_campaign: 'participate' }) as Route}
                            icon={<IconWorld className="size-5" stroke={1.75} />}
                            text={new URL(event.website).hostname.replace(/^www\./, '')}
                        />
                    )}
                    {event.email && (
                        <ContactsItem
                            link={`mailto:${event.email}`}
                            icon={<IconMail className="size-5" stroke={1.75} />}
                            text={event.email}
                        />
                    )}
                    {event.phone && (
                        <ContactsItem
                            link={`tel:${event.phone}`}
                            icon={<IconPhone className="size-5" stroke={1.75} />}
                            text={formatPhone(event.phone)}
                        />
                    )}
                </div>
                <div className="flex flex-col gap-3 min-[768px]:flex-row min-[768px]:items-center">
                    {event.website && (
                        <Link
                            target="_blank"
                            href={encodeUrl(event.website, { utm_campaign: 'participate' }) as Route}
                            className={discoveryPrimaryButtonClass}
                        >
                            Принять участие
                        </Link>
                    )}
                    <ShareButtons
                        url={`https://workevent.ru/event/${createSlugWithId(event.title, event.id)}`}
                        title={event.title}
                        image={event.cover}
                        size={36}
                    />
                </div>
            </div>
        </div>
    );
}
