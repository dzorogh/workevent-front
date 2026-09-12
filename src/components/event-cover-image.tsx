'use client';

import Image, { getImageProps } from 'next/image';
import Logo from '@/components/icons/logo';
import { cn } from '@/lib/utils';

interface EventCoverImageProps {
    cover?: string;
    title: string;
    size?: 'sm' | 'md' | 'lg';
    priority?: boolean;
    sizes?: string;
    className?: string;
}

const SIZE_PX = {
    sm: { width: 16 * 20, height: 9 * 20, sizes: '320px' },
    md: { width: 16 * 30, height: 9 * 30, sizes: '480px' },
    lg: { width: 16 * 100, height: 9 * 100, sizes: '100vw' },
} as const;

const prefetchedCovers = new Set<string>();

function coverImageProps(cover: string, size: keyof typeof SIZE_PX = 'sm', sizes?: string) {
    const dimensions = SIZE_PX[size];

    return getImageProps({
        src: cover,
        alt: '',
        width: dimensions.width,
        height: dimensions.height,
        sizes: sizes ?? dimensions.sizes,
    }).props;
}

export function prefetchEventCover(cover?: string, size: keyof typeof SIZE_PX = 'sm', sizes?: string) {
    if (!cover || prefetchedCovers.has(cover)) {
        return;
    }

    prefetchedCovers.add(cover);

    const { src, srcSet, sizes: imageSizes } = coverImageProps(cover, size, sizes);
    const image = new window.Image();
    image.decoding = 'async';
    if (srcSet) {
        image.srcset = srcSet;
    }
    if (imageSizes) {
        image.sizes = imageSizes;
    }
    image.src = src;
}

export default function EventCoverImage({
    cover,
    title,
    size = 'sm',
    priority = false,
    sizes,
    className,
}: EventCoverImageProps) {
    const dimensions = SIZE_PX[size];

    return (
        <div className={cn("relative aspect-video overflow-hidden rounded-[22px] bg-muted flex items-center justify-center", className)}>
            {cover ? (
                <Image
                    priority={priority}
                    src={cover}
                    alt={title}
                    width={dimensions.width}
                    height={dimensions.height}
                    sizes={sizes ?? dimensions.sizes}
                    className="h-full w-full object-cover object-center"
                />
            ) : (
                <Logo className="aspect-video *:fill-border" />
            )}
        </div>
    );
}
