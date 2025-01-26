'use client'

import { Location } from '@/lib/types'
import MapMarkerPng from '@/components/icons/map-marker.png'
import InfoLabel from './info-label'
import { EventResource } from '@/lib/types'
import React from "react";
import Map, {Marker} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; 

export default function LocationMap({ location, event }: { location: Location, event: EventResource }) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                    <InfoLabel label="Город" />
                    <div className="">{event.city?.title}</div>
                </div>
                <div className="flex items-baseline gap-2">
                    <InfoLabel label="Адрес" />
                    <div className="">{location.display_name}</div>
                </div>
            </div>

            <div className="w-full h-[500px] bg-muted rounded-lg overflow-hidden">
                <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    initialViewState={{
                        longitude: Number(location.lon),
                        latitude: Number(location.lat),
                        zoom: 10,
                        pitch: 45,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    locale={{
                        'ru': 'ru',
                    }}
                >
                    <Marker longitude={Number(location.lon)} latitude={Number(location.lat)} anchor="bottom" >
                        <img src={MapMarkerPng.src} width={60} height={60} />
                    </Marker>
                </Map>
            </div>
        </div>
    )
}