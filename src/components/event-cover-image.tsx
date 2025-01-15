'use client';

import Image from 'next/image';
import Logo from '@/components/icons/logo';
import { cn } from '@/lib/utils';

interface EventCoverImageProps {
    cover?: string;
    title: string;
    size?: 'sm' | 'md' | 'lg';
    priority?: boolean;
    className?: string;
}

export default function EventCoverImage({ cover, title, size = 'sm', priority = false, className }: EventCoverImageProps) {

    return <div className="relative">
        {cover ?
            <div className={cn("aspect-video border-secondary border rounded-lg overflow-hidden bg-muted flex items-center justify-center", className)}>
                <Image
                    priority={priority}
                    src={cover}
                    alt={title}
                    width={size === 'sm' ? 16 * 20 : size === 'md' ? 16 * 30 : 16 * 100}
                    height={size === 'sm' ? 9 * 20 : size === 'md' ? 9 * 30 : 9 * 100}
                />
            </div>
            : <div className={cn("flex items-center justify-center absolute inset-0", className)}>
                <Logo className="aspect-video *:fill-border" />
            </div>
        }
    </div>
} 