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
    const isSvg = typeof cover === 'string' ? cover.endsWith('.svg') : false;

    return (
        <div className="relative aspect-video w-full border-secondary border rounded-lg overflow-hidden bg-muted">
            {cover ?
                <>
                    {!isSvg && <Image
                        src={cover}
                        alt={title}
                        className="object-cover invisible aspect-video blur scale-125 !-top-0.5"
                        onLoad={(e) => (e.target as HTMLImageElement).classList.remove('invisible')}
                        sizes={size === 'sm' ? '300px' : '1600px'}
                        priority={priority}
                        quality={40}
                        fill />}

                    <Image
                        src={cover}
                        alt={title}
                        className={`${isSvg ? 'p-4' : ''} invisible object-contain`}
                        onLoad={(e) => (e.target as HTMLImageElement).classList.remove('invisible')}
                        sizes={size === 'sm' ? '300px' : '1600px'}
                        priority={priority}
                        quality={80}
                        fill />
                </>
                : <div className="flex items-center justify-center absolute inset-0">
                    <Logo className="aspect-video *:fill-border" />
                </div>
            }


        </div>
    )
} 