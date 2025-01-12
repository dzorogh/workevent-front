'use client';

import Image from 'next/image';
import Logo from '@/components/icons/logo';

interface EventCoverImageProps {
    cover?: string;
    title: string;
    size?: 'sm' | 'lg';
    priority?: boolean;
}

export default function EventCoverImage({ cover, title, size = 'sm', priority = false }: EventCoverImageProps) {

    return <div className="relative">
        {cover ?
            <div className="aspect-video border-secondary border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <Image
                    priority={priority}
                    src={cover}
                    alt={title}
                    width={size === 'sm' ? 16 * 20 : 16 * 100}
                    height={size === 'sm' ? 9 * 20 : 9 * 100}
                />
            </div>
            : <div className="flex items-center justify-center absolute inset-0">
                <Logo className="aspect-video *:fill-border" />
            </div>
        }
    </div>
} 