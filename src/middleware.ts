import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Api } from "@/lib/api"

export async function middleware(request: NextRequest) {
    if (request.nextUrl.searchParams.size === 0) {
        return NextResponse.next()
    }

    const response = await Api.GET('/v1/events', {
        params: {
            query: {
                ...Object.fromEntries(request.nextUrl.searchParams.entries()),
                per_page: 1,
            }
        }
    });

    if (response.data?.presets.length === 1) {
        return NextResponse.redirect(new URL(`/events/${response.data.presets[0].slug}`, request.url), 301)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/events',
} 