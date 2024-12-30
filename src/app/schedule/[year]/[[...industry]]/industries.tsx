"use client"

import { Button } from "@/components/ui/button";
import { Route } from "next";
import Link from "next/link";
import { IndustryResource } from "@/lib/api/types";
import { useEffect } from "react";

export default function Industries({ industries, industrySlug, homeRoute }: { industries: IndustryResource[], industrySlug: string | undefined, homeRoute: string }) {

    useEffect(() => {
        if (industrySlug) {
            const element = document.getElementById(industrySlug);
            if (element) {
                const parent = element.parentElement;
                if (parent) {
                    const parentWidth = parent.clientWidth;
                    const elementWidth = element.clientWidth;
                    const scrollPosition = element.offsetLeft - (parentWidth / 2) + (elementWidth / 2);
                    parent.scrollTo({
                        left: scrollPosition,
                        // behavior: "smooth"
                    });
                }
            }
        }
    }, [industrySlug]);

    return (
        <div className="flex gap-2 items-center md:flex-wrap overflow-x-auto p-2">
            <Button
                variant={industrySlug === undefined ? "brand" : "muted"}
                size="sm"
                asChild
            >
                <Link href={homeRoute as Route}>
                    Все
                </Link>
            </Button>

            {industries.map((industry: any) => (
                <Button
                    id={industry.slug}
                    variant={industry.slug === industrySlug ? "brand" : "muted"}
                    size="sm"
                    key={industry.id}
                    asChild
                >
                    <Link href={`${homeRoute}/${industry.slug}` as Route}>
                        {industry.title}
                    </Link>
                </Button>
            ))}
        </div>
    )
}