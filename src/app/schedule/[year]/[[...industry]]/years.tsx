import { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Years({ years, selectedYear }: { years: number[], selectedYear: string }) {
    return (
        <div className="flex p-2 gap-2 flex-wrap items-center justify-center">
            {years.map((year) => (
                <Link
                    key={year}
                    href={`/schedule/${year}` as Route}
                    className={cn(year === Number(selectedYear) && "flex-grow text-center bg-primary text-primary-foreground", year !== Number(selectedYear) && "bg-background ring-1 ring-inset ring-muted-foreground-dark text-muted-foreground", "md:text-3xl text-xl px-4 py-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300")}
                >
                    {year}
                </Link>
            ))}
        </div>
    )
}