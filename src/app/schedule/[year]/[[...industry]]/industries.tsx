"use client"

import { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IndustryResource } from "@/lib/types";
import { cn } from "@/lib/utils";
import { discoveryChipActiveClass, discoveryChipClass } from "@/lib/discovery-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconCaretDownFilled } from "@tabler/icons-react";

const PREFERRED_TITLES = ['it', 'маркетинг', 'hr', 'финанс', 'персонал', 'реклам'];

const CHIP_ALIASES: Record<string, string> = {
    'IT': 'IT',
    'Управление персоналом': 'HR',
    'PR, реклама и маркетинг': 'Маркетинг',
    'Финансы': 'Финансы',
};

function orderIndustries(industries: IndustryResource[]) {
    const preferred = industries.filter((industry) =>
        PREFERRED_TITLES.some((needle) => industry.title.toLowerCase().includes(needle))
    );
    const rest = industries.filter((industry) => !preferred.includes(industry));
    return [...preferred, ...rest];
}

function chipLabel(industry: IndustryResource) {
    return CHIP_ALIASES[industry.title] ?? industry.title;
}

export default function Industries({ industries, industrySlug, homeRoute }: { industries: IndustryResource[], industrySlug: string | undefined, homeRoute: string }) {
    const [open, setOpen] = useState(false);
    const ordered = useMemo(() => orderIndustries(industries), [industries]);
    const visible = ordered.slice(0, 4);
    const overflow = ordered.slice(4);
    const selectedOverflow = overflow.find((industry) => industry.slug === industrySlug);

    return (
        <div className="flex gap-2.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
                href={homeRoute as Route}
                className={cn(industrySlug === undefined ? discoveryChipActiveClass : discoveryChipClass, "shrink-0 whitespace-nowrap")}
            >
                Все
            </Link>

            {visible.map((industry) => (
                <Link
                    id={industry.slug}
                    key={industry.id}
                    href={`${homeRoute}/${industry.slug}` as Route}
                    className={cn(industry.slug === industrySlug ? discoveryChipActiveClass : discoveryChipClass, "shrink-0 whitespace-nowrap")}
                >
                    {chipLabel(industry)}
                </Link>
            ))}

            {overflow.length > 0 && (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                selectedOverflow ? discoveryChipActiveClass : discoveryChipClass,
                                "shrink-0 whitespace-nowrap",
                            )}
                        >
                            {selectedOverflow ? chipLabel(selectedOverflow) : 'Все отрасли'}
                            <IconCaretDownFilled className="ml-1 size-3.5 opacity-50" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-72 p-2">
                        <div className="flex max-h-72 flex-col overflow-y-auto">
                            {overflow.map((industry) => (
                                <Link
                                    key={industry.id}
                                    href={`${homeRoute}/${industry.slug}` as Route}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "rounded-md px-3 py-2 text-left text-sm text-[#090D2B] hover:bg-[#F4F6FB]",
                                        industry.slug === industrySlug && "bg-[#E9E8FF] text-[#4545EF]",
                                    )}
                                >
                                    {industry.title}
                                </Link>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}
