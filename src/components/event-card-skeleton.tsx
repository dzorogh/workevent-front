import { Skeleton } from "@/components/ui/skeleton";

export default function EventCardSkeleton({
    withIndustry = true,
    layout = 'grid',
}: {
    withIndustry?: boolean;
    layout?: 'grid' | 'list';
}) {
    if (layout === 'list') {
        return (
            <div className="flex items-center gap-4 rounded-2xl border p-3">
                <Skeleton className="w-28 aspect-video rounded-xl shrink-0" />
                <div className="flex flex-col gap-2 grow">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    {withIndustry && <Skeleton className="h-4 w-1/3" />}
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[365px] flex-col overflow-hidden rounded-[16px] bg-white">
            <Skeleton className="h-[222px] w-full rounded-none" />
            <div className="flex flex-col gap-2 px-5 pt-5 pb-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
                {withIndustry && <Skeleton className="h-4 w-1/2" />}
            </div>
        </div>
    );
}
