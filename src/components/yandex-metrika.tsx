'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { isOrganizerGotoHref, reachGoal, YANDEX_METRIKA_COUNTER_ID } from './yandex-metrika-goals'

export default function YandexMetrika() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const url = `${pathname}?${searchParams}`
        window.ym?.(YANDEX_METRIKA_COUNTER_ID, 'hit', url);
    }, [pathname, searchParams])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const anchor = (event.target as Element | null)?.closest?.('a')
            if (isOrganizerGotoHref(anchor?.getAttribute('href'))) {
                reachGoal('organizer_goto')
            }
        }

        document.addEventListener('click', onClick)
        return () => document.removeEventListener('click', onClick)
    }, [])

    return null
}