'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EventResource, Location } from '@/lib/types';
import MapMarkerPng from '@/components/icons/map-marker.png';
import { discoveryFilterLabelClass } from '@/lib/discovery-ui';

function resolveZoom(location: Location) {
    if (location.class === 'building' || location.addresstype === 'building') {
        return 15;
    }
    if (location.type === 'administrative' || location.addresstype === 'city') {
        return 10;
    }
    return 13;
}

function shortenDisplayName(name: string) {
    return name
        .replace(/, Центральный федеральный округ/g, '')
        .replace(/, \d{6}, Россия$/, '')
        .replace(/, Россия$/, '');
}

export default function LocationMap({ location, event }: { location: Location; event: EventResource }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [interactive, setInteractive] = useState(false);
    const lng = Number(location.lon);
    const lat = Number(location.lat);
    const zoom = resolveZoom(location);
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    const coarsePlace =
        location.type === 'administrative' ||
        location.addresstype === 'city' ||
        location.addresstype === 'state' ||
        location.addresstype === 'region';

    const addressLabel =
        event.venue?.address?.trim() ||
        (!coarsePlace ? shortenDisplayName(location.display_name) : '') ||
        [event.venue?.title, event.city?.title].filter(Boolean).join(', ') ||
        shortenDisplayName(location.display_name);

    const staticSrc = useMemo(() => {
        if (!token || !hasCoords) {
            return null;
        }

        const overlay = `pin-l+4545EF(${lng},${lat})`;
        return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlay}/${lng},${lat},${zoom},0/1280x420@2x?access_token=${token}`;
    }, [hasCoords, lat, lng, token, zoom]);

    const mapsHref = hasCoords
        ? `https://yandex.ru/maps/?pt=${lng},${lat}&z=${Math.max(zoom, 14)}&l=map`
        : undefined;

    useEffect(() => {
        const node = containerRef.current;
        if (!node || !token || !hasCoords) {
            return;
        }

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
            container: node,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom,
            pitch: 0,
        });

        const navigation = new mapboxgl.NavigationControl({ showCompass: false });

        const markerEl = document.createElement('img');
        markerEl.src = MapMarkerPng.src;
        markerEl.width = 48;
        markerEl.height = 48;
        markerEl.alt = '';
        markerEl.draggable = false;
        const marker = new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' }).setLngLat([lng, lat]);

        const resize = () => {
            map.resize();
        };

        const observer = new ResizeObserver(resize);
        observer.observe(node);

        let removed = false;
        const safeRemove = () => {
            if (removed) {
                return;
            }
            removed = true;
            map.remove();
        };

        const fallbackTimer = window.setTimeout(resize, 400);
        const giveUp = window.setTimeout(() => {
            if (map.areTilesLoaded()) {
                return;
            }

            safeRemove();
        }, 5000);

        const onReady = () => {
            if (!map.loaded() || !map.areTilesLoaded()) {
                return;
            }

            window.clearTimeout(giveUp);
            resize();
            map.addControl(navigation, 'top-right');
            marker.addTo(map);
            setInteractive(true);
        };

        map.once('idle', onReady);

        return () => {
            window.clearTimeout(fallbackTimer);
            window.clearTimeout(giveUp);
            observer.disconnect();
            map.off('idle', onReady);
            safeRemove();
            setInteractive(false);
        };
    }, [hasCoords, lat, lng, token, zoom]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-[14px] text-[#090D2B]">
                {event.city?.title && (
                    <div>
                        <span className={`${discoveryFilterLabelClass} mr-2`}>Город</span>
                        {event.city.title}
                    </div>
                )}
                {event.venue?.title && (
                    <div>
                        <span className={`${discoveryFilterLabelClass} mr-2`}>Площадка</span>
                        {event.venue.title}
                    </div>
                )}
                <div>
                    <span className={`${discoveryFilterLabelClass} mr-2`}>Адрес</span>
                    {addressLabel}
                </div>
            </div>

            <div className="relative h-[420px] w-full rounded-[16px] bg-muted">
                {staticSrc && mapsHref && (
                    <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0"
                        tabIndex={interactive ? -1 : 0}
                    >
                        <img
                            src={staticSrc}
                            alt={addressLabel}
                            className="h-full w-full rounded-[16px] object-cover"
                        />
                    </a>
                )}
                <div
                    ref={containerRef}
                    className={`absolute inset-0 rounded-[16px] ${interactive ? '' : 'invisible pointer-events-none'}`}
                />
            </div>

            {mapsHref && (
                <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium text-[#4545EF] underline-offset-4 hover:underline"
                >
                    Открыть в Яндекс.Картах
                </a>
            )}
        </div>
    );
}
