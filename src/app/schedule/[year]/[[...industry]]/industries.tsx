"use client"

import { Route } from "next";
import Link from "next/link";
import { IndustryResource } from "@/lib/types";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { discoveryChipActiveClass, discoveryChipClass } from "@/lib/discovery-ui";

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
                    });
                }
            }
        }
    }, [industrySlug]);

    return (
        <div className="flex gap-2.5 items-center min-[768px]:flex-wrap overflow-x-auto">
            <Link
                href={homeRoute as Route}
                className={cn(industrySlug === undefined ? discoveryChipActiveClass : discoveryChipClass, "shrink-0 whitespace-nowrap")}
            >
                Все
            </Link>

            {industries.map((industry) => (
                <Link
                    id={industry.slug}
                    key={industry.id}
                    href={`${homeRoute}/${industry.slug}` as Route}
                    className={cn(industry.slug === industrySlug ? discoveryChipActiveClass : discoveryChipClass, "shrink-0 whitespace-nowrap")}
                >
                    {industry.title}
                </Link>
            ))}
        </div>
    )
}
