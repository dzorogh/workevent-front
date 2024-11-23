import {components, operations} from './v1';

export type EventResource = components['schemas']['EventResource'];
export type SearchEventsResourceMeta = components["schemas"]["SearchEventsResource"]["meta"]
export type EventIndexParametersQuery = operations["event.index"]["parameters"]["query"]
export type EventFormat = components['schemas']['EventFormat'];
export type IndustryResource = components['schemas']['IndustryResource'];
export type CityResource = components['schemas']['CityResource'];
