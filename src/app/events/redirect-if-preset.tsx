'use client';

import { PresetResource } from "@/lib/api/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Route } from "next";
export default function RedirectIfPreset({ preset }: { preset: PresetResource | undefined }) {
    const router = useRouter()

    useEffect(() => {
        if (preset) {
            router.push(`/events/${preset.slug}` as Route);
        }
    }, [preset]);

    return <></>;
}