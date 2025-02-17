import { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Years({ years, selectedYear }: { years: number[], selectedYear: string }) {
    return (
        <div className="flex gap-2">
            {years.map((year) => (
                <Button
                    id={year.toString()}
                    variant={year === Number(selectedYear) ? "primary" : "muted"}
                    size="sm"
                    key={year}
                    asChild
                >
                    <Link href={`/schedule/${year}` as Route}>
                        {year}
                    </Link>
                </Button>
            ))}
        </div>
    )
}