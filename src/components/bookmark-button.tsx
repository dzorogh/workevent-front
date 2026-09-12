'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Route } from 'next';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function BookmarkButton({
    eventId,
    className,
}: {
    eventId: number;
    className?: string;
}) {
    const { isBookmarked, toggle } = useBookmarks();
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const bookmarked = isBookmarked(eventId);

    return (
        <button
            type="button"
            className={cn(
                'inline-flex size-10 items-center justify-center rounded-lg text-[#657087] hover:bg-[#E9E8FF] hover:text-[#4545EF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]',
                className,
            )}
            aria-label={bookmarked ? 'Убрать из закладок' : 'Добавить в закладки'}
            aria-pressed={bookmarked}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const added = !bookmarked;
                if (!toggle(eventId)) {
                    toast({
                        title: 'Не удалось сохранить на этом устройстве',
                        variant: 'destructive',
                    });
                    return;
                }
                if (added) {
                    toast({
                        title: 'Добавлено в закладки',
                        action: pathname === '/bookmarks' ? undefined : (
                            <ToastAction
                                altText="К списку"
                                onClick={() => router.push('/bookmarks' as Route)}
                            >
                                К списку
                            </ToastAction>
                        ),
                    });
                    return;
                }
                toast({ title: 'Убрано из закладок' });
            }}
        >
            {bookmarked ? (
                <IconBookmarkFilled className="size-5 text-[#4545EF]" />
            ) : (
                <IconBookmark className="size-5" stroke={1.75} />
            )}
        </button>
    );
}
