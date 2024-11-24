import Api from "@/lib/api";
import { Metadata } from "next";
import Image from "next/image";
import { IconCalendar, IconMapPin, IconWorld } from "@tabler/icons-react";
import EventCoverImage from "@/components/event-cover-image";
import { notFound, redirect } from "next/navigation";
import AppLink from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { compile, run } from '@mdx-js/mdx' 
import * as runtime from 'react/jsx-runtime'
import { createEventSlug, getEventIdFromSlug } from "@/lib/utils";
import GallerySection from "@/app/event/[id]/gallery-section";

type Props = {
    params: Promise<{ id: string }>
}

const getEventData = async (params: Props['params']) => {    
    const resolvedParams = await params;
    const numericId = getEventIdFromSlug(resolvedParams.id);
    
    const event = await Api.GET(`/v1/events/{event}`, {
        params: { path: { event: Number(numericId) } }
    }).then(res => res.data?.data);

    if (!event) {
        notFound();
    }

    const correctSlug = createEventSlug(event.title, numericId);
    if (resolvedParams.id !== correctSlug) {
        redirect(`/event/${correctSlug}`);
    }

    return event;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const event = await getEventData(params);

    return {
        title: event?.title,
        description:event?.description,
        // TODO: use metadata from API
        // TODO: Add open graph and twitter metadata
    };
}

export default async function EventPage({ params }: Props) {
    const event = await getEventData(params);

    // Compile the MDX source code to a function body
    const code = String(
        await compile(event?.description ?? '', { outputFormat: 'function-body' })
    )

    // Run the compiled code with the runtime and get the default export
    const { default: Description } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
    })

    return (
        <div className="container mx-auto max-w-5xl py-10">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">{event.title}</h1>
                    
                    <div className="flex gap-6 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <IconCalendar className="w-5 h-5" />
                            <span>{new Date(event.start_date).toLocaleDateString('ru-RU')} - {new Date(event.end_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        {event.city && (
                            <div className="flex items-center gap-2">
                                <IconMapPin className="w-5 h-5" />
                                <span>{event.city.title}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cover Image */}
                <EventCoverImage cover={event.cover} title={event.title} size="lg" priority={true} />

                {/* Content */}
                <div className="grid grid-cols-[1fr_300px] gap-8">
                    <div className="flex flex-col gap-6">
                        {/* Description */}
                        <div className="prose max-w-none">
                            <Description />
                        </div>

                        {/* Gallery */}
                        {event.gallery && (
                            <GallerySection images={event.gallery} eventTitle={event.title} />
                        )}

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag, index) => (
                                    <Badge 
                                        key={tag.id}
                                    >
                                        {tag.title}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-4">
                        {event.website && (
                            <AppLink 
                                href={{ pathname: event.website }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-brand hover:text-brand-dark transition-colors"
                            >
                                <IconWorld className="w-5 h-5" />
                                Посетить сайт
                            </AppLink>
                        )}

                        {/* Event Details */}
                        <div className="rounded-lg border border-border p-4">
                            <h3 className="font-semibold mb-3">Детали мероприятия</h3>
                            <div className="flex flex-col gap-2">
                                {event.format_label && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Формат:</span>{' '}
                                        <span className="capitalize">{event.format_label}</span>
                                    </div>
                                )}
                                {event.industry && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Индустрия:</span>{' '}
                                        <span>{event.industry.title}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tariffs if available */}
                        {event.tariffs && event.tariffs.length > 0 && (
                            <div className="rounded-lg border border-border p-4">
                                <h3 className="font-semibold mb-3">Стоимость</h3>
                                <div className="flex flex-col gap-3">
                                    {event.tariffs.map(tariff => (
                                        <div key={tariff.id} className="text-sm">
                                            <div className="font-medium">{tariff.title}</div>
                                            <div className="text-brand">{tariff.price}</div>
                                            {tariff.description && (
                                                <div className="text-muted-foreground text-xs mt-1">
                                                    {tariff.description}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}