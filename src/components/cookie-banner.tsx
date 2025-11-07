'use client'

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Container from "./ui/container"
import { Button } from "./ui/button"
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
        <div className={cn("fixed bottom-0 left-0 right-0 h-auto bg-secondary p-2 z-50 shadow-lg", isAccepted ? "hidden" : "block")}>
            <Container className="flex flex-row items-center mx-16 gap-4">
                <div>
                    <div>
                        Используем куки и рекомендательные технологии
                    </div>
                    <div className="text-sm">
                        Оставаясь с нами, вы соглашаетесь на использование <AppLink href={`/` as Route} className="underline">файлов куки</AppLink>.
                    </div>
                </div>
                <div className="flex flex-row gap-2 justify-between">
                    <Button variant="primary" onClick={handleAcceptCookies}>Ок</Button>
                </div>
            </Container>
        </div>
    )
}