import { Skeleton } from "@/components/ui/skeleton";

export default function EventCardSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            <Skeleton className="w-full rounded-lg aspect-video" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-col gap-3">   
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-5 w-1/2" />
        </div>
    );
}