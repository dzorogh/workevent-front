import { Skeleton } from "@/components/ui/skeleton";

export default function EventCardSkeleton({ withIndustry = true }: { withIndustry?: boolean }) {
    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            {withIndustry && <Skeleton className="h-5 w-1/2" />}
        </div>
    );
}