'use client'

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Container from "./ui/container"
import { Route } from "next"
import AppLink from "./ui/app-link"

const COOKIE_CONSENT_KEY = 'cookie-consent'

export default function CookieBanner() {

    const [isAccepted, setIsAccepted] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
            if (savedConsent === 'accepted') {
                setIsAccepted(true)
            } else {
                setIsAccepted(false)
            }
            setIsMounted(true)
        }
    }, [])

    const handleAcceptCookies = () => {
        setIsAccepted(true)
        if (typeof window !== 'undefined') {
            localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
        }
    }

    if (!isMounted) {
        return null
    }

    return (
        <div data-cookie-banner className={cn("fixed bottom-4 left-0 right-0 z-50", isAccepted ? "hidden" : "block")}>
            <Container>
                <div className="flex items-center gap-4 rounded-[16px] bg-white px-5 py-4 shadow-[0_8px_32px_rgba(9,13,43,0.12)]">
                    <div className="min-w-0 text-[14px] leading-5 text-[#090D2B]">
                        <div className="font-medium">
                            Используем куки и рекомендательные технологии
                        </div>
                        <div className="mt-1 text-[#657087]">
                            Оставаясь с нами, вы соглашаетесь на использование <AppLink href={`/` as Route} className="underline underline-offset-4">файлов куки</AppLink>.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAcceptCookies}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#4545EF] px-5 text-[14px] text-white hover:bg-[#3838d4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]"
                    >
                        Ок
                    </button>
                </div>
            </Container>
        </div>
    )
}