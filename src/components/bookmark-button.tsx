'use client';

import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useToast } from '@/hooks/use-toast';
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
            onClick={() => {
                if (!toggle(eventId)) {
                    toast({
                        title: 'Не удалось сохранить на этом устройстве',
                        variant: 'destructive',
                    });
                }
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
