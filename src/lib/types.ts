import {components, operations} from './api/v1';

export type EventResource = components['schemas']['EventResource'];
export type SearchEventsResourceMeta = components["schemas"]["SearchEventsResource"]["meta"]
export type EventIndexParametersQuery = operations["event.index"]["parameters"]["query"]
export type EventFormat = components['schemas']['EventFormat'];
export type IndustryResource = components['schemas']['IndustryResource'];
export type CityResource = components['schemas']['CityResource'];
export type PresetResource = components['schemas']['PresetResource'];

export interface Location {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    class: string;
    type: string;
    place_rank: number;
    importance: number;
    addresstype: string;
    name: string;
    display_name: string;
    boundingbox: string[];
}