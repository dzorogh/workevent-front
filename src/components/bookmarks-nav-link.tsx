'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Route } from 'next';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { cn } from '@/lib/utils';

export default function BookmarksNavLink({
    className,
    onNavigate,
}: {
    className?: string;
    onNavigate?: () => void;
}) {
    const pathname = usePathname();
    const { ids, ready } = useBookmarks();
    const count = ids.length;
    const active = pathname === '/bookmarks';

    return (
        <Link
            href={'/bookmarks' as Route}
            aria-label={count > 0 ? `Закладки, ${count}` : 'Закладки'}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
                'relative flex size-10 items-center justify-center text-[#657087] hover:text-[#090D2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4545EF]',
                active && 'text-[#4545EF]',
                className,
            )}
        >
            {ready && count > 0 ? (
                <IconBookmarkFilled className="size-5 text-[#4545EF]" />
            ) : (
                <IconBookmark className="size-5" stroke={1.75} />
            )}
            {ready && count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4545EF] px-1 text-[10px] font-semibold leading-none text-white">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
