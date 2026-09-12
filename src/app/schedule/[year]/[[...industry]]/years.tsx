import { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { discoveryChipActiveClass, discoveryChipClass } from "@/lib/discovery-ui";

export default function Years({ years, selectedYear }: { years: number[], selectedYear: string }) {
    const currentYear = new Date().getFullYear();
    const selected = Number(selectedYear);
    const currentYears = years.filter((year) => year >= currentYear || year === selected);
    const pastYears = years.filter((year) => year < currentYear && year !== selected);

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex flex-wrap gap-2.5">
                {currentYears.map((year) => {
                    const active = year === selected;
                    return (
                        <Link
                            id={year.toString()}
                            key={year}
                            href={`/schedule/${year}` as Route}
                            className={cn(active ? discoveryChipActiveClass : discoveryChipClass, "shrink-0")}
                        >
                            {year}
                        </Link>
                    );
                })}
            </div>
            {pastYears.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    {pastYears.map((year) => {
                        const active = year === selected;
                        return (
                            <Link
                                id={year.toString()}
                                key={year}
                                href={`/schedule/${year}` as Route}
                                className={cn(
                                    "text-[12px] leading-none transition-colors",
                                    active
                                        ? "text-[#657087] underline decoration-[#C5CAD6] underline-offset-4"
                                        : "text-[#B4BBC8] hover:text-[#8B93A7]",
                                )}
                            >
                                {year}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
