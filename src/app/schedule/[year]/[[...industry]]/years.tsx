import { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { discoveryChipActiveClass, discoveryChipClass } from "@/lib/discovery-ui";

export default function Years({ years, selectedYear }: { years: number[], selectedYear: string }) {
    return (
        <div className="flex flex-wrap gap-2.5">
            {years.map((year) => {
                const active = year === Number(selectedYear);
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
    )
}
