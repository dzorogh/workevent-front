'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
    interface Window {
        ym: (id: number, action: string, url: string) => void;
    }
}

export default function YandexMetrika() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const url = `${pathname}?${searchParams}`
        window.ym(99029501, 'hit', url);
    }, [pathname, searchParams])

    return null
}