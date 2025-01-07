/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/v1/cities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cities
         * @description Array of `CityResource`
         */
        get: operations["city.index"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["event.index"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events/ids": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["event.allIds"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events/{event}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["event.show"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/event-formats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["eventFormat.index"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/industries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Industries
         * @description Array of `IndustryResource`
         */
        get: operations["industry.index"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/industries/slugs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preset Slugs
         * @description Array of preset slugs
         */
        get: operations["industry.allSlugs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/industries/{industry}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Industry */
        get: operations["industry.show"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/metadata": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["metadata.show"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/pages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["page.show"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["post.index"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/posts/{post}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["post.show"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/presets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Presets
         * @description Array of `PresetResource`
         */
        get: operations["preset.index"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/presets/slugs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preset Slugs
         * @description Array of preset slugs
         */
        get: operations["preset.allSlugs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/presets/{preset}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Preset */
        get: operations["preset.show"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** CityResource */
        CityResource: {
            id: number;
            title: string;
            events_count?: number;
        };
        /**
         * EventFormat
         * @enum {string}
         */
        EventFormat: "forum" | "conference" | "exhibition" | "seminar" | "webinar";
        /** EventFormatResource */
        EventFormatResource: {
            id: string;
            name: string;
            color: string;
        };
        /** EventResource */
        EventResource: {
            id: number;
            title: string;
            description: string | null;
            cover: string;
            gallery: string[];
            start_date: string;
            end_date: string;
            format: components["schemas"]["EventFormat"];
            format_label: string;
            website: string | null;
            phone: string | null;
            email: string | null;
            sort_order: number;
            city_id: number | null;
            city?: components["schemas"]["CityResource"];
            industry_id: number;
            industry?: components["schemas"]["CityResource"];
            industries?: components["schemas"]["IndustryResource"][];
            tags?: components["schemas"]["TagResource"][];
            metadata?: components["schemas"]["MetadataResource"];
            tariffs?: components["schemas"]["TariffResource"][];
            venue_id: number | null;
            venue?: components["schemas"]["VenueResource"];
        };
        /** IdResource */
        IdResource: {
            id: string;
        };
        /** IndustryResource */
        IndustryResource: {
            id: number;
            title: string;
            slug: string | null;
            events_count?: number;
        };
        /** MetadataResource */
        MetadataResource: {
            title: string | null;
            h1: string | null;
            description: string | null;
            keywords: string | null;
            canonicalUrl: string;
            robots: string | null;
            openGraph?: {
                title: string | null;
                description: string | null;
                type: string | null;
                image: string | null;
                url: string | null;
                siteName: string | null;
                locale: string | null;
            };
            twitter?: {
                card: string | null;
                title: string | null;
                description: string | null;
                image: string | null;
                site: string | null;
                creator: string | null;
            };
        };
        /** PageResource */
        PageResource: {
            path: string;
            metadata?: components["schemas"]["MetadataResource"];
            content: string | null;
            title: string | null;
        };
        /** PostResource */
        PostResource: {
            id: number;
            title: string;
            content?: string;
            cover: string | "";
            created_at?: string;
            updated_at?: string;
            deleted_at?: string;
        };
        /** PresetFiltersResource */
        PresetFiltersResource: {
            format: string;
            city_id: string;
            industry_id: string;
        };
        /** PresetResource */
        PresetResource: {
            id: number;
            title: string;
            slug: string;
            filters: components["schemas"]["PresetFiltersResource"];
            metadata?: components["schemas"]["MetadataResource"];
            description: string | null;
            sort_order: number;
        };
        /** SearchEventsResource */
        SearchEventsResource: {
            data: components["schemas"]["EventResource"][];
            presets: components["schemas"]["PresetResource"][];
            facets: {
                [key: string]: string[];
            };
            facets_stats: {
                [key: string]: {
                    [key: string]: number;
                };
            };
            meta: {
                /** @description explicitly shown for auto-documentation */
                last_page: number;
                current_page: number;
                per_page: number;
                total: number;
            };
        };
        /** SlugResource */
        SlugResource: {
            slug: string;
        };
        /** TagResource */
        TagResource: {
            id: number;
            title: string;
            events_count?: number;
        };
        /** TariffResource */
        TariffResource: {
            id: number;
            price: number;
            description: string | null;
            title: string;
            is_active: boolean;
            sort_order: number;
        };
        /** VenueResource */
        VenueResource: {
            id: number;
            title: string;
            address: string | null;
        };
    };
    responses: {
        /** @description Validation error */
        ValidationException: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Errors overview. */
                    message: string;
                    /** @description A detailed description of each field that failed validation. */
                    errors: {
                        [key: string]: string[];
                    };
                };
            };
        };
        /** @description Authorization error */
        AuthorizationException: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Error overview. */
                    message: string;
                };
            };
        };
        /** @description Not found */
        ModelNotFoundException: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Error overview. */
                    message: string;
                };
            };
        };
        /** @description Not found */
        NotFoundHttpException: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    /** @description Error overview. */
                    message: string;
                };
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "city.index": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["CityResource"][];
                    };
                };
            };
        };
    };
    "event.index": {
        parameters: {
            query?: {
                query?: string | null;
                format?: components["schemas"]["EventFormat"];
                city_id?: number | null;
                industry_id?: number | null;
                date_from?: number | null;
                date_to?: number | null;
                per_page?: number | null;
                page?: number | null;
                is_priority?: "true" | "false" | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `SearchEventsResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchEventsResource"];
                };
            };
            403: components["responses"]["AuthorizationException"];
            422: components["responses"]["ValidationException"];
        };
    };
    "event.allIds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Array of `IdResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["IdResource"][];
                    };
                };
            };
        };
    };
    "event.show": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The event ID */
                event: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `EventResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["EventResource"];
                        presets: components["schemas"]["PresetResource"][];
                    };
                };
            };
            404: components["responses"]["ModelNotFoundException"];
        };
    };
    "eventFormat.index": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Array of `EventFormatResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["EventFormatResource"][];
                    };
                };
            };
        };
    };
    "industry.index": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["IndustryResource"][];
                    };
                };
            };
        };
    };
    "industry.allSlugs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["SlugResource"][];
                    };
                };
            };
        };
    };
    "industry.show": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The industry slug */
                industry: string | null;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `IndustryResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["IndustryResource"];
                    };
                };
            };
            404: components["responses"]["ModelNotFoundException"];
        };
    };
    "metadata.show": {
        parameters: {
            query: {
                type: "event" | "metadata" | "page" | "preset" | "post" | "user";
                id: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `MetadataResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["MetadataResource"];
                    };
                };
            };
            404: components["responses"]["NotFoundHttpException"];
            422: components["responses"]["ValidationException"];
        };
    };
    "page.show": {
        parameters: {
            query: {
                path: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `PageResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["PageResource"];
                    };
                };
            };
            422: components["responses"]["ValidationException"];
        };
    };
    "post.index": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Array of `PostResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["PostResource"][];
                    };
                };
            };
        };
    };
    "post.show": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The post ID */
                post: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `PostResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["PostResource"];
                    };
                };
            };
            404: components["responses"]["ModelNotFoundException"];
        };
    };
    "preset.index": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["PresetResource"][];
                    };
                };
            };
        };
    };
    "preset.allSlugs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["SlugResource"][];
                    };
                };
            };
        };
    };
    "preset.show": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The preset slug */
                preset: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `PresetResource` */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: components["schemas"]["PresetResource"];
                    };
                };
            };
            404: components["responses"]["ModelNotFoundException"];
        };
    };
}
